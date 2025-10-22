import { useState, useEffect } from 'react';
import { Sparkles, LogOut, FileText, Mail, Share2, Megaphone, Crown, Zap, TrendingUp, Gift, Flame, Heart, Copy, CheckCircle2, Edit3, Save, X, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Generation, UsageLimit, SubscriptionPlan } from '../lib/supabase';
import { Logo } from './Logo';

type ContentType = 'blog' | 'social' | 'email' | 'ad';

const socialMediaSuggestions = [
  'Product launch announcement',
  'Behind-the-scenes content',
  'Customer testimonial',
  'Tips and tricks',
  'Industry news',
  'Motivational quote',
  'Contest or giveaway',
  'Before and after transformation',
  'Team introduction',
  'How-to tutorial',
];

export function Dashboard() {
  const { profile, signOut } = useAuth();
  const [contentType, setContentType] = useState<ContentType>('blog');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [usageLimit, setUsageLimit] = useState<UsageLimit | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [upgrading, setUpgrading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const contentBoxRef = useState<HTMLDivElement | null>(null)[0];
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [expandPrompt, setExpandPrompt] = useState('');

  useEffect(() => {
    loadGenerations();
    loadUsageLimit();
    loadPlans();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalTip = () => {
    const tips = [
      'Content is king, but consistency is queen!',
      'Your next viral post is just one generation away.',
      'Every great content creator started with a single post.',
      'The best time to start was yesterday. The second best time is now.',
      'Quality content attracts quality audience.',
      'Ideas are everywhere. We help you capture them.',
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  const loadGenerations = async () => {
    const { data } = await supabase
      .from('generations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setGenerations(data);
    }
  };

  const loadUsageLimit = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle();

    if (data) {
      setUsageLimit(data);
    }
  };

  const loadPlans = async () => {
    const { data } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_monthly', { ascending: true });

    if (data) {
      setPlans(data);
    }
  };

  const handleUpgrade = async (priceId: string, tier: string) => {
    setUpgrading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert('Please log in to upgrade');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ priceId, tier }),
        }
      );

      const { url, error } = await response.json();

      if (error) {
        alert('Failed to create checkout session: ' + error);
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !profile) return;

    if (usageLimit && usageLimit.generations_used >= usageLimit.generations_limit) {
      setShowUpgrade(true);
      return;
    }

    setLoading(true);
    setShowConfetti(false);

    const mockContent = generateMockContent(contentType, prompt);

    try {
      const { data, error } = await supabase
        .from('generations')
        .insert({
          user_id: profile.id,
          content_type: contentType,
          prompt,
          generated_content: mockContent,
          word_count: mockContent.split(' ').length,
        })
        .select()
        .single();

      if (!error && data) {
        setGeneratedContent(mockContent);
        setGenerations([data, ...generations]);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);

        setTimeout(() => {
          const contentBox = document.getElementById('generated-content-box');
          if (contentBox) {
            contentBox.scrollTop = 0;
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 150);

        if (usageLimit) {
          await supabase
            .from('usage_limits')
            .update({ generations_used: usageLimit.generations_used + 1 })
            .eq('user_id', profile.id);

          setUsageLimit({
            ...usageLimit,
            generations_used: usageLimit.generations_used + 1,
          });
        }
      }
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockContent = (type: ContentType, userPrompt: string): string => {
    const templates = {
      blog: `# ${userPrompt}\n\nIn today's fast-paced digital world, understanding ${userPrompt.toLowerCase()} has become crucial for success. This comprehensive guide will walk you through everything you need to know.\n\n## Key Insights\n\n1. **Strategic Approach**: Taking a methodical approach ensures better outcomes and sustainable growth.\n\n2. **Data-Driven Decisions**: Leveraging analytics and insights helps optimize your strategy.\n\n3. **Continuous Improvement**: Regular evaluation and adaptation keep you ahead of the curve.\n\n## Conclusion\n\nBy implementing these strategies, you'll be well-positioned to achieve your goals and drive meaningful results.`,
      social: `🚀 Exciting news about ${userPrompt}!\n\nWe're thrilled to share this game-changing update with you. Here's what makes it special:\n\n✨ Innovative approach\n💡 Proven results\n🎯 Easy to implement\n\nReady to level up? Let's make it happen! 💪\n\n#Innovation #Growth #Success`,
      email: `Subject: Transform Your Results with ${userPrompt}\n\nHi there,\n\nI wanted to reach out because I have something that could make a real difference for you.\n\nImagine achieving better results while saving time and resources. That's exactly what ${userPrompt.toLowerCase()} can do for you.\n\nHere's what you'll get:\n• Proven strategies that work\n• Step-by-step implementation guide\n• Ongoing support and resources\n\nReady to get started? Simply reply to this email and let's discuss how we can help you succeed.\n\nBest regards,\nYour Team`,
      ad: `🎯 ${userPrompt} - Limited Time Offer!\n\nDiscover the secret to [achieving amazing results].\n\n✓ Fast implementation\n✓ Proven track record\n✓ Money-back guarantee\n\nJoin thousands of satisfied customers who've already transformed their [business/life].\n\n👉 Click now to claim your exclusive discount!\n\nDon't miss out - offer ends soon!`,
    };

    return templates[type];
  };

  const handleExpand = async () => {
    if (!expandPrompt.trim() || !profile) return;

    if (usageLimit && usageLimit.generations_used >= usageLimit.generations_limit) {
      setShowUpgrade(true);
      return;
    }

    setLoading(true);

    const additionalContent = `\n\n## ${expandPrompt}\n\n${expandPrompt} is an important aspect to consider. Let me elaborate on this further.\n\nThis addition provides valuable insights and expands on the original content. By incorporating these details, we create a more comprehensive and engaging piece that addresses the topic from multiple angles.\n\nKey points to remember:\n- Always stay focused on your audience's needs\n- Provide actionable insights and practical examples\n- Maintain a consistent tone throughout\n\nWith these additions, your content becomes even more valuable and informative.`;

    const expandedContent = (isEditing ? editedContent : generatedContent) + additionalContent;

    try {
      const { data, error } = await supabase
        .from('generations')
        .insert({
          user_id: profile.id,
          content_type: contentType,
          prompt: `${prompt} + ${expandPrompt}`,
          generated_content: expandedContent,
          word_count: expandedContent.split(' ').length,
        })
        .select()
        .single();

      if (!error && data) {
        if (isEditing) {
          setEditedContent(expandedContent);
        } else {
          setGeneratedContent(expandedContent);
        }
        setGenerations([data, ...generations]);
        setExpandPrompt('');

        setTimeout(() => {
          const contentBox = document.getElementById('generated-content-box');
          if (contentBox) {
            contentBox.scrollTop = contentBox.scrollHeight;
          }
        }, 150);

        if (usageLimit) {
          await supabase
            .from('usage_limits')
            .update({ generations_used: usageLimit.generations_used + 1 })
            .eq('user_id', profile.id);

          setUsageLimit({
            ...usageLimit,
            generations_used: usageLimit.generations_used + 1,
          });
        }
      }
    } catch (error) {
      console.error('Error expanding content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = () => {
    setGeneratedContent(editedContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(generatedContent);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setEditedContent(generatedContent);
    setIsEditing(true);
  };

  const contentTypeConfig = {
    blog: { icon: FileText, label: 'Blog Post', color: 'cyan' },
    social: { icon: Share2, label: 'Social Media', color: 'blue' },
    email: { icon: Mail, label: 'Email', color: 'green' },
    ad: { icon: Megaphone, label: 'Advertisement', color: 'orange' },
  };

  const usagePercentage = usageLimit
    ? (usageLimit.generations_used / usageLimit.generations_limit) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <nav className="relative z-10 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size={36} />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">ContentAI</span>
          </div>
          <div className="flex items-center space-x-4">
            {profile && (
              <>
                <div className="flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                  {profile.subscription_tier === 'free' && (
                    <span className="text-slate-400 text-sm">Free Plan</span>
                  )}
                  {profile.subscription_tier === 'pro' && (
                    <>
                      <Crown className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 text-sm font-medium">Pro</span>
                    </>
                  )}
                  {profile.subscription_tier === 'enterprise' && (
                    <>
                      <Crown className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-400 text-sm font-medium">Enterprise</span>
                    </>
                  )}
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {getGreeting()}, {profile?.full_name || profile?.email?.split('@')[0] || 'Creator'}!
          </h1>
          <p className="text-slate-400 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            {getMotivationalTip()}
          </p>
        </div>
        {usageLimit && (
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-slate-300 font-semibold">Monthly Usage</span>
              </div>
              <span className="text-white font-bold text-lg">
                {usageLimit.generations_used} / {usageLimit.generations_limit}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  usagePercentage >= 90
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : usagePercentage >= 70
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
            {usagePercentage >= 80 && profile?.subscription_tier === 'free' && (
              <div className="mt-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4">
                <p className="text-orange-300 text-sm mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  You're running low! Upgrade now to keep the creativity flowing.
                </p>
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  See Pro Plans
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            {generatedContent && (
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 shadow-xl animate-[slideIn_0.3s_ease-out] mb-6">
                {showConfetti && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full animate-[fall_2s_ease-out_forwards]"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: '-10px',
                          backgroundColor: ['#22D3EE', '#3B82F6', '#06B6D4', '#F59E0B', '#10B981'][Math.floor(Math.random() * 5)],
                          animationDelay: `${Math.random() * 0.5}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-400 animate-pulse" />
                    <h3 className="text-2xl font-bold text-white">Your Fresh Content</h3>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={handleStartEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-6 text-slate-300 min-h-[500px] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
                  />
                ) : (
                  <div
                    id="generated-content-box"
                    className="bg-slate-900 border border-slate-700 rounded-lg p-6 text-slate-300 whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed scroll-smooth"
                  >
                    {generatedContent}
                  </div>
                )}

                {isEditing ? (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mt-4 bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                      <label className="block text-slate-300 mb-2 text-sm font-medium">
                        Add more content
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={expandPrompt}
                          onChange={(e) => setExpandPrompt(e.target.value)}
                          placeholder="e.g., Add a section about benefits"
                          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && handleExpand()}
                        />
                        <button
                          onClick={handleExpand}
                          disabled={loading || !expandPrompt.trim()}
                          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(generatedContent);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch (err) {
                          console.error('Failed to copy:', err);
                        }
                      }}
                      className="mt-4 w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          Copy to Clipboard
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 mb-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">Generate Content</h2>
              </div>

              <div className="mb-6">
                <label className="block text-slate-300 mb-3 text-sm font-medium">
                  Content Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(contentTypeConfig) as ContentType[]).map((type) => {
                    const config = contentTypeConfig[type];
                    const Icon = config.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => setContentType(type)}
                        className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                          contentType === type
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                            : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-slate-300 text-sm font-medium">
                    What do you want to create?
                  </label>
                  {contentType === 'social' && (
                    <button
                      onClick={() => setShowSuggestions(!showSuggestions)}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                    >
                      {showSuggestions ? 'Hide' : 'Show'} Ideas
                    </button>
                  )}
                </div>

                {contentType === 'social' && showSuggestions && (
                  <div className="mb-3 bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-xs font-medium mb-2">CLICK AN IDEA:</p>
                    <div className="flex flex-wrap gap-2">
                      {socialMediaSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setPrompt(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 rounded-lg text-sm transition-all"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    contentType === 'social'
                      ? 'e.g., Product launch announcement'
                      : 'e.g., Write a blog post about sustainable living tips'
                  }
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="relative w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 shadow-2xl shadow-cyan-500/40 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                <Sparkles className="w-6 h-6 relative z-10" />
                <span className="relative z-10">{loading ? 'Cooking up something special...' : 'Generate Content'}</span>
              </button>
            </div>
          </div>

          <div>
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-6">Recent Generations</h3>
              <div className="space-y-3">
                {generations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-400 mb-2">
                      Nothing here yet!
                    </p>
                    <p className="text-slate-500 text-sm">
                      Your content history will appear here once you start creating.
                    </p>
                  </div>
                ) : (
                  generations.map((gen) => {
                    const Icon = contentTypeConfig[gen.content_type].icon;
                    return (
                      <div
                        key={gen.id}
                        className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 hover:border-cyan-500 hover:bg-slate-900 hover:shadow-lg hover:shadow-cyan-500/10 transition-all cursor-pointer active:scale-[0.98] transform hover:-translate-y-1"
                        onClick={() => {
                          setGeneratedContent(gen.generated_content);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <Icon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{gen.prompt}</p>
                            <p className="text-slate-400 text-sm mt-1">
                              {new Date(gen.created_at).toLocaleDateString()} • {gen.word_count}{' '}
                              words
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showUpgrade && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-4xl w-full p-8 border border-slate-700">
            <h3 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <Crown className="w-8 h-8 text-yellow-400" />
              Level Up Your Content Game
            </h3>
            <p className="text-slate-300 mb-8">
              Get more generations, advanced features, and priority support. Pick the plan that matches your ambition.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {plans
                .filter((plan) => plan.tier !== 'free')
                .map((plan) => (
                  <div
                    key={plan.id}
                    className={`bg-slate-900/50 border rounded-xl p-6 ${
                      plan.tier === 'pro'
                        ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                        : 'border-slate-700'
                    }`}
                  >
                    <h4 className="text-2xl font-bold text-white mb-2">{plan.name}</h4>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-white">
                        ${(plan.price_monthly / 100).toFixed(0)}
                      </span>
                      <span className="text-slate-400">/month</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start text-sm">
                          <span className="text-cyan-400 mr-2">✓</span>
                          <span className="text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleUpgrade(plan.stripe_price_id, plan.tier)}
                      disabled={upgrading}
                      className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                        plan.tier === 'pro'
                          ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {upgrading ? 'Processing...' : `Upgrade to ${plan.name}`}
                    </button>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setShowUpgrade(false)}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
