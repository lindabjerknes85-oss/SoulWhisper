/*
  # AI Content Generator - Database Schema

  ## Overview
  This migration sets up the complete database schema for an AI content generation SaaS platform
  with subscription-based monetization.

  ## 1. New Tables

  ### `profiles`
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `subscription_tier` (text) - Current subscription: 'free', 'pro', 'enterprise'
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `generations`
  - `id` (uuid, primary key) - Unique generation ID
  - `user_id` (uuid, foreign key) - References profiles.id
  - `content_type` (text) - Type: 'blog', 'social', 'email', 'ad'
  - `prompt` (text) - User's input prompt
  - `generated_content` (text) - AI-generated output
  - `word_count` (integer) - Number of words generated
  - `created_at` (timestamptz) - Generation timestamp

  ### `usage_limits`
  - `id` (uuid, primary key) - Unique limit ID
  - `user_id` (uuid, foreign key) - References profiles.id
  - `generations_used` (integer) - Generations used this month
  - `generations_limit` (integer) - Monthly generation limit
  - `reset_date` (timestamptz) - When the counter resets
  - `updated_at` (timestamptz) - Last update timestamp

  ### `subscription_plans`
  - `id` (uuid, primary key) - Plan ID
  - `name` (text) - Plan name: 'Free', 'Pro', 'Enterprise'
  - `tier` (text) - Tier identifier: 'free', 'pro', 'enterprise'
  - `price_monthly` (integer) - Monthly price in cents
  - `generations_limit` (integer) - Monthly generation limit
  - `features` (jsonb) - List of features
  - `created_at` (timestamptz) - Plan creation timestamp

  ## 2. Security

  All tables have Row Level Security (RLS) enabled with the following policies:

  ### profiles
  - Users can view their own profile
  - Users can update their own profile
  - Users can insert their own profile on signup

  ### generations
  - Users can view their own generations
  - Users can create new generations (with usage limit check)
  - Users can delete their own generations

  ## 3. Important Notes

  - All tables use RLS for security
  - Usage limits reset monthly
  - Free tier: 10 generations/month
  - Pro tier: 500 generations/month
  - Enterprise tier: Unlimited generations
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
  reset_date timestamptz NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tier text NOT NULL UNIQUE CHECK (tier IN ('free', 'pro', 'enterprise')),
  price_monthly integer NOT NULL DEFAULT 0,
  generations_limit integer NOT NULL,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, tier, price_monthly, generations_limit, features)
VALUES 
  ('Free', 'free', 0, 10, '["10 generations per month", "Basic templates", "Community support"]'::jsonb),
  ('Pro', 'pro', 2900, 500, '["500 generations per month", "Advanced templates", "Priority support", "Export options", "Team collaboration"]'::jsonb),
  ('Enterprise', 'enterprise', 9900, 999999, '["Unlimited generations", "Custom templates", "Dedicated support", "API access", "Advanced analytics", "White-label option"]'::jsonb)
ON CONFLICT (tier) DO NOTHING;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Generations policies
CREATE POLICY "Users can view own generations"
  ON generations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create generations"
  ON generations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations"
  ON generations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Usage limits policies
CREATE POLICY "Users can view own usage limits"
  ON usage_limits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage limits"
  ON usage_limits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage limits"
  ON usage_limits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Subscription plans policies (public read)
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_id ON usage_limits(user_id);

-- Function to automatically create profile and usage limits on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, subscription_tier)
  VALUES (NEW.id, NEW.email, 'free');
  
  INSERT INTO usage_limits (user_id, generations_used, generations_limit)
  VALUES (NEW.id, 0, 10);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();