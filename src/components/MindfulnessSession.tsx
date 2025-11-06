import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Brain, X, Play, Pause, Check } from 'lucide-react';

const sessionTypes = [
  { value: 'meditation', label: 'Meditation', duration: 10 },
  { value: 'breathing', label: 'Breathing Exercise', duration: 5 },
  { value: 'body_scan', label: 'Body Scan', duration: 15 },
  { value: 'visualization', label: 'Visualization', duration: 10 },
];

interface MindfulnessSessionProps {
  onClose: () => void;
  onSaved: () => void;
}

export function MindfulnessSession({ onClose, onSaved }: MindfulnessSessionProps) {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  const handleStart = (type: string) => {
    const session = sessionTypes.find((s) => s.value === type);
    if (!session) return;

    setSelectedType(type);
    setTimeRemaining(session.duration * 60);
    setIsRunning(true);
    setCompleted(false);
  };

  const handleTogglePause = () => {
    setIsRunning(!isRunning);
  };

  const handleSave = async () => {
    if (!user || !selectedType) return;

    setSaving(true);
    setError('');

    try {
      const session = sessionTypes.find((s) => s.value === selectedType);
      if (!session) return;

      const { error: insertError } = await supabase
        .from('mindfulness_sessions')
        .insert({
          user_id: user.id,
          session_type: selectedType,
          duration_minutes: session.duration,
          completed: true,
        });

      if (insertError) throw insertError;

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save session');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 p-2 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Mindfulness Session</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!selectedType ? (
          <div className="space-y-3">
            <p className="text-gray-600 mb-4">Choose a mindfulness practice:</p>
            {sessionTypes.map((session) => (
              <button
                key={session.value}
                onClick={() => handleStart(session.value)}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <div>
                  <p className="font-semibold text-gray-800">{session.label}</p>
                  <p className="text-sm text-gray-600">{session.duration} minutes</p>
                </div>
                <Play className="w-5 h-5 text-blue-600" />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center">
            {!completed ? (
              <>
                <div className="mb-8">
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-5xl font-bold text-white">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>

                <p className="text-lg font-semibold text-gray-800 mb-2">
                  {sessionTypes.find((s) => s.value === selectedType)?.label}
                </p>
                <p className="text-gray-600 mb-6">
                  Take a moment to breathe and relax
                </p>

                <button
                  onClick={handleTogglePause}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition duration-200 flex items-center gap-2 mx-auto"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-5 h-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Resume
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-24 h-24 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Session Complete!
                </h3>
                <p className="text-gray-600 mb-6">
                  Great job taking time for yourself
                </p>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Session'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
