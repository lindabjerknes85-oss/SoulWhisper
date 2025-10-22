import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Plan {
  id: string;
  name: string;
  tier: string;
  price_monthly: number;
  stripe_price_id: string | null;
  payment_link?: string | null;
  generations_limit: number;
  features: string[];
}

export function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price_monthly', { ascending: true });

        if (error) throw error;
        if (data) setPlans(data);
      } catch (error) {
        console.error('Error loading plans:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  const handleSubscribe = (plan: Plan) => {
    if (!user) {
      navigate('/login');
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

  const getIcon = (name: string) => {
    if (name.toLowerCase().includes('enterprise')) {
      return <Crown className="w-8 h-8" />;
    }
    if (name.toLowerCase().includes('pro')) {
      return <Zap className="w-8 h-8" />;
    }
    return <Star className="w-8 h-8" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Laster priser...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Select the perfect plan for your needs. All plans include access to our powerful tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isPopular = plan.tier === 'pro';
            const isEnterprise = plan.tier === 'enterprise';
            const isFree = plan.price_monthly === 0;

            return (
              <div
                key={plan.id}
                className={`relative bg-slate-800/50 backdrop-blur-sm border rounded-2xl p-8 transition-all duration-300 hover:scale-105 ${
                  isPopular
                    ? 'border-cyan-500 shadow-cyan-500/20 shadow-2xl'
                    : isEnterprise
                    ? 'border-amber-500 shadow-amber-500/20 shadow-2xl'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                    isPopular
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
                      : isEnterprise
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                      : 'bg-gradient-to-br from-slate-600 to-slate-700'
                  }`}>
                    {getIcon(plan.name)}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 mb-4">{plan.generations_limit === 999999 ? 'Unlimited generations' : `${plan.generations_limit} generations/month`}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">
                      {isFree ? 'Gratis' : `${(plan.price_monthly / 100).toFixed(0)} kr`}
                    </span>
                    {!isFree && <span className="text-slate-400 ml-2">/måned</span>}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-slate-300">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                    isPopular
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
                      : isEnterprise
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {isFree ? 'Kom i gang' : 'Abonner nå'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-400">
            All plans give you full access to the dashboard
          </p>
        </div>
      </div>
    </div>
  );
}