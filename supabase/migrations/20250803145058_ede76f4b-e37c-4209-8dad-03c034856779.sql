-- Configurar políticas RLS para autenticação de admin

-- Política para permitir que qualquer pessoa veja se um usuário tem role de admin
-- (necessário para o login funcionar)
DROP POLICY IF EXISTS "Anyone can check admin role" ON public.user_roles;
CREATE POLICY "Anyone can check admin role" 
ON public.user_roles 
FOR SELECT 
TO public
USING (role = 'admin'::app_role);

-- Atualizar a função has_role para funcionar corretamente
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() AND role = _role
  );
$$;

-- Função auxiliar para verificar se um usuário específico tem uma role
CREATE OR REPLACE FUNCTION public.user_has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;