import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Check, X, Crown, Sparkles, Zap } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  stripe_payment_link: string | null;
  features: string[];
  display_order: number;
}

interface UserSubscription {
  plan_name: string;
  status: string;
  current_period_end: string | null;
}

interface PricingProps {
  onClose: () => void;
}

export function Pricing({ onClose }: PricingProps) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    loadPricingData();
  }, [user]);

  const loadPricingData = async () => {
    try {
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (plansData) {
        setPlans(plansData);
      }

      if (user) {
        const { data: subscriptionData } = await supabase
          .from('user_subscriptions')
          .select(`
            status,
            current_period_end,
            subscription_plans!inner(name)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (subscriptionData) {
          setCurrentSubscription({
            plan_name: (subscriptionData as any).subscription_plans.name,
            status: subscriptionData.status,
            current_period_end: subscriptionData.current_period_end,
          });
        }
      }
    } catch (error) {
      console.error('Error loading pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toFixed(0);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'premium':
        return <Sparkles className="w-6 h-6" />;
      case 'pro':
        return <Crown className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'premium':
        return 'from-teal-500 to-blue-500';
      case 'pro':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.name === 'Free') {
      alert('You are already on the Free plan!');
      return;
    }

    if (!plan.stripe_payment_link) {
      alert('Payment link not configured yet. Please contact support.');
      return;
    }

    window.open(plan.stripe_payment_link, '_blank');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-4xl w-full">
          <div className="text-center text-gray-600">Loading pricing...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-8 max-w-6xl w-full my-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
            <p className="text-gray-600">Unlock your full wellness potential</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {currentSubscription && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              <strong>Current Plan:</strong> {currentSubscription.plan_name}
              {currentSubscription.current_period_end && (
                <span className="ml-2 text-sm">
                  (Valid until {new Date(currentSubscription.current_period_end).toLocaleDateString()})
                </span>
              )}
            </p>
          </div>
        )}

        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition relative ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const price = billingPeriod === 'monthly' ? plan.price_monthly : plan.price_yearly;
            const isCurrentPlan = currentSubscription?.plan_name === plan.name;
            const isPro = plan.name.toLowerCase() === 'pro';

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 transition-all hover:shadow-xl ${
                  isPro
                    ? 'border-orange-400 shadow-lg scale-105'
                    : isCurrentPlan
                    ? 'border-teal-400'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`bg-gradient-to-br ${getPlanColor(plan.name)} p-3 rounded-xl text-white`}>
                    {getPlanIcon(plan.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-6 min-h-[40px]">{plan.description}</p>

                <div className="mb-6">
                  {price === 0 ? (
                    <div className="text-4xl font-bold text-gray-900">Free</div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900">{formatPrice(price)} kr</span>
                        <span className="text-gray-600">/{billingPeriod === 'monthly' ? 'md' : 'år'}</span>
                      </div>
                      {billingPeriod === 'yearly' && (
                        <p className="text-sm text-green-600 mt-1">
                          Spar {formatPrice(plan.price_monthly * 12 - price)} kr per år
                        </p>
                      )}
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition mb-6 ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : isPro
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                      : 'bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-600 hover:to-blue-600'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.name === 'Free' ? 'Get Started' : 'Upgrade Now'}
                </button>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700 mb-3">What's included:</p>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>All plans include a 7-day free trial. Cancel anytime.</p>
          <p className="mt-2">Secure payment powered by Stripe</p>
        </div>
      </div>
    </div>
  );
}
