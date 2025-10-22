/*
  # Add Service Role SELECT Policies for Stripe Tables

  1. Changes
    - Add SELECT policy for service_role on stripe_customers table
    - Add SELECT policy for service_role on stripe_subscriptions table
  
  2. Security
    - Service role needs full access to read customer and subscription data
    - These policies allow the create-checkout edge function to query existing customers
*/

-- Add SELECT policy for service_role on stripe_customers
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stripe_customers' 
    AND policyname = 'Service role can select customers'
  ) THEN
    CREATE POLICY "Service role can select customers"
      ON stripe_customers
      FOR SELECT
      TO service_role
      USING (true);
  END IF;
END $$;

-- Add SELECT policy for service_role on stripe_subscriptions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stripe_subscriptions' 
    AND policyname = 'Service role can select subscriptions'
  ) THEN
    CREATE POLICY "Service role can select subscriptions"
      ON stripe_subscriptions
      FOR SELECT
      TO service_role
      USING (true);
  END IF;
END $$;