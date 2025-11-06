import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Brain, TrendingUp, Calendar, Lightbulb, X } from 'lucide-react';

interface MoodPattern {
  day: string;
  averageMood: number;
  count: number;
}

interface AIMoodAnalysisProps {
  onClose: () => void;
}

export function AIMoodAnalysis({ onClose }: AIMoodAnalysisProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [contentSuggestion, setContentSuggestion] = useState('');

  useEffect(() => {
    loadMoodHistory();
  }, [user]);

  const loadMoodHistory = async () => {
    if (!user) return;

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: moodData } = await supabase
        .from('mood_entries')
        .select('mood_rating, notes, created_at')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      setMoodHistory(moodData || []);
      analyzeMoodPatterns(moodData || []);
    } catch (error) {
      console.error('Error loading mood history:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeMoodPatterns = (data: any[]) => {
    if (data.length === 0) {
      setInsights(['Start tracking your mood to receive personalized insights!']);
      return;
    }

    const newInsights: string[] = [];
    const patterns: Record<string, MoodPattern> = {};

    data.forEach(entry => {
      const date = new Date(entry.created_at);
      const dayName = date.toLocaleDateString('no-NO', { weekday: 'long' });

      if (!patterns[dayName]) {
        patterns[dayName] = { day: dayName, averageMood: 0, count: 0 };
      }
      patterns[dayName].averageMood += entry.mood_rating;
      patterns[dayName].count += 1;
    });

    Object.values(patterns).forEach(pattern => {
      pattern.averageMood = pattern.averageMood / pattern.count;
    });

    const sortedDays = Object.values(patterns).sort((a, b) => b.averageMood - a.averageMood);
    if (sortedDays.length > 0) {
      const bestDay = sortedDays[0];
      newInsights.push(`Du har det best på ${bestDay.day.toLowerCase()} - kanskje du trener eller har en spesiell rutine da?`);
    }

    const recentMoods = data.slice(0, 7);
    const avgRecentMood = recentMoods.reduce((sum, e) => sum + e.mood_rating, 0) / recentMoods.length;

    if (avgRecentMood >= 4) {
      newInsights.push('Du virker kreativ i dag! Vil du skrive en bloggpost eller dele noe inspirerende?');
      setContentSuggestion('Skriv om noe som har gitt deg glede denne uken - del din positive energi med andre!');
    } else if (avgRecentMood <= 2.5) {
      newInsights.push('La oss skrive noe rolig og reflekterende i dag. Kanskje en tanke om hva som kan hjelpe deg videre?');
      setContentSuggestion('Reflekter over små øyeblikk av fred - selv i utfordrende tider finnes det dråper av lys.');
    } else {
      newInsights.push('Du har en balansert uke! Perfekt tid for å dele dine tanker med verden.');
      setContentSuggestion('Del noe du har lært nylig - din erfaring kan inspirere andre!');
    }

    const totalEntries = data.length;
    if (totalEntries >= 7) {
      newInsights.push(`Du har logget ${totalEntries} stemninger! Dette hjelper meg å gi deg bedre innsikt over tid.`);
    }

    setInsights(newInsights);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-400 to-blue-500 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">AI Stemningsanalyse</h2>
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
            <div className="text-teal-600">Analyserer dine mønstre...</div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-800">Personlige Innsikter</h3>
              </div>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {contentSuggestion && (
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-gray-800">Innholdsforslag</h3>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-gray-700 mb-4">{contentSuggestion}</p>
                  <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-blue-600 transition">
                    Start å skrive
                  </button>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Siste 7 dager</h3>
              </div>
              <div className="space-y-2">
                {moodHistory.slice(0, 7).map((entry, index) => {
                  const date = new Date(entry.created_at);
                  const moodLabel = entry.mood_rating >= 4 ? 'Bra' : entry.mood_rating === 3 ? 'OK' : 'Utfordrende';
                  const moodColor = entry.mood_rating >= 4 ? 'text-green-600' : entry.mood_rating === 3 ? 'text-yellow-600' : 'text-orange-600';

                  return (
                    <div key={index} className="flex justify-between items-center bg-white rounded-lg p-3">
                      <span className="text-sm text-gray-600">
                        {date.toLocaleDateString('no-NO', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <span className={`text-sm font-medium ${moodColor}`}>{moodLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
