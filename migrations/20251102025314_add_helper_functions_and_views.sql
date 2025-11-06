/*
  # Helper Functions and Views
  
  1. Functions
    - `calculate_user_level` - Calculate user level from points
    - `update_daily_summary` - Update daily wellness summary
    - `check_achievements` - Check and award achievements
    - `calculate_streak` - Calculate current streak
  
  2. Views
    - `user_wellness_dashboard` - Comprehensive user wellness overview
    - `popular_programs` - Most enrolled programs
    - `active_challenges` - Currently active challenges
  
  3. Triggers
    - Auto-update daily summaries when activities are logged
    - Auto-check achievements when milestones are reached
*/

-- Function: Calculate user level from points
CREATE OR REPLACE FUNCTION calculate_user_level(points integer)
RETURNS integer AS $$
BEGIN
  -- Level formula: level = floor(sqrt(points / 100)) + 1
  RETURN FLOOR(SQRT(points::float / 100.0))::integer + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Update daily summary
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
DECLARE
  summary_date date;
  activities_count integer;
  total_mins integer;
  focus_count integer;
  avg_mood numeric;
BEGIN
  summary_date := DATE(NEW.completed_at);
  
  -- Calculate metrics for the day
  SELECT 
    COUNT(*),
    SUM(duration_minutes),
    COUNT(DISTINCT focus_area_id),
    AVG((mood_before + mood_after) / 2.0)
  INTO activities_count, total_mins, focus_count, avg_mood
  FROM wellness_activities
  WHERE user_id = NEW.user_id
    AND DATE(completed_at) = summary_date;
  
  -- Insert or update daily summary
  INSERT INTO daily_wellness_summary (
    user_id, 
    date, 
    total_activities, 
    total_minutes, 
    focus_areas_engaged, 
    overall_mood
  )
  VALUES (
    NEW.user_id,
    summary_date,
    activities_count,
    total_mins,
    focus_count,
    avg_mood
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_activities = activities_count,
    total_minutes = total_mins,
    focus_areas_engaged = focus_count,
    overall_mood = avg_mood,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate streak
CREATE OR REPLACE FUNCTION calculate_streak(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  streak_count integer := 0;
  check_date date := CURRENT_DATE;
  has_activity boolean;
BEGIN
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM wellness_activities
      WHERE user_id = p_user_id
        AND DATE(completed_at) = check_date
    ) INTO has_activity;
    
    IF NOT has_activity THEN
      EXIT;
    END IF;
    
    streak_count := streak_count + 1;
    check_date := check_date - INTERVAL '1 day';
    
    -- Limit check to prevent infinite loops
    IF streak_count > 1000 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Check and award achievements
CREATE OR REPLACE FUNCTION check_achievements()
RETURNS TRIGGER AS $$
DECLARE
  achievement_record RECORD;
  user_progress numeric;
  activities_count integer;
  current_streak integer;
BEGIN
  -- Calculate current streak
  current_streak := calculate_streak(NEW.user_id);
  
  -- Count total activities
  SELECT COUNT(*) INTO activities_count
  FROM wellness_activities
  WHERE user_id = NEW.user_id;
  
  -- Check each achievement
  FOR achievement_record IN 
    SELECT * FROM achievements
  LOOP
    -- Check if user already has this achievement
    IF NOT EXISTS (
      SELECT 1 FROM user_achievements
      WHERE user_id = NEW.user_id
        AND achievement_id = achievement_record.id
        AND progress >= achievement_record.criteria_value
    ) THEN
      -- Calculate progress based on criteria type
      user_progress := 0;
      
      IF achievement_record.criteria_type = 'activities_completed' THEN
        user_progress := activities_count;
      ELSIF achievement_record.criteria_type = 'streak_days' THEN
        user_progress := current_streak;
      ELSIF achievement_record.criteria_type = 'focus_areas_week' THEN
        SELECT COUNT(DISTINCT focus_area_id) INTO user_progress
        FROM wellness_activities
        WHERE user_id = NEW.user_id
          AND completed_at >= CURRENT_DATE - INTERVAL '7 days';
      END IF;
      
      -- Insert or update achievement progress
      INSERT INTO user_achievements (user_id, achievement_id, progress, earned_at)
      VALUES (
        NEW.user_id,
        achievement_record.id,
        user_progress,
        CASE WHEN user_progress >= achievement_record.criteria_value THEN now() ELSE NULL END
      )
      ON CONFLICT (user_id, achievement_id)
      DO UPDATE SET
        progress = user_progress,
        earned_at = CASE WHEN user_progress >= achievement_record.criteria_value THEN now() ELSE user_achievements.earned_at END;
      
      -- Award points if achievement is completed
      IF user_progress >= achievement_record.criteria_value THEN
        INSERT INTO user_points (user_id, total_points, level)
        VALUES (
          NEW.user_id,
          achievement_record.points,
          calculate_user_level(achievement_record.points)
        )
        ON CONFLICT (user_id)
        DO UPDATE SET
          total_points = user_points.total_points + achievement_record.points,
          level = calculate_user_level(user_points.total_points + achievement_record.points),
          current_streak = current_streak,
          longest_streak = GREATEST(user_points.longest_streak, current_streak),
          last_activity_date = CURRENT_DATE;
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_daily_summary'
  ) THEN
    CREATE TRIGGER trigger_update_daily_summary
      AFTER INSERT ON wellness_activities
      FOR EACH ROW
      EXECUTE FUNCTION update_daily_summary();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_check_achievements'
  ) THEN
    CREATE TRIGGER trigger_check_achievements
      AFTER INSERT ON wellness_activities
      FOR EACH ROW
      EXECUTE FUNCTION check_achievements();
  END IF;
