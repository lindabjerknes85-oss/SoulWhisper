/*
  # Fix Subscription Plans - Truly Public Access
  
  1. Changes
    - Drop existing policy
    - Create policy with explicit TO public role
    - This allows both authenticated AND anonymous users to view plans
    
  2. Security
    - Public read-only access to active plans is safe
    - Plans are marketing information
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Public can view active subscription plans" ON subscription_plans;

-- Create truly public policy
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans 
  FOR SELECT
  TO public
  USING (is_active = true);
