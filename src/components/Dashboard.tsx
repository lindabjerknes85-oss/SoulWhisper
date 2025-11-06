import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MoodTracker } from './MoodTracker';
import { JournalEntry } from './JournalEntry';
import { MindfulnessSession } from './MindfulnessSession';
import { AIMoodAnalysis } from './AIMoodAnalysis';
import { SmartContentGenerator } from './SmartContentGenerator';
import { DailyWellnessRitual } from './DailyWellnessRitual';
import { CommunityProgress } from './CommunityProgress';
import { VoiceJournal } from './VoiceJournal';
import { GratitudeJournal } from './GratitudeJournal';
import { BalanceDashboard } from './BalanceDashboard';
import { Pricing } from './Pricing';
import { useSubscription } from '../hooks/useSubscription';
import {
  Heart,
  Brain,
  Smile,
  Users,
  Sparkles,
  Leaf,
  Briefcase,
  DollarSign,
  TrendingUp,
  Award,
  Target,
  LogOut,
  Mic,
  Sunrise,
  Scale,
  MessageCircle,
  Crown
} from 'lucide-react';

interface WellnessMetric {
  dimension: string;
  score: number;
  trend: number;
}

interface UserStats {
  totalPoints: number;
  currentStreak: number;
  achievementsCount: number;
}

const dimensionIcons: Record<string, any> = {
  Physical: Heart,
  Mental: Brain,
  Emotional: Smile,
  Social: Users,
  Spiritual: Sparkles,
  Environmental: Leaf,
  Occupational: Briefcase,
  Financial: DollarSign,
};

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { subscription, isPremiumOrHigher } = useSubscription();
  const [metrics, setMetrics] = useState<WellnessMetric[]>([]);
  const [stats, setStats] = useState<UserStats>({ totalPoints: 0, currentStreak: 0, achievementsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showMindfulness, setShowMindfulness] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [showContentGenerator, setShowContentGenerator] = useState(false);
  const [showDailyRitual, setShowDailyRitual] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showVoiceJournal, setShowVoiceJournal] = useState(false);
  const [showGratitude, setShowGratitude] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const { data: metricsData } = await supabase
        .from('wellness_metrics')
        .select('dimension, score, trend')
        .eq('user_id', user.id)
        .order('dimension');

      const { data: pointsData } = await supabase
        .from('user_points')
        .select('total_points, current_streak')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      setMetrics(metricsData || []);
      setStats({
        totalPoints: pointsData?.total_points || 0,
        currentStreak: pointsData?.current_streak || 0,
        achievementsCount: achievementsData?.length || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-teal-600 text-xl">Loading your wellness journey...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-teal-400 to-blue-500 p-2 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">SoulWhisper</h1>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPricing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 rounded-lg transition font-medium"
              >
                <Crown className="w-4 h-4" />
                {subscription?.plan_name === 'Free' ? 'Upgrade' : subscription?.plan_name}
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-teal-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-700">Total Points</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalPoints}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-700">Current Streak</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.currentStreak} days</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-700">Achievements</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.achievementsCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Your Wellness Dimensions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => {
              const Icon = dimensionIcons[metric.dimension] || Heart;
              return (
                <div key={metric.dimension} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-gradient-to-br from-teal-400 to-blue-500 p-2 rounded-lg">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-700">{metric.dimension}</h3>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{metric.score}</p>
                      <p className="text-xs text-gray-500">out of 100</p>
                    </div>
                    <div className={`text-sm font-medium ${metric.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.trend >= 0 ? '+' : ''}{metric.trend}%
                    </div>
                  </div>
                  <div className="mt-3 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Wellness Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowDailyRitual(true)}
                className="w-full text-left px-4 py-3 bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 rounded-lg transition border border-orange-200"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sunrise className="w-4 h-4 text-orange-600" />
                  <p className="font-semibold text-orange-900">Daily Ritual</p>
                </div>
                <p className="text-sm text-orange-700">Start your day mindfully</p>
              </button>
              <button
                onClick={() => setShowMoodTracker(true)}
                className="w-full text-left px-4 py-3 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
              >
                <p className="font-semibold text-teal-900">Log Your Mood</p>
                <p className="text-sm text-teal-700">How are you feeling today?</p>
              </button>
              <button
                onClick={() => setShowVoiceJournal(true)}
                className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Mic className="w-4 h-4 text-red-600" />
                  <p className="font-semibold text-red-900">Voice Journal</p>
                </div>
                <p className="text-sm text-red-700">Speak your thoughts</p>
              </button>
              <button
                onClick={() => setShowGratitude(true)}
                className="w-full text-left px-4 py-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition"
              >
                <p className="font-semibold text-pink-900">Gratitude Log</p>
                <p className="text-sm text-pink-700">What are you thankful for?</p>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">AI & Content Tools</h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowAIAnalysis(true)}
                className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <p className="font-semibold text-purple-900">AI Mood Analysis</p>
                </div>
                <p className="text-sm text-purple-700">Get personalized insights</p>
              </button>
              <button
                onClick={() => setShowContentGenerator(true)}
                className="w-full text-left px-4 py-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-pink-600" />
                  <p className="font-semibold text-pink-900">Content Generator</p>
                </div>
                <p className="text-sm text-pink-700">AI-powered content ideas</p>
              </button>
              <button
                onClick={() => setShowBalance(true)}
                className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="w-4 h-4 text-indigo-600" />
                  <p className="font-semibold text-indigo-900">Balance Dashboard</p>
                </div>
                <p className="text-sm text-indigo-700">Track wellness vs content</p>
              </button>
              <button
                onClick={() => setShowCommunity(true)}
                className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <p className="font-semibold text-green-900">Community Progress</p>
                </div>
                <p className="text-sm text-green-700">Share your journey</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      {showMoodTracker && (
        <MoodTracker
          onClose={() => setShowMoodTracker(false)}
          onSaved={loadDashboardData}
        />
      )}

      {showJournal && (
        <JournalEntry
          onClose={() => setShowJournal(false)}
          onSaved={loadDashboardData}
        />
      )}

      {showMindfulness && (
        <MindfulnessSession
          onClose={() => setShowMindfulness(false)}
          onSaved={loadDashboardData}
        />
      )}

      {showAIAnalysis && (
        <AIMoodAnalysis onClose={() => setShowAIAnalysis(false)} />
      )}

      {showContentGenerator && (
        <SmartContentGenerator onClose={() => setShowContentGenerator(false)} />
      )}

      {showDailyRitual && (
        <DailyWellnessRitual
          onClose={() => setShowDailyRitual(false)}
          onComplete={loadDashboardData}
        />
      )}

      {showCommunity && (
        <CommunityProgress onClose={() => setShowCommunity(false)} />
      )}

      {showVoiceJournal && (
        <VoiceJournal
          onClose={() => setShowVoiceJournal(false)}
          onSaved={loadDashboardData}
        />
      )}

      {showGratitude && (
        <GratitudeJournal
          onClose={() => setShowGratitude(false)}
          onSaved={loadDashboardData}
        />
      )}

      {showBalance && (
        <BalanceDashboard onClose={() => setShowBalance(false)} />
      )}

      {showPricing && (
        <Pricing onClose={() => setShowPricing(false)} />
      )}
    </div>
  );
}
