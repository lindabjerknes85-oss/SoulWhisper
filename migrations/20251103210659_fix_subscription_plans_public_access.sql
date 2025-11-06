/*
  # Fix Public Access to Subscription Plans
  
  1. Changes
    - Drop existing restrictive policy
    - Create new policy allowing ANYONE (authenticated or anonymous) to view plans
    
  2. Security
    - Public read access for subscription plans is safe
    - Plans are marketing information that should be visible to all
*/

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON subscription_plans;

-- Create new public read policy
CREATE POLICY "Public can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);