END $$;

-- View: User wellness dashboard
CREATE OR REPLACE VIEW user_wellness_dashboard AS
SELECT 
  up.id as user_id,
  up.display_name,
  COALESCE(upt.total_points, 0) as total_points,
  COALESCE(upt.level, 1) as level,
  COALESCE(upt.current_streak, 0) as current_streak,
  COALESCE(upt.longest_streak, 0) as longest_streak,
  COUNT(DISTINCT wa.id) as total_activities,
  COUNT(DISTINCT wa.focus_area_id) as focus_areas_tried,
  COUNT(DISTINCT ua.achievement_id) as achievements_earned,
  COUNT(DISTINCT upr.id) as active_programs,
  COUNT(DISTINCT cp.challenge_id) as active_challenges
FROM user_profiles up
LEFT JOIN user_points upt ON up.id = upt.user_id
LEFT JOIN wellness_activities wa ON up.id = wa.user_id
LEFT JOIN user_achievements ua ON up.id = ua.user_id AND ua.earned_at IS NOT NULL
LEFT JOIN user_programs upr ON up.id = upr.user_id AND upr.status = 'active'
LEFT JOIN challenge_participants cp ON up.id = cp.user_id AND cp.completed = false
GROUP BY up.id, up.display_name, upt.total_points, upt.level, upt.current_streak, upt.longest_streak;

-- View: Popular programs
CREATE OR REPLACE VIEW popular_programs AS
SELECT 
  wp.id,
  wp.title,
  wp.description,
  wp.duration_days,
  wp.difficulty_level,
  wfa.name as focus_area_name,
  wfa.color as focus_area_color,
  COUNT(DISTINCT uprog.user_id) as enrolled_count,
  COUNT(DISTINCT CASE WHEN uprog.status = 'completed' THEN uprog.user_id END) as completed_count
FROM wellness_programs wp
JOIN wellness_focus_areas wfa ON wp.focus_area_id = wfa.id
LEFT JOIN user_programs uprog ON wp.id = uprog.program_id
WHERE wp.is_active = true
GROUP BY wp.id, wp.title, wp.description, wp.duration_days, wp.difficulty_level, wfa.name, wfa.color
ORDER BY enrolled_count DESC;

-- View: Active challenges
CREATE OR REPLACE VIEW active_challenges AS
SELECT 
  wc.id,
  wc.title,
  wc.description,
  wc.start_date,
  wc.end_date,
  wc.target_type,
  wc.target_value,
  wfa.name as focus_area_name,
  wfa.color as focus_area_color,
  COUNT(DISTINCT cp.user_id) as participants_count,
  COUNT(DISTINCT CASE WHEN cp.completed = true THEN cp.user_id END) as completed_count
FROM wellness_challenges wc
JOIN wellness_focus_areas wfa ON wc.focus_area_id = wfa.id
LEFT JOIN challenge_participants cp ON wc.id = cp.challenge_id
WHERE wc.end_date >= CURRENT_DATE
GROUP BY wc.id, wc.title, wc.description, wc.start_date, wc.end_date, wc.target_type, wc.target_value, wfa.name, wfa.color
ORDER BY wc.start_date DESC;