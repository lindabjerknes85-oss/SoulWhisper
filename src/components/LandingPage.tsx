import { Sparkles, Zap, TrendingUp, Check, Rocket, Target, Shield, ArrowRight, DollarSign, Clock, Users, Star, Calendar, Heart, Brain, Activity, Lightbulb, Briefcase, AlertCircle } from 'lucide-react';
import { SubscriptionPlan } from '../lib/supabase';
import { Logo } from './Logo';

type LandingPageProps = {
  onGetStarted: () => void;
  plans: SubscriptionPlan[];
};

export function LandingPage({ onGetStarted, plans }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size={36} />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">ContentAI</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#pricing" className="text-slate-300 hover:text-white font-medium transition-colors hidden sm:block">
              Pricing
            </a>
            <button
              onClick={onGetStarted}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
            >
              Start Free
            </button>
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
                For Content Creators Who Do It All
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-8 leading-tight">
              Create. Earn.
              <span className="block mt-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent animate-gradient">
                Stay Sane.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 mb-6 max-w-3xl mx-auto leading-relaxed">
              The only platform built for creators who need AI content, income tracking, and wellness reminders.
              <span className="block mt-2 text-cyan-400 font-semibold">Because burnout isn't a badge of honor.</span>
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8 max-w-4xl mx-auto">
              <span className="px-4 py-2 bg-slate-800/60 border border-cyan-500/30 rounded-full text-cyan-300 text-sm font-medium">
                AI Content Generator
              </span>
              <span className="px-4 py-2 bg-slate-800/60 border border-green-500/30 rounded-full text-green-300 text-sm font-medium">
                Income Tracking
              </span>
              <span className="px-4 py-2 bg-slate-800/60 border border-pink-500/30 rounded-full text-pink-300 text-sm font-medium">
                Wellness Reminders
              </span>
              <span className="px-4 py-2 bg-slate-800/60 border border-cyan-500/30 rounded-full text-cyan-300 text-sm font-medium">
                Content Calendar
              </span>
              <span className="px-4 py-2 bg-slate-800/60 border border-yellow-500/30 rounded-full text-yellow-300 text-sm font-medium">
                Daily Affirmations
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
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

            <div className="mt-12 flex justify-center">
              <div className="inline-flex items-center gap-8 bg-slate-800/50 border border-slate-700/50 rounded-xl px-8 py-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">Built by a creator, for creators</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 py-20">
          <div className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Create Faster</h3>
            <p className="text-slate-300 leading-relaxed">
              AI that writes blog posts, captions, and emails in your voice. Writer's block is no longer your problem.
            </p>
          </div>

          <div className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Track Your Income</h3>
            <p className="text-slate-300 leading-relaxed">
              See exactly what's working. Track income from sponsorships, affiliates, and sales all in one place.
            </p>
          </div>

          <div className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Avoid Burnout</h3>
            <p className="text-slate-300 leading-relaxed">
              Gentle reminders to breathe, take breaks, and stay grounded. Because sustainable success beats a crash.
            </p>
          </div>
        </div>

        <div className="py-20 border-t border-slate-700/50">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Everything you need as a creator
            </h2>
            <p className="text-xl text-slate-400">
              Content creation, business tracking, and self-care in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">AI Content Generator</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Generate blog posts, social media captions, and emails in seconds
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Income & Expense Tracking</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Track revenue from multiple sources: sponsorships, affiliates, products
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Content Calendar</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Plan your content schedule and never miss a posting deadline
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Inspiration Library</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Save quotes, ideas, and visions that keep you motivated
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Daily Affirmations</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Start your day with positive reminders customized for creators
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Wellness Tracking</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Log meditation sessions and track your mental health journey
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Fitness Tracker</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Log workouts and stay physically healthy while building your business
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Weekly Reflections</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Review what worked, celebrate wins, and plan your next moves
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Health Tracking</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Monitor sick days and health status to maintain work-life balance
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Work Log</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Track hours spent on projects and clients for better time management
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Analytics & Insights</h3>
              </div>
              <p className="text-slate-400 text-sm">
                See what content performs best and where your revenue comes from
              </p>
            </div>
          </div>
        </div>

        <div className="py-20" id="pricing">
          <div className="text-center mb-6">
            <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 rounded-full">
              <span className="text-green-300 font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Transparent Pricing
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
              Pricing for Creators
            </h2>
            <p className="text-xl text-slate-400 mb-6">Start free. Upgrade when your creator business grows.</p>
            <div className="flex items-center justify-center gap-2 text-sm text-cyan-400">
              <Shield className="w-4 h-4" />
              <span>Cancel anytime • Full refund within 7 days</span>
            </div>
          </div>
          <div className="max-w-5xl mx-auto mb-12 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-3">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">All-in-One</div>
                <p className="text-slate-400 text-sm">Content, income, and wellness tools</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">Save Time</div>
                <p className="text-slate-400 text-sm">AI-powered content generation</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-3">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">Stay Healthy</div>
                <p className="text-slate-400 text-sm">Built-in burnout prevention</p>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {plans
              .sort((a, b) => a.price_monthly - b.price_monthly)
              .map((plan) => (
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
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-white">
                      ${(plan.price_monthly / 100).toFixed(0)}
                    </span>
                    <span className="text-slate-400 text-lg">/month</span>
                  </div>
                  <p className="text-sm text-cyan-400 mb-6">
                    {plan.tier === 'free' && 'Get started for free'}
                    {plan.tier === 'pro' && 'For serious creators'}
                    {plan.tier === 'enterprise' && 'For creator teams'}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <Check className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={onGetStarted}
                    className={`group w-full py-4 rounded-xl font-bold transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
                      plan.tier === 'pro'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-700/50 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>© 2025 ContentAI. Generate smarter, not harder.</p>
        </div>
      </footer>
    </div>
  );
}
