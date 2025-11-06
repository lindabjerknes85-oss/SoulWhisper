import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, ArrowLeft } from 'lucide-react';

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

export function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    loadPricingData();
  }, []);

  const loadPricingData = async () => {
    console.log('🔥 PricingPage: loadPricingData CALLED at', new Date().toISOString());
    console.log('🔥 PricingPage: Window location:', window.location.href);
    try {
      console.log('🔥 PricingPage: Querying subscription_plans...');
      const { data: plansData, error } = await supabase
        .from('subscription_plans')
        .select('id, name, description, price_monthly, price_yearly, stripe_payment_link, features, display_order')
        .eq('is_active', true)
        .order('display_order');

      console.log('🔥 PricingPage: Error:', error);
      console.log('🔥 PricingPage: Raw data:', plansData);
      console.log('🔥 PricingPage: Data length:', plansData?.length);

      if (error) {
        console.error('❌ PricingPage: Supabase error:', error);
        alert('Failed to load pricing plans. Please refresh the page.');
        return;
      }

      if (plansData && plansData.length > 0) {
        console.log('🔥 PricingPage: Processing', plansData.length, 'plans');

        plansData.forEach((plan, index) => {
          console.log(`🔥 PricingPage Plan ${index + 1}:`, {
            name: plan.name,
            has_stripe_link: !!plan.stripe_payment_link,
            stripe_link: plan.stripe_payment_link,
            link_length: plan.stripe_payment_link?.length || 0,
            link_type: typeof plan.stripe_payment_link
          });
        });

        setPlans(plansData);
        console.log('🔥 PricingPage: Plans state updated!');
      } else {
        console.warn('⚠️ PricingPage: No plans data received!');
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

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    console.log('🚀 PricingPage: handleSelectPlan called');
    console.log('🚀 PricingPage: Selected plan:', plan.name);
    console.log('🚀 PricingPage: Full plan:', JSON.stringify(plan, null, 2));
    console.log('🚀 PricingPage: Payment link:', plan.stripe_payment_link);

    if (plan.name === 'Free') {
      window.location.href = '/';
      return;
    }

    if (!plan.stripe_payment_link) {
      console.error('❌ PricingPage: No payment link for:', plan.name);
      console.error('❌ PricingPage: Plan object:', plan);
      alert('Payment link not configured yet. Please contact support.');
      return;
    }

    console.log('✅ PricingPage: Opening payment link:', plan.stripe_payment_link);
    window.open(plan.stripe_payment_link, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-xl">Loading pricing...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </a>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Simple Pricing</h1>
          <p className="text-xl text-slate-400">Choose the perfect plan for your needs</p>
        </div>

        {plans.length === 0 ? (
          <div className="text-center text-slate-400 py-20">
            <p className="text-xl">No pricing plans available at the moment.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-12">
              <div className="bg-slate-800 rounded-lg p-1 flex gap-1">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-6 py-2 rounded-md font-medium transition ${
                    billingPeriod === 'monthly'
                      ? 'bg-teal-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-6 py-2 rounded-md font-medium transition relative ${
                    billingPeriod === 'yearly'
                      ? 'bg-teal-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Yearly
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => {
                const price = billingPeriod === 'monthly' ? plan.price_monthly : plan.price_yearly;
                const isPro = plan.name.toLowerCase() === 'pro';

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl border-2 p-8 transition-all hover:shadow-2xl ${
                      isPro
                        ? 'border-teal-400 bg-slate-800 shadow-xl scale-105'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    {isPro && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                          MOST POPULAR
                        </span>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-slate-400 text-sm min-h-[40px]">{plan.description}</p>
                    </div>

                    <div className="mb-8">
                      {price === 0 ? (
                        <div className="text-5xl font-bold text-white">Free</div>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-white">{formatPrice(price)}</span>
                            <span className="text-xl text-slate-400">kr</span>
                            <span className="text-slate-500">/{billingPeriod === 'monthly' ? 'md' : 'år'}</span>
                          </div>
                          {billingPeriod === 'yearly' && (
                            <p className="text-sm text-green-400 mt-2">
                              Spar {formatPrice(plan.price_monthly * 12 - price)} kr per år
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-4 px-6 rounded-lg font-semibold transition mb-8 ${
                        isPro
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 shadow-lg'
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      {plan.name === 'Free' ? 'Get Started' : 'Upgrade Now'}
                    </button>

                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-slate-300 mb-4">What's included:</p>
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-16 text-center text-sm text-slate-400">
              <p>All paid plans include a 7-day free trial. Cancel anytime.</p>
              <p className="mt-2">Secure payment powered by Stripe</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
