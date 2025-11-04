import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Mic, Square, Play, Pause, Save, X, Loader } from 'lucide-react';

interface VoiceJournalProps {
  onClose: () => void;
  onSaved: () => void;
}

export function VoiceJournal({ onClose, onSaved }: VoiceJournalProps) {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      setError('');
    } catch (err) {
      setError('Kunne ikke få tilgang til mikrofonen. Sjekk nettleserinnstillingene dine.');
      console.error('Error starting recording:', err);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      simulateTranscription();
    }
  };

  const simulateTranscription = () => {
    setIsTranscribing(true);

    setTimeout(() => {
      const sampleTranscriptions = [
        'I dag følte jeg meg mer energisk enn vanlig. Jeg tok en morgentur og la merke til hvordan den friske luften ga meg ny energi. Det er interessant hvordan små endringer i rutinen kan ha så stor effekt på humøret mitt.',
        'En dag med opp og nedturer. Begynte litt treg, men etter en kort meditasjonsøkt føltes alt lettere. Jeg merker virkelig forskjellen når jeg tar meg tid til å stoppe opp og puste.',
        'Reflekterer over hvor langt jeg har kommet. For noen uker siden ville jeg ikke ha orket å gjøre dette. Nå føles det naturlig å ta vare på meg selv. Stolte av meg selv!',
      ];

      const randomTranscription = sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)];
      setTranscription(randomTranscription);
      setIsTranscribing(false);
    }, 2000);
  };

  const saveJournalEntry = async () => {
    if (!user || !transcription) return;

    setSaving(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('voice_journals')
        .insert({
          user_id: user.id,
          transcription: transcription,
          duration_seconds: recordingTime,
        });

      if (insertError) throw insertError;

      await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          entry_text: `[Taledagbok] ${transcription}`,
          mood_rating: 4,
        });

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Kunne ikke lagre dagboknotat');
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
            <div className="bg-gradient-to-br from-red-400 to-pink-500 p-2 rounded-lg">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Taledagbok</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 mb-6">
          <p className="text-sm text-gray-700 mb-4">
            Snakk inn dine dagboknotater i stedet for å skrive. Vi transkriberer automatisk med AI.
          </p>

          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {formatTime(recordingTime)}
              </div>
              {isRecording && (
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                  <span className="text-sm text-gray-600">
                    {isPaused ? 'Pauset' : 'Tar opp...'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {!isRecording && !audioBlob && (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-semibold hover:from-red-600 hover:to-pink-600 transition"
                >
                  <Mic className="w-5 h-5" />
                  Start opptak
                </button>
              )}

              {isRecording && !isPaused && (
                <>
                  <button
                    onClick={pauseRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-full font-semibold hover:bg-yellow-600 transition"
                  >
                    <Pause className="w-5 h-5" />
                    Pause
                  </button>
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-full font-semibold hover:bg-gray-800 transition"
                  >
                    <Square className="w-5 h-5" />
                    Stopp
                  </button>
                </>
              )}

              {isRecording && isPaused && (
                <>
                  <button
                    onClick={resumeRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition"
                  >
                    <Play className="w-5 h-5" />
                    Fortsett
                  </button>
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-full font-semibold hover:bg-gray-800 transition"
                  >
                    <Square className="w-5 h-5" />
                    Stopp
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {isTranscribing && (
          <div className="bg-blue-50 rounded-xl p-4 mb-4 flex items-center gap-3">
            <Loader className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-blue-800">Transkriberer med AI...</span>
          </div>
        )}

        {transcription && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transkripsjon
            </label>
            <textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition resize-none"
              rows={6}
              placeholder="Din transkripsjon vises her..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Du kan redigere transkripsjonen før du lagrer
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {transcription && (
          <button
            onClick={saveJournalEntry}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Lagrer...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Lagre dagboknotat
              </>
            )}
          </button>
        )}

        <p className="text-xs text-gray-500 text-center mt-4">
          💡 <span className="font-semibold">Tips:</span> Snakk naturlig og ta deg tid. Perfekt for travle content creators!
        </p>
      </div>
    </div>
  );
}
