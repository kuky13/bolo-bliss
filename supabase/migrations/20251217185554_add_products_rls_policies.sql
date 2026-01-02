-- Adicionar políticas RLS para a tabela products
-- Permitir que admins gerenciem produtos e que qualquer um possa visualizar

-- Garantir que RLS está habilitado
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver (para evitar conflitos)
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Store users can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- Política para SELECT: qualquer um pode visualizar produtos
CREATE POLICY "Public can view products"
ON public.products
FOR SELECT
TO public
USING (true);

-- Política para INSERT: apenas admins podem criar produtos
-- Usando a função has_role() que é SECURITY DEFINER e pode acessar user_roles
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (has_role('admin'::app_role));

-- Política para UPDATE: apenas admins podem atualizar produtos
CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (has_role('admin'::app_role))
WITH CHECK (has_role('admin'::app_role));

-- Política para DELETE: apenas admins podem deletar produtos
CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (has_role('admin'::app_role));

