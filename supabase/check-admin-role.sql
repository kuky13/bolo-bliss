-- Script de diagnóstico: Verificar se o usuário atual tem role de admin
-- Execute este script no SQL Editor do Supabase para verificar o status

-- 1. Verificar o usuário atual autenticado
SELECT 
  auth.uid() as current_user_id,
  auth.email() as current_user_email;

-- 2. Verificar se o usuário tem role de admin na tabela user_roles
SELECT 
  ur.user_id,
  ur.role,
  CASE 
    WHEN ur.user_id = auth.uid() THEN 'Este é o seu usuário'
    ELSE 'Outro usuário'
  END as status
FROM public.user_roles ur
WHERE ur.role = 'admin'::app_role;

-- 3. Verificar se a função has_role funciona para o usuário atual
SELECT 
  has_role('admin'::app_role) as is_admin,
  auth.uid() as user_id;

-- 4. Listar todos os usuários com role de admin
SELECT 
  ur.user_id,
  ur.role,
  au.email
FROM public.user_roles ur
LEFT JOIN auth.users au ON au.id = ur.user_id
WHERE ur.role = 'admin'::app_role;

-- 5. Se você não aparecer na lista acima, execute este comando para adicionar sua role de admin
-- SUBSTITUA 'SEU_USER_ID_AQUI' pelo ID do seu usuário (obtido na query 1)
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('SEU_USER_ID_AQUI'::uuid, 'admin'::app_role)
-- ON CONFLICT (user_id, role) DO NOTHING;

