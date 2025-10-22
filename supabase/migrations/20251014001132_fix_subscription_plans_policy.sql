/*
  # Fix subscription plans visibility

  1. Changes
    - Drop existing restrictive policy
    - Add new policy allowing anonymous users to view plans
    - This is safe because subscription plans are public information

  2. Security
    - Read-only access for everyone (anon + authenticated)
    - No write access for regular users
*/

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans;

-- Create new policy that allows anonymous access
CREATE POLICY "Public can view subscription plans"
  ON subscription_plans
  FOR SELECT
  TO anon, authenticated
  USING (true);
