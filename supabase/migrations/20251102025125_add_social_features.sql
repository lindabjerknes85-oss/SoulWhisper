/*
  # Social Features
  
  1. New Tables
    - `user_connections` - Friend connections between users
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `friend_id` (uuid) - Reference to auth.users
      - `status` (text) - pending/accepted/blocked
      - `requested_at` (timestamptz)
      - `accepted_at` (timestamptz, nullable)
    
    - `activity_shares` - Share activities with others
      - `id` (uuid, primary key)
      - `activity_id` (uuid) - Reference to wellness_activities
      - `user_id` (uuid) - Reference to auth.users
      - `share_type` (text) - public/friends/specific
      - `shared_with` (uuid[], nullable) - Array of user_ids
      - `message` (text, nullable)
      - `created_at` (timestamptz)
    
    - `activity_reactions` - Reactions to shared activities
      - `id` (uuid, primary key)
      - `share_id` (uuid) - Reference to activity_shares
      - `user_id` (uuid) - Reference to auth.users
      - `reaction_type` (text) - like/celebrate/support/inspire
      - `created_at` (timestamptz)
    
    - `activity_comments` - Comments on shared activities
      - `id` (uuid, primary key)
      - `share_id` (uuid) - Reference to activity_shares
      - `user_id` (uuid) - Reference to auth.users
      - `comment_text` (text)
      - `created_at` (timestamptz)
    
    - `wellness_groups` - Community groups
      - `id` (uuid, primary key)
      - `name` (text) - Group name
      - `description` (text)
      - `focus_area_id` (uuid, nullable) - Reference to wellness_focus_areas
      - `privacy_type` (text) - public/private
      - `created_by` (uuid) - Reference to auth.users
      - `created_at` (timestamptz)
    
    - `group_members` - Group membership
      - `id` (uuid, primary key)
      - `group_id` (uuid) - Reference to wellness_groups
      - `user_id` (uuid) - Reference to auth.users
      - `role` (text) - admin/moderator/member
      - `joined_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Friend-based access controls
    - Group-based permissions
*/

-- Create user_connections table
CREATE TABLE IF NOT EXISTS user_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  requested_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  CHECK (user_id != friend_id),
  UNIQUE(user_id, friend_id)
);

ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections"
  ON user_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create connections"
  ON user_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON user_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete own connections"
  ON user_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create activity_shares table
CREATE TABLE IF NOT EXISTS activity_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES wellness_activities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_type text NOT NULL CHECK (share_type IN ('public', 'friends', 'specific')),
  shared_with uuid[],
  message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shares"
  ON activity_shares FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public shares"
  ON activity_shares FOR SELECT
  TO authenticated
  USING (share_type = 'public');

CREATE POLICY "Friends can view friend shares"
  ON activity_shares FOR SELECT
  TO authenticated
  USING (
    share_type = 'friends' AND
    EXISTS (
      SELECT 1 FROM user_connections
      WHERE user_connections.status = 'accepted'
      AND ((user_connections.user_id = activity_shares.user_id AND user_connections.friend_id = auth.uid())
        OR (user_connections.friend_id = activity_shares.user_id AND user_connections.user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can insert own shares"
  ON activity_shares FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shares"
  ON activity_shares FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create activity_reactions table
CREATE TABLE IF NOT EXISTS activity_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id uuid NOT NULL REFERENCES activity_shares(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'celebrate', 'support', 'inspire')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(share_id, user_id)
);

ALTER TABLE activity_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions"
  ON activity_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add reactions"
  ON activity_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON activity_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create activity_comments table
CREATE TABLE IF NOT EXISTS activity_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id uuid NOT NULL REFERENCES activity_shares(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON activity_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add comments"
  ON activity_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON activity_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON activity_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create wellness_groups table
CREATE TABLE IF NOT EXISTS wellness_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  focus_area_id uuid REFERENCES wellness_focus_areas(id) ON DELETE SET NULL,
  privacy_type text DEFAULT 'public' CHECK (privacy_type IN ('public', 'private')),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wellness_groups ENABLE ROW LEVEL SECURITY;

-- Create group_members table (before wellness_groups policies that reference it)
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES wellness_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Now create wellness_groups policies
CREATE POLICY "Anyone can view public groups"
  ON wellness_groups FOR SELECT
  TO authenticated
  USING (privacy_type = 'public');

CREATE POLICY "Members can view private groups"
  ON wellness_groups FOR SELECT
  TO authenticated
  USING (
    privacy_type = 'private' AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = wellness_groups.id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups"
  ON wellness_groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Create group_members policies
CREATE POLICY "Members can view group members"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wellness_groups
      WHERE wellness_groups.id = group_members.group_id
      AND (wellness_groups.privacy_type = 'public' OR
        EXISTS (
          SELECT 1 FROM group_members gm
          WHERE gm.group_id = wellness_groups.id
          AND gm.user_id = auth.uid()
        ))
    )
  );

CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_connections_user ON user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_friend ON user_connections(friend_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);
CREATE INDEX IF NOT EXISTS idx_activity_shares_user ON activity_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_shares_activity ON activity_shares(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_reactions_share ON activity_reactions(share_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_share ON activity_comments(share_id);
CREATE INDEX IF NOT EXISTS idx_wellness_groups_focus_area ON wellness_groups(focus_area_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);