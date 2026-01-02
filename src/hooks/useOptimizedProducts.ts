import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { useDebounce } from './useDebounce';

interface UseOptimizedProductsProps {
  searchTerm?: string;
  selectedCategory?: string;
  featuredOnly?: boolean;
  limit?: number;
  offset?: number;
}

export const useOptimizedProducts = ({
  searchTerm = '',
  selectedCategory = '',
  featuredOnly = false,
  limit = 50,
  offset = 0
}: UseOptimizedProductsProps = {}) => {
  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm.trim(), 300);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['optimized-products', debouncedSearchTerm, selectedCategory, featuredOnly, limit, offset],
    queryFn: async () => {
      try {
        // Try to use the optimized search function from database
        const { data, error } = await supabase.rpc('search_products', {
          search_term: debouncedSearchTerm || null,
          category_filter: selectedCategory || null,
          featured_only: featuredOnly,
          limit_count: limit,
          offset_count: offset
        });

        if (error) {
          console.error('RPC Error:', error);
          throw error;
        }

        // Transform database results to Product interface
        return data.map((item: any): Product => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          imageUrl: item.image_url || '',
          featured: item.featured || false,
          category: item.category || '',
          stock: item.stock || 0,
          maxPurchaseQuantity: item.max_purchase_quantity || 5
        }));
      } catch (error) {
        console.error('Optimized search failed, falling back to regular query:', error);
        
        // Fallback to regular query if RPC fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (fallbackError) throw fallbackError;

        // Transform and filter on client side as fallback
        const products = fallbackData.map((item: any): Product => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          imageUrl: item.image_url || '',
          featured: item.featured || false,
          category: item.category || '',
          stock: item.stock || 0,
          maxPurchaseQuantity: item.max_purchase_quantity || 5
        }));

        // Apply client-side filtering as fallback
        return products.filter(product => {
          const matchesSearch = !debouncedSearchTerm || 
            product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
          
          const matchesCategory = !selectedCategory || product.category === selectedCategory;
          const matchesFeatured = !featuredOnly || product.featured;
          
          return matchesSearch && matchesCategory && matchesFeatured;
        });
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: true
  });

  // Memoize categories for performance
  const categories = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map(product => product.category).filter(Boolean)));
  }, [data]);

  // Memoize featured products
  const featuredProducts = useMemo(() => {
    if (!data) return [];
    return data.filter(product => product.featured);
  }, [data]);

  return {
    products: data || [],
    featuredProducts,
    categories,
    isLoading,
    error,
    refetch
  };
};