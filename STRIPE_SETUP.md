# Stripe Integration Setup Guide

This application uses Stripe Payment Links for a simplified payment flow. No Edge Functions or webhooks are required.

## Step 1: Create Products and Payment Links in Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Products** in the sidebar
3. Click **+ Add product**

### Create Pro Plan

1. **Product name:** Soul Whisper Pro
2. **Description:** 500 generations per month with premium features
3. **Pricing:**
   - Select **Recurring**
   - Price: **299 NOK**
   - Billing period: **Monthly**
4. Click **Save product**
5. Click **Create payment link**
6. Configure the payment link and click **Create link**
7. **Copy the Payment Link URL** (starts with `https://buy.stripe.com/...`)

### Create Enterprise Plan

1. Click **+ Add product** again
2. **Product name:** Soul Whisper Enterprise
3. **Description:** Unlimited generations with advanced features
4. **Pricing:**
   - Select **Recurring**
   - Price: **799 NOK**
   - Billing period: **Monthly**
5. Click **Save product**
6. Click **Create payment link**
7. Configure the payment link and click **Create link**
8. **Copy the Payment Link URL** (starts with `https://buy.stripe.com/...`)

## Step 2: Update Database with Payment Links

Once you have both Payment Links, run these SQL commands in your Supabase SQL Editor:

```sql
-- Update Pro plan with your Stripe Payment Link
UPDATE subscription_plans
SET payment_link = 'https://buy.stripe.com/YOUR_PRO_PAYMENT_LINK'
WHERE tier = 'pro';

-- Update Enterprise plan with your Stripe Payment Link
UPDATE subscription_plans
SET payment_link = 'https://buy.stripe.com/YOUR_ENTERPRISE_PAYMENT_LINK'
WHERE tier = 'enterprise';
```

Replace the URLs with the actual Payment Links you copied from Stripe.

## Step 3: Test the Integration

1. Create a test account in your app
2. Click "Get Started" on the Pro or Enterprise plan
3. You will be redirected to Stripe's hosted checkout page
4. Use Stripe test card: `4242 4242 4242 4242`
5. Any future expiry date and any CVC
6. Complete the checkout
7. Stripe will handle the entire payment flow

## Benefits of Payment Links

- No Edge Functions to maintain
- No webhook configuration needed
- No API keys required in frontend
- Stripe hosts the entire checkout experience
- Simpler to implement and debug
- Faster page loads

## Important Notes

- Payment Links are the simplest way to accept payments with Stripe
- Stripe handles all the checkout UI and payment processing
- Use test mode for development (test links will have "test" in the URL)
- Switch to live mode when ready for production
