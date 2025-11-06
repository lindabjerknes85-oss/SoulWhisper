import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface UserSubscription {
  plan_name: string;
  status: string;
  current_period_end: string | null;
  features: string[];
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    loadSubscription();

    const channel = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_subscriptions')
        .select(`
          status,
          current_period_end,
          subscription_plans!inner(
            name,
            features
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (data) {
        setSubscription({
          plan_name: (data as any).subscription_plans.name,
          status: data.status,
          current_period_end: data.current_period_end,
          features: (data as any).subscription_plans.features,
        });
      } else {
        setSubscription({
          plan_name: 'Free',
          status: 'active',
          current_period_end: null,
          features: [
            'Basic mood tracking',
            'Daily journal entries',
            '5 mindfulness sessions',
            'Community access',
            'Weekly insights',
          ],
        });
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      setSubscription({
        plan_name: 'Free',
        status: 'active',
        current_period_end: null,
        features: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (featureName: string): boolean => {
    if (!subscription) return false;

    const plan = subscription.plan_name.toLowerCase();

    if (plan === 'pro') return true;
    if (plan === 'premium') {
      const freeOnlyFeatures = ['white-label', 'api access'];
      return !freeOnlyFeatures.some(f => featureName.toLowerCase().includes(f));
    }

    const freeFeatures = [
      'mood tracking',
      'journal',
      'mindfulness',
      'community',
    ];

    return freeFeatures.some(f => featureName.toLowerCase().includes(f));
  };

  const isPremiumOrHigher = (): boolean => {
    if (!subscription) return false;
    const plan = subscription.plan_name.toLowerCase();
    return plan === 'premium' || plan === 'pro';
  };

  const isPro = (): boolean => {
    if (!subscription) return false;
    return subscription.plan_name.toLowerCase() === 'pro';
  };

  return {
    subscription,
    loading,
    hasFeature,
    isPremiumOrHigher,
    isPro,
    isSubscribed: subscription?.plan_name !== 'Free',
  };
}
