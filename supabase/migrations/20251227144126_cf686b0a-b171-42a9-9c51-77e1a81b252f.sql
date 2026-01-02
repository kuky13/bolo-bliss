-- Adicionar colunas na tabela affiliates para ValeDoce
ALTER TABLE public.affiliates 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS valedoce_balance INTEGER DEFAULT 0;

-- Adicionar coluna de recompensa ValeDoce na tabela products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS valedoce_reward INTEGER DEFAULT 5;

-- Criar tabela de transações ValeDoce
CREATE TABLE IF NOT EXISTS public.valedoce_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'spent', 'expired', 'bonus')),
  description TEXT,
  order_id UUID,
  product_id UUID REFERENCES public.products(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela de configurações ValeDoce
CREATE TABLE IF NOT EXISTS public.valedoce_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id),
  default_reward INTEGER DEFAULT 5,
  valedoce_value NUMERIC DEFAULT 1.00,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id)
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.valedoce_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valedoce_settings ENABLE ROW LEVEL SECURITY;

-- Policies para valedoce_transactions
CREATE POLICY "Afiliados podem ver suas próprias transações"
ON public.valedoce_transactions
FOR SELECT
USING (
  affiliate_id IN (
    SELECT id FROM public.affiliates WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Sistema pode inserir transações"
ON public.valedoce_transactions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins podem ver todas transações"
ON public.valedoce_transactions
FOR SELECT
USING (has_role('admin'::app_role));

-- Policies para valedoce_settings
CREATE POLICY "Qualquer um pode ver configurações ValeDoce"
ON public.valedoce_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins podem gerenciar configurações ValeDoce"
ON public.valedoce_settings
FOR ALL
USING (has_role('admin'::app_role));

-- Atualizar policy de affiliates para permitir auto-cadastro
CREATE POLICY "Usuários podem criar seu próprio cadastro de afiliado"
ON public.affiliates
FOR INSERT
WITH CHECK (
  (user_id = auth.uid() AND store_id IS NULL) OR 
  store_id IS NULL
);

CREATE POLICY "Afiliados podem atualizar seu próprio cadastro"
ON public.affiliates
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Afiliados podem ver seu próprio cadastro"
ON public.affiliates
FOR SELECT
USING (user_id = auth.uid() OR active = true OR store_id IS NULL);

-- Inserir configuração padrão do ValeDoce
INSERT INTO public.valedoce_settings (default_reward, valedoce_value, email_notifications)
VALUES (5, 1.00, true)
ON CONFLICT DO NOTHING;

-- Trigger para atualizar updated_at em valedoce_settings
CREATE TRIGGER update_valedoce_settings_updated_at
BEFORE UPDATE ON public.valedoce_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();