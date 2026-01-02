-- Fase 1: Otimizações do Banco de Dados
-- Criar índices estratégicos para melhorar performance

-- 1. Índice composto para busca por nome e categoria
CREATE INDEX IF NOT EXISTS idx_products_name_category ON products(name, category);

-- 2. Índice para produtos em destaque (usado na homepage)
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;

-- 3. Índice para ordenação por data de criação
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- 4. Índice para busca por categoria
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 5. Índice para produtos ativos/disponíveis (stock > 0)
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock) WHERE stock > 0;

-- 6. Implementar busca full-text search
-- Adicionar coluna tsvector para busca textual eficiente
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Criar índice GIN para busca full-text
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING GIN(search_vector);

-- Função para atualizar o search_vector automaticamente
CREATE OR REPLACE FUNCTION update_products_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.category, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar search_vector em INSERT/UPDATE
DROP TRIGGER IF EXISTS products_search_vector_update ON products;
CREATE TRIGGER products_search_vector_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_products_search_vector();

-- Atualizar search_vector para produtos existentes
UPDATE products SET search_vector = 
  setweight(to_tsvector('portuguese', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('portuguese', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('portuguese', COALESCE(category, '')), 'C');

-- Função para busca otimizada de produtos
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
  FROM products p
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
$$ LANGUAGE plpgsql STABLE;