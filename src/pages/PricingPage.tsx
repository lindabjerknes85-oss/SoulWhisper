import React, { useState, useEffect } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/Navbar';
import { supabase, SubscriptionPlan } from '../lib/supabase';

export function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const { data } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_monthly', { ascending: true });

    if (data) {
      setPlans(data);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!user) {
      navigate('/signup');
      return;
    }

    if (plan.tier === 'free') {
      navigate('/dashboard');
      return;
    }

    if (plan.payment_link) {
      console.log('Redirecting to payment link:', plan.payment_link);
      window.open(plan.payment_link, '_blank');
    } else {
      console.error('No payment link found for plan:', plan.name);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-slate-400">
            Select the perfect plan for your content generation needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
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

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm">{plan.generations_limit} generations/month</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-extrabold text-white">
                  {plan.price_monthly === 0 ? 'Free' : `kr ${(plan.price_monthly / 100).toFixed(0)}`}
                </span>
                {plan.price_monthly > 0 && <span className="text-slate-400 text-lg">/måned</span>}
              </div>

              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
                  plan.tier === 'pro'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {plan.tier === 'free' ? 'Start Free' : 'Subscribe Now'}
              </button>

              <div className="mt-8 pt-8 border-t border-slate-700">
                <h4 className="text-sm font-medium text-slate-300 tracking-wide uppercase mb-6">
                  What's included
                </h4>
                <ul className="space-y-4">
                  {(plan.features as string[]).map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <Check className="flex-shrink-0 h-5 w-5 text-cyan-400 mt-0.5" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}