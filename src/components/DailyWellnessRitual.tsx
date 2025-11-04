import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Sunrise, CheckCircle, Circle, Flame, X } from 'lucide-react';

interface RitualStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface DailyWellnessRitualProps {
  onClose: () => void;
  onComplete?: () => void;
}

export function DailyWellnessRitual({ onClose, onComplete }: DailyWellnessRitualProps) {
  const { user } = useAuth();
  const [steps, setSteps] = useState<RitualStep[]>([
    {
      id: 'check_in',
      title: 'Stemningssjekk',
      description: 'Før du lager innhold - hvordan har du det?',
      completed: false,
    },
    {
      id: 'meditation',
      title: 'Mini-meditasjon',
      description: 'Ta en kort meditasjon (2-5 minutter)',
      completed: false,
    },
    {
      id: 'intention',
      title: 'Sett en intensjon',
      description: 'Hva vil du skape i dag?',
      completed: false,
    },
  ]);
  const [streak, setStreak] = useState(0);
  const [intention, setIntention] = useState('');
  const [showIntentionInput, setShowIntentionInput] = useState(false);

  useEffect(() => {
    loadStreak();
    checkTodayProgress();
  }, [user]);

  const loadStreak = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_points')
        .select('current_streak')
        .eq('user_id', user.id)
        .maybeSingle();

      setStreak(data?.current_streak || 0);
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const checkTodayProgress = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const { data: moodCheck } = await supabase
      .from('mood_entries')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00`)
      .limit(1)
      .maybeSingle();

    const { data: mindfulnessCheck } = await supabase
      .from('mindfulness_sessions')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00`)
      .limit(1)
      .maybeSingle();

    setSteps(prev => prev.map(step => {
      if (step.id === 'check_in' && moodCheck) {
        return { ...step, completed: true };
      }
      if (step.id === 'meditation' && mindfulnessCheck) {
        return { ...step, completed: true };
      }
      return step;
    }));
  };

  const toggleStep = (stepId: string) => {
    if (stepId === 'intention') {
      setShowIntentionInput(true);
      return;
    }

    setSteps(prev => prev.map(step =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    ));
  };

  const saveIntention = async () => {
    if (!intention.trim()) return;

    try {
      await supabase
        .from('journal_entries')
        .insert({
          user_id: user?.id,
          entry_text: `Dagens intensjon: ${intention}`,
          mood_rating: 4,
        });

      setSteps(prev => prev.map(step =>
        step.id === 'intention' ? { ...step, completed: true } : step
      ));
      setShowIntentionInput(false);
    } catch (error) {
      console.error('Error saving intention:', error);
    }
  };

  const allCompleted = steps.every(step => step.completed);

  const handleComplete = async () => {
    if (allCompleted && onComplete) {
      onComplete();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-400 to-yellow-500 p-2 rounded-lg">
              <Sunrise className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Daglig Wellness-Ritual</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Din streak</p>
            <p className="text-2xl font-bold text-orange-600">{streak} dager</p>
          </div>
          <Flame className="w-10 h-10 text-orange-500" />
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-gray-600 text-sm">
            Start dagen riktig med disse tre enkle stegene. Kombiner wellness-tracking med din kreative prosess.
          </p>

          {steps.map((step) => (
            <div
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                step.completed
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                {step.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold ${step.completed ? 'text-green-900' : 'text-gray-800'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm ${step.completed ? 'text-green-700' : 'text-gray-600'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showIntentionInput && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-xl">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hva vil du skape i dag?
            </label>
            <input
              type="text"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="F.eks: Et inspirerende innlegg om..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={saveIntention}
                className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-2 rounded-lg font-medium hover:from-orange-600 hover:to-yellow-600 transition"
              >
                Lagre intensjon
              </button>
              <button
                onClick={() => setShowIntentionInput(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Avbryt
              </button>
            </div>
          </div>
        )}

        {allCompleted && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-center font-medium">
              🎉 Fantastisk! Du er klar til å skape innhold med en sunn start!
            </p>
          </div>
        )}

        <button
          onClick={handleComplete}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition duration-200"
        >
          {allCompleted ? 'Fortsett til innholdsskaping' : 'Fullfør senere'}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          💡 Tips: Gjør dette daglig for å bygge en sunn streak og holde balansen mellom kreativitet og velvære
        </p>
      </div>
    </div>
  );
}
