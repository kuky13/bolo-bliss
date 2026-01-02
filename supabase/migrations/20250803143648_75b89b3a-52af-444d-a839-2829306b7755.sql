-- Corrigir políticas RLS para afiliados para permitir inserção por admins

-- Remover políticas existentes e recriar com configuração correta
DROP POLICY IF EXISTS "Public can view active affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "Admins can manage affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "Store users can manage their affiliates" ON public.affiliates;

-- Políticas corretas para affiliates
-- Qualquer um pode ver afiliados ativos (para tracking)
CREATE POLICY "Anyone can view active affiliates"
ON public.affiliates
FOR SELECT
TO public
USING (active = true);

-- Admins podem inserir afiliados (sem store_id, público)
CREATE POLICY "Anyone can insert public affiliates"
ON public.affiliates
FOR INSERT
TO public
WITH CHECK (store_id IS NULL);

-- Admins podem atualizar afiliados públicos
CREATE POLICY "Anyone can update public affiliates"
ON public.affiliates
FOR UPDATE
TO public
USING (store_id IS NULL)
WITH CHECK (store_id IS NULL);

-- Admins podem deletar afiliados públicos
CREATE POLICY "Anyone can delete public affiliates"
ON public.affiliates
FOR DELETE
TO public
USING (store_id IS NULL);

-- Usuários autenticados podem gerenciar afiliados de suas lojas (se aplicável)
CREATE POLICY "Store users can manage their store affiliates"
ON public.affiliates
FOR ALL
TO authenticated
USING (store_id IS NOT NULL AND has_store_access(store_id))
WITH CHECK (store_id IS NOT NULL AND has_store_access(store_id));