-- Add PIX expiration timestamp to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS pix_expires_at timestamptz;