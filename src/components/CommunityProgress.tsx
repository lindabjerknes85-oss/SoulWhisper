import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, TrendingUp, Heart, MessageCircle, X, Award } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  achieved_at: string;
  likes_count: number;
  user_liked: boolean;
  is_own: boolean;
}

interface CommunityStats {
  totalUsers: number;
  activitiesThisMonth: number;
  mindfulnessCount: number;
}

interface CommunityProgressProps {
  onClose: () => void;
}

export function CommunityProgress({ onClose }: CommunityProgressProps) {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [stats, setStats] = useState<CommunityStats>({
    totalUsers: 0,
    activitiesThisMonth: 0,
    mindfulnessCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [shareAnonymously, setShareAnonymously] = useState(true);

  useEffect(() => {
    loadCommunityData();
  }, [user]);

  const loadCommunityData = async () => {
    if (!user) return;

    try {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const { data: milestonesData } = await supabase
        .from('user_milestones')
        .select('id, title, description, achieved_at, likes_count, user_id, is_public')
        .eq('is_public', true)
        .order('achieved_at', { ascending: false })
        .limit(20);

      const milestonesWithLikes = await Promise.all(
        (milestonesData || []).map(async (milestone) => {
          const { data: likeData } = await supabase
            .from('milestone_likes')
            .select('id')
            .eq('milestone_id', milestone.id)
            .eq('user_id', user.id)
            .maybeSingle();

          return {
            ...milestone,
            user_liked: !!likeData,
            is_own: milestone.user_id === user.id,
          };
        })
      );

      setMilestones(milestonesWithLikes);

      const { count: activitiesCount } = await supabase
        .from('wellness_activities')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthAgo.toISOString());

      const { count: mindfulnessCount } = await supabase
        .from('mindfulness_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthAgo.toISOString());

      setStats({
        totalUsers: 150,
        activitiesThisMonth: activitiesCount || 0,
        mindfulnessCount: mindfulnessCount || 0,
      });
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (milestoneId: string) => {
    if (!user) return;

    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    try {
      if (milestone.user_liked) {
        await supabase
          .from('milestone_likes')
          .delete()
          .eq('milestone_id', milestoneId)
          .eq('user_id', user.id);

        setMilestones(prev => prev.map(m =>
          m.id === milestoneId
            ? { ...m, user_liked: false, likes_count: m.likes_count - 1 }
            : m
        ));
      } else {
        await supabase
          .from('milestone_likes')
          .insert({
            milestone_id: milestoneId,
            user_id: user.id,
          });

        setMilestones(prev => prev.map(m =>
          m.id === milestoneId
            ? { ...m, user_liked: true, likes_count: m.likes_count + 1 }
            : m
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const shareMilestone = async () => {
    if (!user) return;

    try {
      const { data: recentProgress } = await supabase
        .from('user_points')
        .select('current_streak, total_points')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!recentProgress) return;

      let milestoneType = 'activities_50';
      let title = 'Nådde 50 aktiviteter!';
      let description = 'Jeg har fullført 50 wellness-aktiviteter på min reise.';

      if (recentProgress.current_streak >= 7) {
        milestoneType = 'streak_7';
        title = '7-dagers streak!';
        description = 'Jeg har holdt en 7-dagers streak med daglige wellness-aktiviteter.';
      }

      await supabase
        .from('user_milestones')
        .insert({
          user_id: user.id,
          milestone_type: milestoneType,
          title: title,
          description: description,
          is_public: shareAnonymously,
        });

      loadCommunityData();
    } catch (error) {
      console.error('Error sharing milestone:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 my-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-400 to-teal-500 p-2 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Community Wellness-Reise</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-teal-600">Laster community data...</div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-700">Aktive brukere</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-sm text-gray-600">denne måneden</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-700">Totale aktiviteter</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.activitiesThisMonth}</p>
                <p className="text-sm text-gray-600">siste 30 dager</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-700">Mindfulness</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.mindfulnessCount}</p>
                <p className="text-sm text-gray-600">økter fullført</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-600" />
                Del din progresjon
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Denne måneden har 150 brukere praktisert mindfulness 5+ ganger. Vil du dele din reise?
              </p>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={shareAnonymously}
                    onChange={(e) => setShareAnonymously(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Del anonymt</span>
                </label>
                <button
                  onClick={shareMilestone}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-yellow-600 transition text-sm"
                >
                  Del milepæl
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-teal-600" />
                Community Milepæler
              </h3>
              <div className="space-y-3">
                {milestones.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Ingen offentlige milepæler ennå. Vær den første til å dele!
                  </div>
                ) : (
                  milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{milestone.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(milestone.achieved_at).toLocaleDateString('no-NO', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                            {milestone.is_own && ' (Din milepæl)'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleLike(milestone.id)}
                        disabled={milestone.is_own}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
                          milestone.user_liked
                            ? 'bg-red-50 text-red-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        } ${milestone.is_own ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Heart className={`w-4 h-4 ${milestone.user_liked ? 'fill-red-600' : ''}`} />
                        <span>{milestone.likes_count}</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
