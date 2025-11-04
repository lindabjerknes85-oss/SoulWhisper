import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Sparkles, RefreshCw, Copy, Check, X } from 'lucide-react';

interface SmartContentGeneratorProps {
  onClose: () => void;
}

export function SmartContentGenerator({ onClose }: SmartContentGeneratorProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [contentTone, setContentTone] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    analyzeMoodForTone();
  }, [user]);

  const analyzeMoodForTone = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('mood_entries')
        .select('mood_rating')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!data || data.length === 0) {
        setContentTone('balansert');
        return;
      }

      const avgMood = data.reduce((sum, e) => sum + e.mood_rating, 0) / data.length;

      if (avgMood >= 4) {
        setContentTone('energisk og inspirerende');
      } else if (avgMood <= 2.5) {
        setContentTone('rolig og reflekterende');
      } else {
        setContentTone('balansert og gjennomtenkt');
      }
    } catch (error) {
      console.error('Error analyzing mood:', error);
      setContentTone('balansert');
    }
  };

  const generateContent = async () => {
    if (!topic.trim()) return;

    setLoading(true);

    const templates = {
      'energisk og inspirerende': [
        `🌟 ${topic}: En reise verdt å ta!\n\nNår jeg tenker på ${topic}, fylles jeg med begeistring. Det er noe magisk ved hvordan...\n\nHer er mine topp 3 tips:\n1. Start med små skritt\n2. Feir hver milepæl\n3. Del din reise med andre\n\nHva er dine erfaringer? 💫`,
        `✨ La meg dele noe som har inspirert meg: ${topic}\n\nI dag vil jeg utforske hvordan dette kan transformere hverdagen din...\n\n[Din unike vinkling her]\n\nSå, er du klar til å prøve? 🚀`
      ],
      'rolig og reflekterende': [
        `🍃 Tanker om ${topic}\n\nI stillheten har jeg reflektert over ${topic}. Det finnes en dyp visdom i å...\n\nLa oss utforske dette sammen, ett øyeblikk av gangen.\n\n[Din dypere refleksjon]\n\nHvordan resonerer dette med din erfaring?`,
        `🌙 En stille meditasjon over ${topic}\n\nNoen ganger trenger vi å ta et skritt tilbake og virkelig se...\n\nHer er hva jeg har lært:\n- Det er kraft i stillhet\n- Små endringer skaper bølger\n- Din reise er unik\n\nTa deg tid til å reflektere. 🕊️`
      ],
      'balansert og gjennomtenkt': [
        `📝 La oss snakke om ${topic}\n\nJeg har tenkt mye på dette i det siste, og her er min ærlige refleksjon...\n\nDet handler både om [perspektiv A] og [perspektiv B].\n\nMine viktigste lærdommer:\n- [Lærdom 1]\n- [Lærdom 2]\n- [Lærdom 3]\n\nHva tenker du?`,
        `💭 Mine tanker om ${topic}\n\nDette er et tema som fortjener nyansert betraktning. På den ene siden... på den andre...\n\n[Din balanserte analyse]\n\nJeg tror nøkkelen ligger i å finne din egen vei. 🌿`
      ]
    };

    await new Promise(resolve => setTimeout(resolve, 1500));

    const toneTemplates = templates[contentTone as keyof typeof templates] || templates['balansert og gjennomtenkt'];
    const randomTemplate = toneTemplates[Math.floor(Math.random() * toneTemplates.length)];

    setGeneratedContent(randomTemplate);
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-pink-400 to-purple-500 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Smart Innholdsgenerator</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-700">
            Basert på din stemning, foreslår jeg en <span className="font-semibold text-purple-700">{contentTone}</span> tone for innholdet ditt.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hva vil du skrive om?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="F.eks: Mindfulness, Morgenrutiner, Produktivitet..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              onKeyPress={(e) => e.key === 'Enter' && generateContent()}
            />
          </div>

          <button
            onClick={generateContent}
            disabled={!topic.trim() || loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Genererer innhold...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generer innhold
              </>
            )}
          </button>

          {generatedContent && (
            <div className="mt-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Generert innhold</h3>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Kopiert!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Kopier
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <pre className="whitespace-pre-wrap font-sans text-gray-700">{generatedContent}</pre>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={generateContent}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generer ny versjon
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <span className="font-semibold">Tips:</span> Bruk det genererte innholdet som et utgangspunkt. Tilpass det med dine egne erfaringer og din unike stemme!
          </p>
        </div>
      </div>
    </div>
  );
}
