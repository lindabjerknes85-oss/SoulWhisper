/*
  # Add Subscription System with Stripe Payment Links

  1. New Tables
    - `subscription_plans`
      - `id` (uuid, primary key)
      - `name` (text) - Plan name (Free, Premium, Pro)
      - `description` (text) - Plan description
      - `price_monthly` (integer) - Price in cents
      - `price_yearly` (integer) - Price in cents (if applicable)
      - `stripe_payment_link` (text) - Stripe payment link URL
      - `stripe_price_id` (text) - Stripe price ID for verification
      - `features` (jsonb) - Array of features
      - `is_active` (boolean) - Whether plan is available
      - `display_order` (integer) - Order to display plans
      - `created_at` (timestamptz)
    
    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `plan_id` (uuid) - Reference to subscription_plans
      - `stripe_customer_id` (text) - Stripe customer ID
      - `stripe_subscription_id` (text) - Stripe subscription ID
      - `status` (text) - active/cancelled/expired
      - `current_period_start` (timestamptz) - Subscription period start
      - `current_period_end` (timestamptz) - Subscription period end
      - `cancel_at_period_end` (boolean) - Will cancel at end
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can view all plans
    - Users can only view their own subscriptions
    - Only service role can insert/update subscriptions (via webhook)

  3. Seed Data
    - Free, Premium, and Pro plans with example features
*/

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price_monthly integer DEFAULT 0,
  price_yearly integer DEFAULT 0,
  stripe_payment_link text,
  stripe_price_id text,
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_order ON subscription_plans(display_order);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- Create function to check user subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_tier(p_user_id uuid)
RETURNS text AS $$
DECLARE
  v_plan_name text;
BEGIN
  SELECT sp.name INTO v_plan_name
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
    AND (us.current_period_end IS NULL OR us.current_period_end > now());
  
  RETURN COALESCE(v_plan_name, 'Free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, display_order, stripe_payment_link) VALUES
  (
    'Free',
    'Perfect for getting started with your wellness journey',
    0,
    0,
    '["Basic mood tracking", "Daily journal entries", "5 mindfulness sessions", "Community access", "Weekly insights"]'::jsonb,
    1,
    NULL
  ),
  (
    'Premium',
    'Enhanced features for serious wellness enthusiasts',
    999,
    9990,
    '["Everything in Free", "Unlimited mindfulness sessions", "AI mood analysis", "Voice journaling", "Advanced analytics", "Priority support", "Custom wellness programs"]'::jsonb,
    2,
    'https://buy.stripe.com/test_YOUR_LINK_HERE'
  ),
  (
    'Pro',
    'Complete wellness solution with professional features',
    1999,
    19990,
    '["Everything in Premium", "Therapist access sharing", "Appointment scheduling", "Wearable device integration", "Personalized AI coaching", "Export all data", "API access", "White-label options"]'::jsonb,
    3,
    'https://buy.stripe.com/test_YOUR_LINK_HERE'
  )
ON CONFLICT DO NOTHING;

-- Create trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER update_user_subscriptions_updated_at
      BEFORE UPDATE ON user_subscriptions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
