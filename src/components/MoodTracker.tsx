import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Smile, Meh, Frown, Heart, X } from 'lucide-react';

const moods = [
  { value: 5, label: 'Excellent', icon: Smile, color: 'from-green-400 to-green-500', textColor: 'text-green-700' },
  { value: 4, label: 'Good', icon: Smile, color: 'from-teal-400 to-teal-500', textColor: 'text-teal-700' },
  { value: 3, label: 'Okay', icon: Meh, color: 'from-yellow-400 to-yellow-500', textColor: 'text-yellow-700' },
  { value: 2, label: 'Not Great', icon: Frown, color: 'from-orange-400 to-orange-500', textColor: 'text-orange-700' },
  { value: 1, label: 'Poor', icon: Frown, color: 'from-red-400 to-red-500', textColor: 'text-red-700' },
];

interface MoodTrackerProps {
  onClose: () => void;
  onSaved: () => void;
}

export function MoodTracker({ onClose, onSaved }: MoodTrackerProps) {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!user || selectedMood === null) return;

    setSaving(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          mood_rating: selectedMood,
          notes: notes || null,
        });

      if (insertError) throw insertError;

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save mood entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-teal-400 to-blue-500 p-2 rounded-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">How are you feeling?</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {moods.map((mood) => {
            const Icon = mood.icon;
            const isSelected = selectedMood === mood.value;

            return (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`bg-gradient-to-br ${mood.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`font-semibold text-lg ${mood.textColor}`}>
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition resize-none"
            rows={3}
            placeholder="What's on your mind?"
          />
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={selectedMood === null || saving}
          className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Mood Entry'}
        </button>
      </div>
    </div>
  );
}
