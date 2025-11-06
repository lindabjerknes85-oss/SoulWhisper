import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Heart, Sparkles, X, PenTool } from 'lucide-react';

interface GratitudeJournalProps {
  onClose: () => void;
  onSaved: () => void;
}

export function GratitudeJournal({ onClose, onSaved }: GratitudeJournalProps) {
  const { user } = useAuth();
  const [gratitudeItems, setGratitudeItems] = useState<string[]>(['', '', '']);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showContentSuggestion, setShowContentSuggestion] = useState(false);
  const [contentIdea, setContentIdea] = useState('');

  const updateGratitudeItem = (index: number, value: string) => {
    const newItems = [...gratitudeItems];
    newItems[index] = value;
    setGratitudeItems(newItems);
  };

  const generateContentIdea = () => {
    const filledItems = gratitudeItems.filter(item => item.trim());
    if (filledItems.length === 0) return;

    const ideas = [
      `Del en historie om ${filledItems[0]} og hvordan det har påvirket deg`,
      `Skriv et innlegg om takknemlighet, med fokus på ${filledItems[0]}`,
      `Lag en liste over grunner til å være takknemlig, start med ${filledItems[0]}`,
      `Reflekter over hvordan ${filledItems[0]} har forandret ditt perspektiv`,
      `Del tre ting du er takknemlig for i dag (hint: ${filledItems.join(', ')})`,
    ];

    const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
    setContentIdea(randomIdea);
    setShowContentSuggestion(true);
  };

  const saveGratitude = async () => {
    if (!user) return;

    const filledItems = gratitudeItems.filter(item => item.trim());
    if (filledItems.length === 0) {
      setError('Skriv minst én ting du er takknemlig for');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const gratitudeText = filledItems.map((item, i) => `${i + 1}. ${item}`).join('\n');

      const { error: insertError } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          entry_text: `[Takknemlighet]\n${gratitudeText}`,
          mood_rating: 5,
        });

      if (insertError) throw insertError;

      generateContentIdea();

      setTimeout(() => {
        onSaved();
        if (!showContentSuggestion) {
          onClose();
        }
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Kunne ikke lagre takknemlighetslogg');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-pink-400 to-red-500 p-2 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Takknemlighetslogg</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!showContentSuggestion ? (
          <>
            <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700">
                Daglig takknemlighetspraksis. Skriv tre ting du er takknemlig for i dag.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-sm font-medium text-gray-700">
                Hva er du takknemlig for i dag?
              </p>

              {gratitudeItems.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateGratitudeItem(index, e.target.value)}
                    placeholder={`Noe du setter pris på...`}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                  />
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={saveGratitude}
              disabled={saving}
              className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-red-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Lagrer...' : 'Lagre takknemlighet'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              ❤️ Studier viser at daglig takknemlighet øker lykke og reduserer stress
            </p>
          </>
        ) : (
          <>
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-gray-800">AI foreslår:</h3>
              </div>
              <p className="text-gray-700 mb-4">{contentIdea}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <PenTool className="w-4 h-4" />
                <span>Vil du lage et innlegg om dette?</span>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 mb-6 text-center">
              <p className="text-green-800 font-medium mb-2">✅ Takknemlighet lagret!</p>
              <p className="text-sm text-green-700">
                Din positive energi er verdifull - del den gjerne med andre!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Lukk
              </button>
              <button
                onClick={() => {
                  onClose();
                }}
                className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 transition"
              >
                Start å skrive
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
