/*
  # Fix subscription prices and add profile creation trigger

  1. Changes
    - Update Pro price from 2900 to 29900 (299 kr)
    - Update Enterprise price from 9900 to 79900 (799 kr)
    - Add trigger to automatically create profile when user signs up
    - Add trigger to create usage_limits when profile is created

  2. Security
    - No changes to RLS policies
*/

-- Fix subscription plan prices
UPDATE subscription_plans SET price_monthly = 29900 WHERE tier = 'pro';
UPDATE subscription_plans SET price_monthly = 79900 WHERE tier = 'enterprise';

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, subscription_tier)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'free'
  );
  
  INSERT INTO public.usage_limits (user_id, generations_used, generations_limit)
  VALUES (
    new.id,
    0,
    10
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();