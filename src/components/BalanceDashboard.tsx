import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Scale, TrendingUp, AlertTriangle, FileText, Heart, X, Calendar } from 'lucide-react';

interface BalanceData {
  contentCreated: number;
  wellnessActivities: number;
  balanceRatio: number;
  needsBreak: boolean;
  lastWellnessActivity: string | null;
  weeklyContentCount: number;
}

interface BalanceDashboardProps {
  onClose: () => void;
}

export function BalanceDashboard({ onClose }: BalanceDashboardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [balanceData, setBalanceData] = useState<BalanceData>({
    contentCreated: 0,
    wellnessActivities: 0,
    balanceRatio: 0,
    needsBreak: false,
    lastWellnessActivity: null,
    weeklyContentCount: 0,
  });
  const [recommendation, setRecommendation] = useState('');

  useEffect(() => {
    loadBalanceData();
  }, [user]);

  const loadBalanceData = async () => {
    if (!user) return;

    try {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { count: journalCount } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', monthAgo.toISOString());

      const { count: weeklyJournalCount } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', weekAgo.toISOString());

      const { count: moodCount } = await supabase
        .from('mood_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', monthAgo.toISOString());

      const { count: mindfulnessCount } = await supabase
        .from('mindfulness_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', monthAgo.toISOString());

      const { data: lastActivity } = await supabase
        .from('wellness_activities')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const contentCreated = journalCount || 0;
      const wellnessActivities = (moodCount || 0) + (mindfulnessCount || 0);
      const weeklyContent = weeklyJournalCount || 0;

      const ratio = contentCreated > 0 ? wellnessActivities / contentCreated : 0;
      const needsBreak = weeklyContent > 20 || (contentCreated > 50 && wellnessActivities < 10);

      setBalanceData({
        contentCreated,
        wellnessActivities,
        balanceRatio: ratio,
        needsBreak,
        lastWellnessActivity: lastActivity?.created_at || null,
        weeklyContentCount: weeklyContent,
      });

      generateRecommendation(contentCreated, wellnessActivities, weeklyContent, needsBreak);
    } catch (error) {
      console.error('Error loading balance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendation = (
    content: number,
    wellness: number,
    weeklyContent: number,
    needsBreak: boolean
  ) => {
    if (needsBreak) {
      setRecommendation(
        `Du har generert ${content} innlegg denne måneden - husk å ta vare på deg selv! Ta en pause og fokuser på wellness-aktiviteter.`
      );
    } else if (wellness < content * 0.3) {
      setRecommendation(
        'Balansen din heller mot produktivitet. Kanskje det er på tide med en meditasjonsøkt eller stemningssjekk?'
      );
    } else if (wellness > content * 2) {
      setRecommendation(
        'Du tar godt vare på deg selv! Med all denne positive energien, kanskje det er tid for å dele noe inspirerende?'
      );
    } else {
      setRecommendation(
        'Flott balanse mellom kreativitet og velvære! Fortsett å ta vare på både produktiviteten og deg selv.'
      );
    }
  };

  const getBalanceStatus = () => {
    const { balanceRatio, needsBreak } = balanceData;

    if (needsBreak) {
      return {
        label: 'Trenger pause',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: AlertTriangle,
      };
    } else if (balanceRatio < 0.3) {
      return {
        label: 'Skjev mot produktivitet',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        icon: Scale,
      };
    } else if (balanceRatio > 2) {
      return {
        label: 'Fokus på wellness',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: Heart,
      };
    } else {
      return {
        label: 'God balanse',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: TrendingUp,
      };
    }
  };

  const status = getBalanceStatus();
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-400 to-purple-500 p-2 rounded-lg">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Content-Wellness Balanse</h2>
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
            <div className="text-indigo-600">Analyserer din balanse...</div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`${status.bgColor} rounded-xl p-6`}>
              <div className="flex items-center gap-3 mb-3">
                <StatusIcon className={`w-6 h-6 ${status.color}`} />
                <h3 className={`font-semibold text-lg ${status.color}`}>{status.label}</h3>
              </div>
              <p className="text-gray-700">{recommendation}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-700">Innholdsproduksjon</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Siste 30 dager</span>
                    <span className="text-2xl font-bold text-gray-900">{balanceData.contentCreated}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Siste 7 dager</span>
                    <span className="text-xl font-bold text-gray-900">{balanceData.weeklyContentCount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-gray-700">Wellness-aktiviteter</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Siste 30 dager</span>
                    <span className="text-2xl font-bold text-gray-900">{balanceData.wellnessActivities}</span>
                  </div>
                  {balanceData.lastWellnessActivity && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Siste: {new Date(balanceData.lastWellnessActivity).toLocaleDateString('no-NO', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Balanse-visualisering</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Innhold</span>
                    <span className="font-medium text-purple-600">{balanceData.contentCreated}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (balanceData.contentCreated / (balanceData.contentCreated + balanceData.wellnessActivities)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Wellness</span>
                    <span className="font-medium text-teal-600">{balanceData.wellnessActivities}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (balanceData.wellnessActivities / (balanceData.contentCreated + balanceData.wellnessActivities)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {balanceData.needsBreak && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-800 text-sm">
                  ⚠️ <span className="font-semibold">Viktig påminnelse:</span> Du har vært veldig produktiv! Ta en pause, fokuser på wellness-aktiviteter, og kom tilbake med fornyet energi.
                </p>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <span className="font-semibold">Optimal balanse:</span> For hver 3 innlegg du lager, prøv å gjøre minst 1 wellness-aktivitet. Dette holder deg kreativ og sunn!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
