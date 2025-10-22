/*
  # Add Stripe Integration Fields

  1. Changes
    - Add `stripe_price_id` column to `subscription_plans` table
    - Add `stripe_customer_id` column to `profiles` table
    - Add `stripe_subscription_id` column to `profiles` table

  2. Security
    - No RLS changes needed (existing policies remain)
*/

-- Add Stripe price ID to subscription plans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_plans' AND column_name = 'stripe_price_id'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN stripe_price_id text DEFAULT '';
  END IF;
END $$;

-- Add Stripe customer ID to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_customer_id text;
  END IF;
END $$;

-- Add Stripe subscription ID to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_subscription_id text;
  END IF;
END $$;