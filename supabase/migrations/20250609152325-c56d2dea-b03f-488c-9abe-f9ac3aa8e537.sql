
-- Adicionar as colunas faltantes na tabela store_settings
ALTER TABLE public.store_settings 
ADD COLUMN always_open boolean DEFAULT false,
ADD COLUMN store_closed_message text;

-- Criar a tabela store_hours
CREATE TABLE public.store_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TEXT NOT NULL,
  close_time TEXT NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índice para melhorar performance nas consultas
CREATE INDEX idx_store_hours_day_of_week ON public.store_hours(day_of_week);

-- Adicionar constraint para garantir apenas um registro por dia da semana
ALTER TABLE public.store_hours ADD CONSTRAINT unique_day_of_week UNIQUE (day_of_week);

-- Habilitar RLS na tabela store_hours
ALTER TABLE public.store_hours ENABLE ROW LEVEL SECURITY;

-- Criar política RLS para permitir leitura pública dos horários
CREATE POLICY "Anyone can view store hours" ON public.store_hours
  FOR SELECT USING (true);

-- Criar política RLS para permitir que apenas admins modifiquem os horários
CREATE POLICY "Only admins can modify store hours" ON public.store_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
