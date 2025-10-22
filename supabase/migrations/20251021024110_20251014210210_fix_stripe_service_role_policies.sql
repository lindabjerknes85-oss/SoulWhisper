/*
  # Fix Stripe tables policies for service role access

  1. Changes
    - Add policies to allow service role (edge functions) to insert/update stripe_customers
    - Add policies to allow service role to insert/update stripe_subscriptions
    - Keep existing user policies for read access

  2. Security
    - Service role can create and update customer/subscription records
    - Regular users can only view their own data
*/

-- Allow service role to insert and update stripe_customers
CREATE POLICY "Service role can insert customers"
  ON stripe_customers
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update customers"
  ON stripe_customers
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow service role to insert and update stripe_subscriptions  
CREATE POLICY "Service role can insert subscriptions"
  ON stripe_subscriptions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update subscriptions"
  ON stripe_subscriptions
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete subscriptions"
  ON stripe_subscriptions
  FOR DELETE
  TO service_role
  USING (true);