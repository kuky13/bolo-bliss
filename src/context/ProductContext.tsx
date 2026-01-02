
import React, { createContext, useContext } from "react";
import { Product } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ProductContextType {
  products: Product[];
  featuredProducts: Product[];
  getProductById: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Transform Supabase data to match our Product interface
  return data.map((item: any) => ({
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
};

// Função utilitária para extrair o caminho do arquivo da URL do Storage
const extractFilePathFromUrl = (url: string): string | null => {
  if (!url) return null;

  try {
    // Verifica se é uma URL do Supabase Storage
    if (url.includes('supabase.co') && url.includes('/storage/v1/object/public/imagens/')) {
      // Extrai o caminho do arquivo do URL
      const filePath = url.split('/public/imagens/')[1];
      if (filePath) {
        return filePath;
      }
    }
  } catch (e) {
    console.error("Erro ao extrair caminho do arquivo:", e);
  }

  return null;
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use React Query para gerenciar dados
  const queryClient = useQueryClient();
  
  const { data: products = [], isLoading, error, isError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 5, // 5 minutos  
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Log de erro para debugging
  React.useEffect(() => {
    if (isError && error) {
      console.error('Erro ao carregar produtos:', error);
    }
  }, [isError, error]);

  // Mutação para adicionar produto
  const addProductMutation = useMutation({
    mutationFn: async (product: Omit<Product, "id">) => {
      // Transform the product to match Supabase schema
      const dbProduct = {
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.imageUrl,
        featured: product.featured || false,
        category: product.category || '',
        stock: product.stock || 0,
        max_purchase_quantity: product.maxPurchaseQuantity || 5
      };

      const { data, error } = await supabase
        .from('products')
        .insert(dbProduct)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Produto adicionado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar produto: ${error.message}`);
    }
  });

  // Mutação para atualizar produto
  const updateProductMutation = useMutation({
    mutationFn: async (product: Product) => {
      const { id, ...rest } = product;
      // Transform the product to match Supabase schema
      const dbProduct = {
        name: rest.name,
        description: rest.description,
        price: rest.price,
        image_url: rest.imageUrl,
        featured: rest.featured || false,
        category: rest.category || '',
        stock: rest.stock || 0,
        max_purchase_quantity: rest.maxPurchaseQuantity || 5,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('products')
        .update(dbProduct)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Produto atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar produto: ${error.message}`);
    }
  });

  // Mutação para deletar produto
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        // Primeiro, tentamos obter o produto para verificar se há uma imagem associada
        const { data: product } = await supabase
          .from('products')
          .select('image_url')
          .eq('id', id)
          .single();

        // Se houver uma imagem associada ao produto, tentamos excluí-la do storage
        if (product?.image_url) {
          const filePath = extractFilePathFromUrl(product.image_url);

          if (filePath) {
            try {
              // Tenta excluir o arquivo do storage
              const { error: storageError } = await supabase.storage
                .from('imagens')
                .remove([filePath]);

              if (storageError) {
                console.error("Erro ao excluir imagem:", storageError);
                // Continuamos mesmo com erro na exclusão da imagem
              } else {
                console.log("Imagem excluída com sucesso:", filePath);
              }
            } catch (storageError) {
              console.error("Erro ao excluir imagem:", storageError);
            }
          }
        }

        // Em seguida, excluímos o produto
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw new Error(error.message);
      } catch (error: any) {
        throw new Error(`Erro ao excluir produto: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Produto removido com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover produto: ${error.message}`);
    }
  });

  // Adicionar um novo produto
  const addProduct = async (product: Omit<Product, "id">) => {
    await addProductMutation.mutateAsync(product);
  };

  // Atualizar um produto existente
  const updateProduct = async (product: Product) => {
    await updateProductMutation.mutateAsync(product);
  };

  // Deletar um produto
  const deleteProduct = async (id: string) => {
    await deleteProductMutation.mutateAsync(id);
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  const featuredProducts = products.filter(p => p.featured);

  return (
    <ProductContext.Provider
      value={{
        products,
        getProductById,
        featuredProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        isLoading,
        error: error as Error | null
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
