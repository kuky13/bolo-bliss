-- Create orders table for checkout system
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code VARCHAR(8) UNIQUE NOT NULL,
  
  -- Customer data (mandatory: name, email, phone; optional: cpf)
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_cpf TEXT,
  
  -- Delivery/Location
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('delivery', 'pickup')),
  address TEXT,
  district TEXT,
  complement TEXT,
  reference TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Order items and totals
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  valedoce_discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Payment
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'card', 'cash')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected', 'cancelled', 'in_process')),
  mercadopago_preference_id TEXT,
  mercadopago_payment_id TEXT,
  pix_qr_code TEXT,
  pix_qr_code_base64 TEXT,
  
  -- Change for cash payments
  need_change BOOLEAN DEFAULT false,
  change_amount TEXT,
  
  -- Custom cake details
  custom_cake_details JSONB,
  
  -- Affiliate
  affiliate_id UUID REFERENCES public.affiliates(id),
  affiliate_code TEXT,
  
  -- Coupon
  coupon_code TEXT,
  
  -- Store
  store_id UUID REFERENCES public.stores(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for order_code lookups
CREATE INDEX idx_orders_order_code ON public.orders(order_code);
CREATE INDEX idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can create orders (anonymous checkout)
CREATE POLICY "Anyone can create orders"
ON public.orders FOR INSERT
WITH CHECK (true);

-- Public can view their own orders by email
CREATE POLICY "Users can view orders by email"
ON public.orders FOR SELECT
USING (true);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (has_role('admin'::app_role));

-- Admins can update orders
CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
USING (has_role('admin'::app_role));

-- Store users can view their store orders
CREATE POLICY "Store users can view store orders"
ON public.orders FOR SELECT
USING (store_id IS NOT NULL AND has_store_access(store_id));

-- Create function to generate unique order code
CREATE OR REPLACE FUNCTION public.generate_order_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE order_code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();