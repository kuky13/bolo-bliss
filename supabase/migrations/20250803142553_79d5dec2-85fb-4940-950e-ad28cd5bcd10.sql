-- Criar sistema de afiliados

-- Tabela de afiliados
CREATE TABLE public.affiliates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  email text,
  commission_rate numeric DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  points integer NOT NULL DEFAULT 0,
  total_sales numeric NOT NULL DEFAULT 0,
  sales_count integer NOT NULL DEFAULT 0,
  store_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela de vendas por afiliado
CREATE TABLE public.affiliate_sales (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  order_value numeric NOT NULL,
  commission_value numeric DEFAULT 0,
  customer_info jsonb,
  products_sold jsonb,
  store_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_sales ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para affiliates
CREATE POLICY "Public can view active affiliates"
ON public.affiliates
FOR SELECT
TO public
USING (active = true);

CREATE POLICY "Admins can manage affiliates"
ON public.affiliates
FOR ALL
TO authenticated
USING (has_role('admin'::app_role))
WITH CHECK (has_role('admin'::app_role));

CREATE POLICY "Store users can manage their affiliates"
ON public.affiliates
FOR ALL
TO authenticated
USING (store_id IS NOT NULL AND has_store_access(store_id))
WITH CHECK (store_id IS NOT NULL AND has_store_access(store_id));

-- Políticas RLS para affiliate_sales
CREATE POLICY "Public can insert affiliate sales"
ON public.affiliate_sales
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can view all sales"
ON public.affiliate_sales
FOR SELECT
TO authenticated
USING (has_role('admin'::app_role));

CREATE POLICY "Store users can view their sales"
ON public.affiliate_sales
FOR SELECT
TO authenticated
USING (store_id IS NOT NULL AND has_store_access(store_id));

-- Triggers para updated_at
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para atualizar estatísticas do afiliado
CREATE OR REPLACE FUNCTION public.update_affiliate_stats()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger para atualizar stats automaticamente
CREATE TRIGGER update_affiliate_stats_trigger
  AFTER INSERT ON public.affiliate_sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_affiliate_stats();

-- Índices para performance
CREATE INDEX idx_affiliates_code ON public.affiliates(code);
CREATE INDEX idx_affiliates_store_id ON public.affiliates(store_id);
CREATE INDEX idx_affiliate_sales_affiliate_id ON public.affiliate_sales(affiliate_id);
CREATE INDEX idx_affiliate_sales_created_at ON public.affiliate_sales(created_at);