/*
  # Add Payment Link Column

  1. Changes
    - Add `payment_link` column to `subscription_plans` table
    - This will store direct Stripe Payment Links for each plan
    
  2. Notes
    - Payment links are simpler and more reliable than Checkout Sessions
    - No API key validation required
    - Direct redirect to Stripe-hosted checkout
*/

ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS payment_link text;