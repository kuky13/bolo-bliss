-- Add free_delivery_banners and banner_rotation_interval to store_settings
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS free_delivery_banners JSONB,
ADD COLUMN IF NOT EXISTS banner_rotation_interval INTEGER;

-- Optionally set a default interval for existing rows
UPDATE public.store_settings
SET banner_rotation_interval = 5
WHERE banner_rotation_interval IS NULL;