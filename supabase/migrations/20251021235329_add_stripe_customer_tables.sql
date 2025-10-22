/*
  # Add Stripe Customer and Subscription Tables

  1. New Tables
    - `stripe_customers`: Maps users to Stripe customer IDs
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `customer_id` (text, Stripe customer ID)
      - `created_at` (timestamp)
      - `deleted_at` (timestamp, for soft deletes)
    
    - `stripe_subscriptions`: Tracks Stripe subscriptions
      - `id` (uuid, primary key)
      - `customer_id` (text, Stripe customer ID)
      - `subscription_id` (text, Stripe subscription ID)
      - `status` (text, subscription status)
      - `price_id` (text, Stripe price ID)
      - `current_period_start` (timestamp)
      - `current_period_end` (timestamp)
      - `cancel_at_period_end` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only view their own customer data
    - Service role has full access for webhook processing
*/

-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT unique_user_customer UNIQUE (user_id)
);

-- Create stripe_subscriptions table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text NOT NULL,
  subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'not_started',
  price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_customer_id ON stripe_customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_id ON stripe_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_subscription_id ON stripe_subscriptions(subscription_id);

-- Enable RLS
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for stripe_customers
CREATE POLICY "Users can view own customer data"
  ON stripe_customers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage customers"
  ON stripe_customers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policies for stripe_subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON stripe_subscriptions FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage subscriptions"
  ON stripe_subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);