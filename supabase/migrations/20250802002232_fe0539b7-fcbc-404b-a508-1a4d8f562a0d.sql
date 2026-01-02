-- Ajustar políticas RLS para permitir acesso público aos cupons
-- Para sistemas sem autenticação obrigatória

-- Remover políticas restritivas existentes
DROP POLICY IF EXISTS "Anyone can view coupons" ON public.coupons;
DROP POLICY IF EXISTS "Only admins can insert coupons" ON public.coupons;
DROP POLICY IF EXISTS "Only admins can update coupons" ON public.coupons;
DROP POLICY IF EXISTS "Only admins can delete coupons" ON public.coupons;
DROP POLICY IF EXISTS "Store users can manage coupons" ON public.coupons;

-- Criar políticas mais permissivas para cupons públicos (store_id null)
CREATE POLICY "Anyone can view public coupons" 
ON public.coupons 
FOR SELECT 
USING (store_id IS NULL OR EXISTS (
  SELECT 1 FROM stores 
  WHERE stores.id = coupons.store_id AND stores.active = true
));

CREATE POLICY "Anyone can insert public coupons" 
ON public.coupons 
FOR INSERT 
WITH CHECK (store_id IS NULL);

CREATE POLICY "Anyone can update public coupons" 
ON public.coupons 
FOR UPDATE 
USING (store_id IS NULL);

CREATE POLICY "Anyone can delete public coupons" 
ON public.coupons 
FOR DELETE 
USING (store_id IS NULL);

-- Manter políticas para usuários autenticados com lojas
CREATE POLICY "Store users can manage store coupons" 
ON public.coupons 
FOR ALL 
USING (store_id IS NOT NULL AND has_store_access(store_id));

-- Criar política para admins
CREATE POLICY "Admins can manage all coupons" 
ON public.coupons 
FOR ALL 
USING (has_role('admin'::app_role));