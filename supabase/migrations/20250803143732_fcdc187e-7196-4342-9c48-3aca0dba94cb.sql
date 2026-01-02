-- Corrigir as políticas RLS para afiliados permitindo acesso público completo

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Anyone can view active affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "Anyone can insert public affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "Anyone can update public affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "Anyone can delete public affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "Store users can manage their store affiliates" ON public.affiliates;

-- Criar políticas que permitam acesso público completo aos afiliados com store_id NULL
-- SELECT - qualquer um pode ver afiliados públicos ou ativos
CREATE POLICY "Public can view affiliates" 
ON public.affiliates 
FOR SELECT 
TO public
USING (store_id IS NULL OR active = true);

-- INSERT - qualquer um pode criar afiliados públicos (store_id NULL)
CREATE POLICY "Public can insert public affiliates" 
ON public.affiliates 
FOR INSERT 
TO public
WITH CHECK (store_id IS NULL);

-- UPDATE - qualquer um pode atualizar afiliados públicos
CREATE POLICY "Public can update public affiliates" 
ON public.affiliates 
FOR UPDATE 
TO public
USING (store_id IS NULL)
WITH CHECK (store_id IS NULL);

-- DELETE - qualquer um pode deletar afiliados públicos
CREATE POLICY "Public can delete public affiliates" 
ON public.affiliates 
FOR DELETE 
TO public
USING (store_id IS NULL);

-- Políticas para usuários autenticados com lojas (se necessário no futuro)
CREATE POLICY "Store users can manage their store affiliates" 
ON public.affiliates 
FOR ALL 
TO authenticated
USING (store_id IS NOT NULL AND has_store_access(store_id))
WITH CHECK (store_id IS NOT NULL AND has_store_access(store_id));