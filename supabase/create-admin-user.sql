
-- Execute este script no painel SQL do Supabase após criar seu primeiro usuário
-- Substitua 'SEU_USER_ID' pelo ID do usuário que você deseja tornar admin
-- Para obter o ID, vá para Authentication > Users no painel do Supabase

INSERT INTO public.user_roles (user_id, role)
VALUES ('SEU_USER_ID', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Você pode verificar se o usuário tem o papel de admin com:
-- SELECT * FROM public.user_roles WHERE user_id = 'SEU_USER_ID';
