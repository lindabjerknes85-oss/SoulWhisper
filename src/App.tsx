import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { PricingPage } from './pages/PricingPage';
import { DashboardPage } from './pages/DashboardPage';
import { SuccessPage } from './pages/SuccessPage';
import { AuthModal } from './components/AuthModal';
import { LoginForm } from './components/Auth/LoginForm';
import { SignupForm } from './components/Auth/SignupForm';
import { Pricing } from './components/Pricing';
import { supabase, SubscriptionPlan } from './lib/supabase';
import { Sparkles, Zap, Target, Rocket, ArrowRight, Shield, Users, Star, Clock, Check } from 'lucide-react';
import { Logo } from './components/Logo';

function HomePage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (error) {
        console.error('Error loading plans:', error);
        setPlans([]);
      } else if (data && data.length > 0) {
        setPlans(data);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error('Exception loading plans:', error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size={36} />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Soul Whisper</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#pricing" className="text-slate-300 hover:text-white font-medium transition-colors hidden sm:block">
                Pricing
              </a>
              {user ? (
                <a
                  href="/dashboard"
                  className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
                >
                  Dashboard
                </a>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
                >
                  Start Free
                </button>
              )}
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-24 pb-20 text-center relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute top-40 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>

            <div className="relative z-10">
              <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full">
                <span className="text-cyan-300 font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered Content Creation
                </span>
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-8 leading-tight">
                Your Soul is
                <span className="block mt-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent animate-gradient">
                  Whispering
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                Create blog posts, social content, emails, and ads that actually convert.
                <span className="block mt-2 text-cyan-400 font-semibold">Your AI content partner that never runs out of ideas.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="group px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-2xl shadow-cyan-500/50 flex items-center gap-3"
                >
                  Start Creating Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center gap-2 text-slate-400">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-sm">No credit card required</span>
                </div>
              </div>

            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 py-20">
            <div className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-slate-300 leading-relaxed">
                Writer's block? We don't know her. Generate stunning content in seconds while your coffee is still hot.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Actually Converts</h3>
              <p className="text-slate-300 leading-relaxed">
                Not just pretty words. Get content that speaks to real humans and turns readers into customers.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Scale Like Magic</h3>
              <p className="text-slate-300 leading-relaxed">
                From zero to content hero. Whether you need one post or a hundred, we've got your back.
              </p>
            </div>
          </div>

          <div className="py-20" id="pricing">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
                Simple Pricing
              </h2>
              <p className="text-xl text-slate-400">Choose the perfect plan for your needs</p>
            </div>
            {loading ? (
              <div className="text-center text-slate-400 py-12">
                <p>Loading pricing plans...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center text-slate-400 py-12">
                <p>No pricing plans available at the moment.</p>
              </div>
            ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, idx) => (
                <div
                  key={plan.id}
                  className={`relative bg-gradient-to-br backdrop-blur-sm border rounded-2xl p-8 transition-all transform hover:-translate-y-2 hover:shadow-2xl ${
                    plan.tier === 'pro'
                      ? 'from-slate-800 to-slate-900 border-cyan-500 ring-2 ring-cyan-500/30 scale-105 shadow-xl shadow-cyan-500/20'
                      : 'from-slate-800/80 to-slate-900/80 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {plan.tier === 'pro' && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Most Popular
                      </div>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-white">
                      {plan.price_monthly === 0 ? 'Free' : `kr ${(plan.price_monthly / 100).toFixed(0)}`}
                    </span>
                    {plan.price_monthly > 0 && <span className="text-slate-400 text-lg">/month</span>}
                  </div>
                  <ul className="space-y-3 mb-8 min-h-[240px]">
                    {(plan.features as string[]).map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start text-slate-300 text-sm">
                        <Check className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      if (plan.tier === 'free') {
                        setShowAuthModal(true);
                      } else if (user) {
                        if (plan.payment_link) {
                          console.log('Redirecting to payment link:', plan.payment_link);
                          window.open(plan.payment_link, '_blank');
                        } else {
                          console.error('No payment link found for plan:', plan.name);
                        }
                      } else {
                        if (plan.payment_link) {
                          localStorage.setItem('selectedPaymentLink', plan.payment_link);
                        }
                        setShowAuthModal(true);
                      }
                    }}
                    className={`w-full py-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
                      plan.tier === 'pro'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {plan.tier === 'free' ? 'Start Free' : 'Get Started'}
                  </button>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>

        <footer className="border-t border-slate-700/50 mt-16 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
            <p>© 2025 Soul Whisper. Generate smarter, not harder.</p>
          </div>
        </footer>
      </div>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;