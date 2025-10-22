import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase initialization:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl || 'MISSING');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'MISSING');
  throw new Error('Supabase configuration is missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
};

export type Generation = {
  id: string;
  user_id: string;
  content_type: 'blog' | 'social' | 'email' | 'ad';
  prompt: string;
  generated_content: string;
  word_count: number;
  created_at: string;
};

export type UsageLimit = {
  id: string;
  user_id: string;
  generations_used: number;
  generations_limit: number;
  reset_date: string;
  updated_at: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  tier: 'free' | 'pro' | 'enterprise';
  price_monthly: number;
  generations_limit: number;
  features: string[];
  stripe_price_id: string;
  payment_link?: string;
  created_at: string;
};
