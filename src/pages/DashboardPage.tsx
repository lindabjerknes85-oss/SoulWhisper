import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase, SubscriptionPlan } from '../lib/supabase';
import { FileText, TrendingUp, Sparkles, Calendar, Zap, Clock, Trash2, DollarSign, Heart, Briefcase, Crown } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { SalesTracker } from '../components/SalesTracker';
import { WellnessTracker } from '../components/WellnessTracker';
import { CalendarPlanner } from '../components/CalendarPlanner';
import { HealthWorkTracker } from '../components/HealthWorkTracker';

interface UserSubscription {
  subscription_status: string;
  price_id: string | null;
}

interface Generation {
  id: string;
  content_type: string;
  prompt: string;
  generated_content: string;
  word_count: number;
  created_at: string;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContentCreator, setShowContentCreator] = useState(false);
  const [contentType, setContentType] = useState('blog');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [stats, setStats] = useState({
    totalGenerations: 0,
    monthlyGenerations: 0,
    totalWords: 0
  });
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [activeSection, setActiveSection] = useState<'content' | 'sales' | 'wellness' | 'planning' | 'health'>('content');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const { data: customerData } = await supabase
          .from('stripe_customers')
          .select('customer_id')
          .eq('user_id', user.id)
          .maybeSingle();

        let subscriptionData = null;
        let subError = null;

        if (customerData) {
          const result = await supabase
            .from('stripe_subscriptions')
            .select('status, price_id')
            .eq('customer_id', customerData.customer_id)
            .maybeSingle();

          subscriptionData = result.data ? {
            subscription_status: result.data.status,
            price_id: result.data.price_id
          } : null;
          subError = result.error;
        }

        if (subError) {
          console.error('Error fetching subscription:', subError);
        } else {
          setSubscription(subscriptionData);
        }

        const { data: plansData } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price_monthly', { ascending: true });

        if (plansData) {
          setPlans(plansData);
        }

        const { data: generationsData, error: genError } = await supabase
          .from('generations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (genError) {
          console.error('Error fetching generations:', genError);
        } else if (generationsData) {
          setGenerations(generationsData);
          const totalWords = generationsData.reduce((sum, gen) => sum + (gen.word_count || 0), 0);
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          const monthlyGens = generationsData.filter(gen => {
            const genDate = new Date(gen.created_at);
            return genDate.getMonth() === currentMonth && genDate.getFullYear() === currentYear;
          });

          setStats({
            totalGenerations: generationsData.length,
            monthlyGenerations: monthlyGens.length,
            totalWords: totalWords
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleUpgrade = (paymentLink: string | null) => {
    if (!paymentLink) {
      setError('Payment link not configured. Please contact support.');
      return;
    }

    window.location.href = paymentLink;
  };

  const getPlanName = (priceId: string | null) => {
    if (!priceId) return 'Free Plan';

    const planNames: Record<string, string> = {
      'price_1SHG4VH5QFMYVsWN7Pxcx8XS': 'ContentAI Pro',
      'price_1SHG6BH5QFMYVsWNBToOk4Y5': 'ContentAI Enterprise'
    };

    return planNames[priceId] || 'Premium Plan';
  };

  useEffect(() => {
    if (showContentCreator) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showContentCreator]);

  const handleGenerateContent = async () => {
    if (!prompt.trim()) {
      alert('Please enter a description');
      return;
    }

    setGenerating(true);
    setGeneratedContent('');

    try {
      const contentTypeTitle = {
        blog: 'Blogginnlegg',
        social: 'Sosiale medier',
        email: 'E-post',
        ad: 'Annonse'
      }[contentType] || 'Innhold';

      const mockContent = contentType === 'blog'
        ? `# Alt du trenger å vite om ${prompt}

## Innledning

${prompt} har blitt stadig mer relevant i dagens samfunn. Enten du er nybegynner eller erfaren, er det viktig å holde seg oppdatert på de nyeste trendene og beste praksisene. I denne artikkelen går vi grundig gjennom alt du trenger å vite.

## De viktigste fordelene

Her er hvorfor ${prompt} er så viktig:

- **Økt effektivitet**: Ved å implementere ${prompt} riktig, kan du spare både tid og ressurser. Studier viser at de som mestrer dette området ofte ser opp til 40% forbedring i resultater.

- **Konkurransefortrinn**: I dagens marked er det avgjørende å ligge i forkant. ${prompt} gir deg verktøyene du trenger for å skille deg ut.

- **Langsiktig bærekraft**: Dette er ikke bare en kortsiktig løsning, men en investering i fremtiden som vil betale seg mange ganger.

- **Praktisk anvendelse**: ${prompt} kan implementeres umiddelbart, uavhengig av din nåværende situasjon eller erfaring.

## Vanlige utfordringer og løsninger

Mange møter på hindringer når de skal komme i gang med ${prompt}. Her er de mest vanlige:

**Utfordring 1: Manglende kunnskap**
Løsning: Start med det grunnleggende. Ta deg tid til å forstå fundamentet før du går videre til mer avanserte teknikker.

**Utfordring 2: Begrenset budsjett**
Løsning: Det finnes mange kostnadseffektive alternativer. Du trenger ikke investere stort for å se resultater.

**Utfordring 3: Tidsbegrensninger**
Løsning: Begynn smått. Selv 15 minutter daglig kan gi betydelige resultater over tid.

## Ekspertråd og beste praksis

Basert på erfaring fra bransjeledere, her er de viktigste rådene:

1. **Konsistens er nøkkelen**: Regelmessig innsats gir bedre resultater enn sporadiske forsøk
2. **Mål resultatene dine**: Det du måler, forbedrer du
3. **Tilpass tilnærmingen**: Hva som fungerer for andre, må kanskje justeres for din situasjon
4. **Hold deg oppdatert**: ${prompt} utvikler seg kontinuerlig, så følg med på nye trender

## Hva sier ekspertene?

Ledende fagfolk innen feltet understreker viktigheten av ${prompt}. Det handler ikke bare om å følge trenden, men om å forstå de underliggende prinsippene som gjør det effektivt.

## Konkrete steg for å komme i gang

1. **Dag 1-7**: Kartlegg nåværende situasjon og sett klare mål
2. **Uke 2-4**: Implementer grunnleggende strategier
3. **Måned 2-3**: Optimaliser og finjuster basert på resultater
4. **Videre**: Skalér opp og utforsk avanserte teknikker

## Konklusjon

${prompt} er ikke lenger valgfritt - det er essensielt for suksess. Ved å følge rådene i denne artikkelen, har du et solid fundament for å lykkes. Husk at reisen er like viktig som målet, så ta ett steg om gangen.

Vil du lære mer? Hold deg oppdatert med vårt innhold for flere dyptgående guider og praktiske tips!`
        : contentType === 'social'
        ? `🎯 ${prompt} - Dette må du vite!

Her er 5 fakta om ${prompt} som vil overraske deg:

✅ 1. Øker produktiviteten med opptil 40%
✅ 2. Brukes av over 10,000+ fornøyde brukere
✅ 3. Krever minimal investering for å komme i gang
✅ 4. Gir målbare resultater på under 30 dager
✅ 5. Passer for både nybegynnere og eksperter

💡 Pro tips: Start smått og skaler opp. Konsistens slår perfeksjon hver gang!

🔥 Les mer i vår nye guide (lenke i bio)

#${prompt.replace(/\s+/g, '')} #tips #produktivitet #vekst #suksess #motivasjon`
        : contentType === 'email'
        ? `Emne: [Viktig] Slik oppnår du resultater med ${prompt}

Hei [Navn],

Jeg tar kontakt fordi jeg vet du er interessert i ${prompt}.

Her er noe spennende: Vi har nettopp lansert en komplett guide som viser deg nøyaktig hvordan du kan ta ${prompt} til neste nivå.

**Hva du får:**
• Trinn-for-trinn instruksjoner
• Praktiske eksempler fra virkelige case
• Eksklusive tips fra bransjeledere
• Verktøy og ressurser verdt 5000kr - helt gratis

**Hvorfor er dette relevant for deg?**

Enten du er i startfasen eller ønsker å optimalisere eksisterende prosesser, vil denne guiden gi deg konkrete verktøy du kan implementere umiddelbart.

Over 5000 personer har allerede lastet ned guiden, og tilbakemeldingene er overveldende positive. Mange rapporterer om målbare forbedringer allerede i første uke.

**Klar til å komme i gang?**

Klikk her for å få tilgang: [LENKE]

Dette tilbudet er kun tilgjengelig i begrenset tid, så ikke vent for lenge.

Har du spørsmål? Svar gjerne på denne e-posten, så hjelper vi deg videre.

Med vennlig hilsen,
[Ditt navn]
[Tittel]

P.S. Ikke gå glipp av bonusmaterialet som følger med - det alene er verdt hele investeringen!`
        : `🚀 SISTE SJANSE: ${prompt}

⚡ Opplev ${prompt} som aldri før

Dette er mer enn bare et tilbud - det er en mulighet til å transformere din tilnærming til ${prompt}.

**Hva gjør oss annerledes?**

✓ Dokumenterte resultater - ikke bare tomme løfter
✓ 30 dagers pengene-tilbake-garanti
✓ Dedikert support 24/7
✓ Over 10,000 fornøyde kunder

**Eksklusivt tilbud - kun i dag:**
• 50% rabatt på alle pakker
• Gratis bonusmateriale verdt 3000kr
• Livstid tilgang til oppdateringer

⏰ Tilbudet utløper om 24 timer!

👉 Sikre din plass nå: [LENKE]

Ikke vær en av de som angrer på at de ventet for lenge. Invester i ${prompt} i dag og se resultatene i morgen.

🎁 BONUS: De første 100 får også tilgang til vår eksklusive masterclass!`;

      await new Promise(resolve => setTimeout(resolve, 2000));

      const { data, error } = await supabase
        .from('generations')
        .insert({
          user_id: user?.id,
          content_type: contentType,
          prompt: prompt,
          generated_content: mockContent,
          word_count: mockContent.split(' ').length
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving generation:', error);
      }

      setGeneratedContent(mockContent);

      if (data) {
        setGenerations(prev => [data, ...prev]);
      }

      setStats(prev => ({
        totalGenerations: prev.totalGenerations + 1,
        monthlyGenerations: prev.monthlyGenerations + 1,
        totalWords: prev.totalWords + mockContent.split(' ').length
      }));
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex gap-4 mb-8 border-b border-slate-700 pb-4">
              <button
                onClick={() => setActiveSection('content')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'content'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                Innholdsgenerering
              </button>
              <button
                onClick={() => setActiveSection('sales')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'sales'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                Økonomi
              </button>
              <button
                onClick={() => setActiveSection('wellness')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'wellness'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Heart className="w-5 h-5" />
                Velvære
              </button>
              <button
                onClick={() => setActiveSection('planning')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'planning'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-5 h-5" />
                Planlegging
              </button>
              <button
                onClick={() => setActiveSection('health')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'health'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                Sykdom & Jobb
              </button>
            </div>

            {activeSection === 'content' && (
              <>
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 mb-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-3">Welcome to Soul Whisper</h1>
                <p className="text-xl text-slate-300">
                  Your AI-powered content generation dashboard
                </p>
  
                <div className="mt-6 flex items-center gap-4 justify-center">
                  <div className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Current Plan: {subscription?.price_id ? getPlanName(subscription.price_id) : 'Free Plan'}
                  </div>
                  {(!subscription?.price_id || subscription?.price_id === '') && (
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-full text-sm font-medium transition-all"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </button>
                  )}
                </div>
              </div>
            </div>
  
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-slate-400 truncate">
                        Total Generations
                      </dt>
                      <dd className="text-2xl font-bold text-white">{stats.totalGenerations}</dd>
                    </dl>
                  </div>
                </div>
              </div>
  
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-slate-400 truncate">
                        This Month
                      </dt>
                      <dd className="text-2xl font-bold text-white">{stats.monthlyGenerations}</dd>
                    </dl>
                  </div>
                </div>
              </div>
  
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-lg flex items-center justify-center">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-slate-400 truncate">
                        Words Generated
                      </dt>
                      <dd className="text-2xl font-bold text-white">{stats.totalWords}</dd>
                    </dl>
                  </div>
                </div>
              </div>
  
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-slate-400 truncate">
                        Days Active
                      </dt>
                      <dd className="text-2xl font-bold text-white">1</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
  
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-white mb-3">
                Kom i gang
              </h3>
              <div className="mt-2 max-w-2xl text-slate-300 mb-6">
                <p>
                  Velg kategori for å starte din produktivitets- og velvære-reise
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setShowContentCreator(true)}
                  className="flex flex-col items-center gap-2 px-4 py-4 bg-slate-800/50 hover:bg-cyan-500/10 border border-slate-700 hover:border-cyan-500 rounded-xl transition-all group"
                >
                  <Sparkles className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white">AI Innhold</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('sales')}
                  className="flex flex-col items-center gap-2 px-4 py-4 bg-slate-800/50 hover:bg-green-500/10 border border-slate-700 hover:border-green-500 rounded-xl transition-all group"
                >
                  <DollarSign className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white">Økonomi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('wellness')}
                  className="flex flex-col items-center gap-2 px-4 py-4 bg-slate-800/50 hover:bg-pink-500/10 border border-slate-700 hover:border-pink-500 rounded-xl transition-all group"
                >
                  <Heart className="w-6 h-6 text-pink-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white">Velvære</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('planning')}
                  className="flex flex-col items-center gap-2 px-4 py-4 bg-slate-800/50 hover:bg-blue-500/10 border border-slate-700 hover:border-blue-500 rounded-xl transition-all group"
                >
                  <Calendar className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white">Planlegging</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('health')}
                  className="flex flex-col items-center gap-2 px-4 py-4 bg-slate-800/50 hover:bg-red-500/10 border border-slate-700 hover:border-red-500 rounded-xl transition-all group"
                >
                  <Briefcase className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white">Sykdom & Jobb</span>
                </button>
              </div>
            </div>

            {generations.length > 0 && (
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Dine genereringer
                </h3>
                <div className="space-y-4">
                  {generations.map((gen) => (
                    <div
                      key={gen.id}
                      className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-500 transition-all cursor-pointer"
                      onClick={() => setSelectedGeneration(gen)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-medium">
                              {gen.content_type === 'blog' ? 'Blogg' : gen.content_type === 'social' ? 'Sosiale medier' : gen.content_type === 'email' ? 'E-post' : 'Annonse'}
                            </span>
                            <span className="text-slate-400 text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(gen.created_at).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <h4 className="text-white font-medium mb-1 line-clamp-1">{gen.prompt}</h4>
                          <p className="text-slate-400 text-sm line-clamp-2">{gen.generated_content}</p>
                          <p className="text-slate-500 text-xs mt-2">{gen.word_count} ord</p>
                        </div>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm('Er du sikker på at du vil slette denne genereringen?')) {
                              const { error } = await supabase
                                .from('generations')
                                .delete()
                                .eq('id', gen.id);
  
                              if (!error) {
                                setGenerations(prev => prev.filter(g => g.id !== gen.id));
                                setStats(prev => ({
                                  totalGenerations: prev.totalGenerations - 1,
                                  monthlyGenerations: prev.monthlyGenerations - 1,
                                  totalWords: prev.totalWords - gen.word_count
                                }));
                              }
                            }
                          }}
                          className="text-slate-400 hover:text-red-400 transition-colors p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
              </>
            )}

            {activeSection === 'sales' && (
              <SalesTracker />
            )}

            {activeSection === 'wellness' && (
              <WellnessTracker />
            )}

            {activeSection === 'planning' && (
              <CalendarPlanner />
            )}

            {activeSection === 'health' && (
              <HealthWorkTracker />
            )}
          </div>
        </div>
      </div>

    {showContentCreator && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-slate-800 rounded-xl max-w-2xl w-full p-8 relative border border-slate-700 shadow-xl my-8">
          <button
            onClick={() => setShowContentCreator(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>

          <h2 className="text-3xl font-bold text-white mb-6">Create New Content</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="blog">Blog Post</option>
                <option value="social">Social Media</option>
                <option value="email">Email</option>
                <option value="ad">Advertisement</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                What do you want to create?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Describe what content you want to generate..."
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateContent}
              disabled={generating}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              {generating ? 'Generating...' : 'Generate Content'}
            </button>

            {generatedContent && (
              <div className="mt-6 p-6 bg-slate-900 border border-slate-700 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Generert innhold</h3>
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-slate-300 text-sm">{generatedContent}</pre>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedContent);
                      alert('Innhold kopiert!');
                    }}
                    className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Kopier innhold
                  </button>
                  <button
                    onClick={() => {
                      setShowContentCreator(false);
                      setGeneratedContent('');
                      setPrompt('');
                    }}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Lukk og gå tilbake
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {selectedGeneration && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-slate-800 rounded-xl max-w-3xl w-full p-8 relative border border-slate-700 shadow-xl my-8">
          <button
            onClick={() => setSelectedGeneration(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-medium">
                {selectedGeneration.content_type === 'blog' ? 'Blogg' : selectedGeneration.content_type === 'social' ? 'Sosiale medier' : selectedGeneration.content_type === 'email' ? 'E-post' : 'Annonse'}
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(selectedGeneration.created_at).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{selectedGeneration.prompt}</h2>
            <p className="text-slate-400 text-sm">{selectedGeneration.word_count} ord</p>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-slate-300 text-sm font-sans">{selectedGeneration.generated_content}</pre>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedGeneration.generated_content);
                alert('Innhold kopiert!');
              }}
              className="flex-1 px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
            >
              Kopier innhold
            </button>
            <button
              onClick={() => setSelectedGeneration(null)}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Lukk
            </button>
          </div>
        </div>
      </div>
    )}

    {showUpgradeModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-slate-800 rounded-xl max-w-5xl w-full p-8 relative border border-slate-700 shadow-xl my-8">
          <button
            onClick={() => setShowUpgradeModal(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>

          <h2 className="text-3xl font-bold text-white mb-2 text-center">Upgrade Your Plan</h2>
          <p className="text-slate-400 text-center mb-8">Choose the perfect plan for your needs</p>

          {(error || debugInfo) && (
            <div className="mb-6">
              {error && (
                <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4">
                  <h3 className="text-red-200 font-semibold mb-2">Error:</h3>
                  <p className="text-red-100 text-sm break-words">{error}</p>
                </div>
              )}
              {debugInfo && (
                <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-4">
                  <h3 className="text-blue-200 font-semibold mb-2">Debug Info:</h3>
                  <p className="text-blue-100 text-sm break-words font-mono">{debugInfo}</p>
                </div>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {plans.filter(plan => plan.tier !== 'free').map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-gradient-to-br backdrop-blur-sm border rounded-xl p-6 transition-all ${
                  plan.tier === 'pro'
                    ? 'from-slate-700 to-slate-800 border-cyan-500 ring-2 ring-cyan-500/30 scale-105'
                    : 'from-slate-800/80 to-slate-900/80 border-slate-600 hover:border-slate-500'
                }`}
              >
                {plan.tier === 'pro' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </div>
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">
                    kr {(plan.price_monthly / 100).toFixed(0)}
                  </span>
                  <span className="text-slate-400 text-base">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {(plan.features as string[]).map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start text-slate-300 text-sm">
                      <Sparkles className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgrade(plan.payment_link || null)}
                  disabled={!plan.payment_link}
                  className={`w-full py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.tier === 'pro'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  Upgrade Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
