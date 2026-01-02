-- Add transaction_details column to store payment transaction data
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS transaction_details jsonb;