/*
  # Fix subscription plans public access

  1. Changes
    - Drop existing restrictive policy
    - Add new policy that allows anonymous users to view plans
    
  2. Security
    - Allow SELECT for both authenticated and anonymous users
    - Keep table locked down for INSERT/UPDATE/DELETE operations
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view plans" ON subscription_plans;

-- Create new policy that allows anonymous access
CREATE POLICY "Public can view subscription plans"
  ON subscription_plans
  FOR SELECT
  TO anon, authenticated
  USING (true);