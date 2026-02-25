
-- Add stripe_customer_id to profiles for linking users to Stripe
ALTER TABLE public.profiles ADD COLUMN stripe_customer_id TEXT;

-- Drop the old payment_methods table (we'll use Stripe as source of truth)
DROP TABLE IF EXISTS public.payment_methods;
