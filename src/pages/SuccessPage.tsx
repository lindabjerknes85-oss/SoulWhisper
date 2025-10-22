import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/Navbar';

export function SuccessPage() {
  const { user } = useAuth();
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('');

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;

      try {
        const { data: customerData } = await supabase
          .from('stripe_customers')
          .select('customer_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!customerData) return;

        const { data, error } = await supabase
          .from('stripe_subscriptions')
          .select('price_id, status')
          .eq('customer_id', customerData.customer_id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching subscription:', error);
          return;
        }

        if (data?.price_id) {
          const planNames: Record<string, string> = {
            'price_1SHG4VH5QFMYVsWN7Pxcx8XS': 'ContentAI Pro',
            'price_1SHG6BH5QFMYVsWNBToOk4Y5': 'ContentAI Enterprise'
          };

          setSubscriptionPlan(planNames[data.price_id] || 'Premium Plan');
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };

    fetchSubscription();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl py-8 px-4 sm:px-10 shadow-2xl">
            <div className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
              <h2 className="mt-6 text-3xl font-extrabold text-white">
                Payment Successful!
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Thank you for subscribing to Soul Whisper
              </p>

              {subscriptionPlan && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 rounded-xl">
                  <p className="text-sm font-medium text-green-300 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    You're now subscribed to: <span className="font-bold">{subscriptionPlan}</span>
                  </p>
                </div>
              )}

              <div className="mt-8 space-y-4">
                <Link
                  to="/dashboard"
                  className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <Link
                  to="/"
                  className="w-full flex justify-center items-center px-4 py-3 border border-slate-600 rounded-xl shadow-sm text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}