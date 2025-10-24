/*
  # Fix: Preserve Stripe Price IDs on migration reruns
  
  This migration ensures that stripe_price_id values are preserved when
  migrations rerun. The previous ON CONFLICT clause was overwriting the
  stripe_price_id with NULL every time.
  
  Changes:
  - Update the ON CONFLICT clause to preserve stripe_price_id
  - Only update features, not stripe_price_id
*/

-- First, let's ensure the plans exist with proper ON CONFLICT handling
INSERT INTO subscription_plans (name, tier, price_monthly, generations_limit, features, payment_link)
VALUES
  ('Free', 'free', 0, 10, '["10 AI content generations/month", "Basic blog & social templates", "Income tracking", "Wellness reminders", "Community support"]'::jsonb, NULL),
  ('Pro', 'pro', 2900, 500, '["500 AI content generations/month", "All content templates", "Income & expense tracking", "Wellness & meditation tracking", "Content calendar", "Analytics dashboard", "Priority support"]'::jsonb, 'https://buy.stripe.com/bJeeVd9jD1B5f2G19qffy07'),
  ('Enterprise', 'enterprise', 9900, 999999, '["Unlimited AI content generations", "Custom templates", "Advanced income analytics", "Team collaboration", "API access", "White-label options", "Dedicated support"]'::jsonb, 'https://buy.stripe.com/aFacN57bv0x107M19qffy06')
ON CONFLICT (tier) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  generations_limit = EXCLUDED.generations_limit,
  features = EXCLUDED.features,
  -- PRESERVE stripe_price_id and payment_link if they exist
  stripe_price_id = COALESCE(subscription_plans.stripe_price_id, EXCLUDED.stripe_price_id),
  payment_link = COALESCE(subscription_plans.payment_link, EXCLUDED.payment_link);
