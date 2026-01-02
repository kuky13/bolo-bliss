-- Corrigir as políticas RLS para permitir operações anônimas nos cupons públicos

-- Primeiro, vamos verificar e remover todas as políticas existentes
DROP POLICY IF EXISTS "Anyone can view public coupons" ON public.coupons;
DROP POLICY IF EXISTS "Anyone can insert public coupons" ON public.coupons;
DROP POLICY IF EXISTS "Anyone can update public coupons" ON public.coupons;
DROP POLICY IF EXISTS "Anyone can delete public coupons" ON public.coupons;
DROP POLICY IF EXISTS "Store users can manage store coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can manage all coupons" ON public.coupons;

-- Criar políticas que permitam acesso público completo aos cupons com store_id NULL
-- SELECT - qualquer um pode ver cupons públicos ou de lojas ativas
CREATE POLICY "Public can view coupons" 
ON public.coupons 
FOR SELECT 
TO public
USING (store_id IS NULL OR EXISTS (
  SELECT 1 FROM stores 
  WHERE stores.id = coupons.store_id AND stores.active = true
));

-- INSERT - qualquer um pode criar cupons públicos (store_id NULL)
CREATE POLICY "Public can insert public coupons" 
ON public.coupons 
FOR INSERT 
TO public
WITH CHECK (store_id IS NULL);

-- UPDATE - qualquer um pode atualizar cupons públicos
CREATE POLICY "Public can update public coupons" 
ON public.coupons 
FOR UPDATE 
TO public
USING (store_id IS NULL)
WITH CHECK (store_id IS NULL);

-- DELETE - qualquer um pode deletar cupons públicos
CREATE POLICY "Public can delete public coupons" 
ON public.coupons 
FOR DELETE 
TO public
USING (store_id IS NULL);

-- Políticas para usuários autenticados com lojas (se necessário no futuro)
CREATE POLICY "Store users can manage their store coupons" 
ON public.coupons 
FOR ALL 
TO authenticated
USING (store_id IS NOT NULL AND has_store_access(store_id))
WITH CHECK (store_id IS NOT NULL AND has_store_access(store_id));