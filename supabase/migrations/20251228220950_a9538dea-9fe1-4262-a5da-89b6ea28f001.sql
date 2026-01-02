-- Add customizable fallback banner settings
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS free_delivery_fallback_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS free_delivery_fallback_bg_color text,
ADD COLUMN IF NOT EXISTS free_delivery_fallback_text_color text;