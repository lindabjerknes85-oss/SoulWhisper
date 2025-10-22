/*
  # Create Content Creator Platform Schema

  1. New Tables
    - `profiles`: User profiles with subscription tier
    - `generations`: AI content generations history
    - `usage_limits`: Monthly generation limits per user
    - `subscription_plans`: Available subscription tiers

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Subscription plans are readable by all authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create generations table
CREATE TABLE IF NOT EXISTS generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('blog', 'social', 'email', 'ad')),
  prompt text NOT NULL,
  generated_content text NOT NULL,
  word_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create usage_limits table
CREATE TABLE IF NOT EXISTS usage_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  generations_used integer NOT NULL DEFAULT 0,
  generations_limit integer NOT NULL DEFAULT 10,
  reset_date timestamptz DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tier text NOT NULL UNIQUE CHECK (tier IN ('free', 'pro', 'enterprise')),
  price_monthly integer NOT NULL DEFAULT 0,
  stripe_price_id text,
  generations_limit integer NOT NULL,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Insert default subscription plans with creator-focused features
INSERT INTO subscription_plans (name, tier, price_monthly, generations_limit, features)
VALUES 
  ('Free', 'free', 0, 10, '["10 AI content generations/month", "Basic blog & social templates", "Income tracking", "Wellness reminders", "Community support"]'::jsonb),
  ('Pro', 'pro', 2900, 500, '["500 AI content generations/month", "All content templates", "Income & expense tracking", "Wellness & meditation tracking", "Content calendar", "Analytics dashboard", "Priority support"]'::jsonb),
  ('Enterprise', 'enterprise', 9900, 999999, '["Unlimited AI content generations", "Custom templates", "Advanced income analytics", "Team collaboration", "API access", "White-label options", "Dedicated support"]'::jsonb)
ON CONFLICT (tier) DO UPDATE SET
  features = EXCLUDED.features;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Generations policies
CREATE POLICY "Users can view own generations" ON generations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create generations" ON generations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own generations" ON generations FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Usage limits policies
CREATE POLICY "Users can view own usage" ON usage_limits FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own usage" ON usage_limits FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Subscription plans policies
CREATE POLICY "Anyone can view plans" ON subscription_plans FOR SELECT TO authenticated USING (true);
