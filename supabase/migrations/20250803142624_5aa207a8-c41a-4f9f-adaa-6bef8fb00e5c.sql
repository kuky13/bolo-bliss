-- Corrigir função update_affiliate_stats com search_path seguro
CREATE OR REPLACE FUNCTION public.update_affiliate_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.affiliates
  SET 
    points = points + 1,
    total_sales = total_sales + NEW.order_value,
    sales_count = sales_count + 1,
    updated_at = now()
  WHERE id = NEW.affiliate_id;
  
  RETURN NEW;
END;
$$;