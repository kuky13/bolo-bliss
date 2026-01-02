-- Corrigir warnings de segurança
-- Adicionar SET search_path às funções para segurança

CREATE OR REPLACE FUNCTION update_products_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.category, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';

CREATE OR REPLACE FUNCTION search_products(
  search_term text DEFAULT NULL,
  category_filter text DEFAULT NULL,
  featured_only boolean DEFAULT false,
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  price numeric,
  image_url text,
  featured boolean,
  category text,
  stock integer,
  max_purchase_quantity integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  search_rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.image_url,
    p.featured,
    p.category,
    p.stock,
    p.max_purchase_quantity,
    p.created_at,
    p.updated_at,
    CASE 
      WHEN search_term IS NOT NULL THEN ts_rank(p.search_vector, plainto_tsquery('portuguese', search_term))
      ELSE 0
    END as search_rank
  FROM public.products p
  WHERE 
    (search_term IS NULL OR p.search_vector @@ plainto_tsquery('portuguese', search_term))
    AND (category_filter IS NULL OR p.category = category_filter)
    AND (NOT featured_only OR p.featured = true)
    AND p.stock >= 0
  ORDER BY 
    CASE WHEN search_term IS NOT NULL THEN ts_rank(p.search_vector, plainto_tsquery('portuguese', search_term)) END DESC,
    p.featured DESC,
    p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER
SET search_path = '';