import React, { createContext, useContext, useState, useEffect } from "react";
import { Coupon } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CouponContextType {
  coupons: Coupon[];
  validateCoupon: (code: string, orderTotal: number) => { valid: boolean; message?: string; coupon?: Coupon };
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  calculateDiscount: (subtotal: number, deliveryFee: number) => number;
  isLoaded: boolean;
  isLoading: boolean;
  updateCoupon: (coupon: Coupon) => Promise<void>;
  addCoupon: (coupon: Omit<Coupon, "active" | "usageCount">) => Promise<void>;
  deleteCoupon: (code: string) => Promise<void>;
  error: Error | null;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

// Função para buscar cupons do Supabase
const fetchCoupons = async (): Promise<Coupon[]> => {
  console.log("Buscando cupons do Supabase...");
  
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('code');
  
  if (error) {
    console.error("Erro ao buscar cupons:", error);
    throw new Error(error.message);
  }
  
  console.log("Cupons buscados:", data);
  
  // Converter do formato do banco para o formato da aplicação
  return (data || []).map((item: any) => ({
    code: item.code,
    discountType: item.discount_type as "percentage" | "fixed",
    discountValue: Number(item.discount_value),
    minOrderValue: Number(item.min_order_value) || 0,
    active: Boolean(item.active),
    description: item.description || '',
    expiryDate: item.expiry_date || '',
    usageLimit: Number(item.usage_limit) || 0,
    usageCount: Number(item.usage_count) || 0
  }));
};

export const CouponProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Usar React Query para buscar os cupons
  const { 
    data: coupons = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['coupons'],
    queryFn: fetchCoupons,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
  
  // Update isLoaded state when query completes
  React.useEffect(() => {
    if (!isLoading) {
      setIsLoaded(true);
    }
  }, [isLoading]);

  // Carregar o cupom aplicado do localStorage
  useEffect(() => {
    try {
      const savedAppliedCoupon = localStorage.getItem("appliedCoupon");
      if (savedAppliedCoupon) {
        setAppliedCoupon(JSON.parse(savedAppliedCoupon));
      }
    } catch (error) {
      console.error("Failed to load applied coupon:", error);
    }
  }, []);

  // Salvar o cupom aplicado no localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        if (appliedCoupon) {
          localStorage.setItem("appliedCoupon", JSON.stringify(appliedCoupon));
        } else {
          localStorage.removeItem("appliedCoupon");
        }
      } catch (error) {
        console.error("Failed to save applied coupon:", error);
      }
    }
  }, [appliedCoupon, isLoaded]);

  // Mutação para adicionar cupom
  const addCouponMutation = useMutation({
    mutationFn: async (couponData: Omit<Coupon, "active" | "usageCount">) => {
      console.log("Adicionando cupom:", couponData);
      
      // Validar se já existe um cupom com o mesmo código
      const existingCoupon = coupons.find(c => c.code.toUpperCase() === couponData.code.toUpperCase());
      if (existingCoupon) {
        throw new Error("Já existe um cupom com este código");
      }
      
      // Converter para o formato do banco
      const dbCoupon = {
        code: couponData.code.trim().toUpperCase(),
        discount_type: couponData.discountType,
        discount_value: Number(couponData.discountValue),
        min_order_value: Number(couponData.minOrderValue) || 0,
        active: true,
        description: couponData.description || '',
        expiry_date: couponData.expiryDate || null,
        usage_limit: Number(couponData.usageLimit) || null,
        usage_count: 0,
        store_id: null // Para compatibilidade com sistema sem multi-loja
      };

      console.log("Dados para inserção no banco:", dbCoupon);

      const { data, error } = await supabase
        .from('coupons')
        .insert(dbCoupon)
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao inserir cupom:", error);
        throw new Error(`Erro no banco de dados: ${error.message}`);
      }
      
      console.log("Cupom inserido com sucesso:", data);
      return data;
    },
    onSuccess: () => {
      console.log("Invalidando cache de cupons...");
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success("Cupom criado com sucesso!");
    },
    onError: (error: Error) => {
      console.error("Erro na mutação de adicionar cupom:", error);
      toast.error(`Erro ao adicionar cupom: ${error.message}`);
    }
  });

  // Mutação para atualizar cupom
  const updateCouponMutation = useMutation({
    mutationFn: async (coupon: Coupon) => {
      console.log("Atualizando cupom:", coupon);
      
      // Converter para o formato do banco
      const dbCoupon = {
        code: coupon.code.trim().toUpperCase(),
        discount_type: coupon.discountType,
        discount_value: Number(coupon.discountValue),
        min_order_value: Number(coupon.minOrderValue) || 0,
        active: Boolean(coupon.active),
        description: coupon.description || '',
        expiry_date: coupon.expiryDate || null,
        usage_limit: Number(coupon.usageLimit) || null,
        usage_count: Number(coupon.usageCount) || 0,
        store_id: null // Para compatibilidade com sistema sem multi-loja
      };

      const { data, error } = await supabase
        .from('coupons')
        .update(dbCoupon)
        .eq('code', coupon.code)
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao atualizar cupom:", error);
        throw new Error(`Erro no banco de dados: ${error.message}`);
      }
      
      console.log("Cupom atualizado com sucesso:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success("Cupom atualizado com sucesso!");
    },
    onError: (error: Error) => {
      console.error("Erro na mutação de atualizar cupom:", error);
      toast.error(`Erro ao atualizar cupom: ${error.message}`);
    }
  });

  // Mutação para deletar cupom
  const deleteCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      console.log("Deletando cupom:", code);
      
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('code', code);
      
      if (error) {
        console.error("Erro ao deletar cupom:", error);
        throw new Error(`Erro no banco de dados: ${error.message}`);
      }
      
      console.log("Cupom deletado com sucesso");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success("Cupom removido com sucesso!");
    },
    onError: (error: Error) => {
      console.error("Erro na mutação de deletar cupom:", error);
      toast.error(`Erro ao remover cupom: ${error.message}`);
    }
  });

  // Adicionar um novo cupom
  const addCoupon = async (couponData: Omit<Coupon, "active" | "usageCount">) => {
    try {
      console.log("Iniciando criação de cupom:", couponData);
      await addCouponMutation.mutateAsync(couponData);
    } catch (error) {
      console.error("Erro ao adicionar cupom no contexto:", error);
      throw error;
    }
  };

  // Atualizar um cupom existente
  const updateCoupon = async (coupon: Coupon) => {
    try {
      await updateCouponMutation.mutateAsync(coupon);
    } catch (error) {
      console.error("Erro ao atualizar cupom:", error);
      throw error;
    }
  };

  // Deletar um cupom
  const deleteCoupon = async (code: string) => {
    // Se este é o cupom aplicado, removê-lo
    if (appliedCoupon && appliedCoupon.code === code) {
      setAppliedCoupon(null);
    }
    
    try {
      await deleteCouponMutation.mutateAsync(code);
    } catch (error) {
      console.error("Erro ao deletar cupom:", error);
      throw error;
    }
  };

  // Validar cupom (verifica se é válido para a compra)
  const validateCoupon = (code: string, orderTotal: number) => {
    const normalizedCode = code.toUpperCase();
    const coupon = coupons.find(c => c.code.toUpperCase() === normalizedCode);
    
    if (!coupon) {
      return { valid: false, message: "Cupom inválido" };
    }
    
    if (!coupon.active) {
      return { valid: false, message: "Este cupom não está mais ativo" };
    }
    
    if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
      return { 
        valid: false, 
        message: `Este cupom é válido apenas para compras acima de R$${coupon.minOrderValue.toFixed(2)}` 
      };
    }
    
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return { valid: false, message: "Este cupom está expirado" };
    }
    
    if (coupon.usageLimit && coupon.usageCount && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: "Este cupom atingiu o limite de uso" };
    }
    
    return { valid: true, coupon };
  };

  // Aplicar cupom
  const applyCoupon = (code: string) => {
    // Remover cupom existente
    if (appliedCoupon) {
      setAppliedCoupon(null);
    }
    
    const normalizedCode = code.toUpperCase();
    const coupon = coupons.find(c => c.code.toUpperCase() === normalizedCode);
    
    if (!coupon) {
      return { success: false, message: "Cupom inválido" };
    }
    
    if (!coupon.active) {
      return { success: false, message: "Este cupom não está mais ativo" };
    }
    
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return { success: false, message: "Este cupom está expirado" };
    }
    
    if (coupon.usageLimit && coupon.usageCount && coupon.usageCount >= coupon.usageLimit) {
      return { success: false, message: "Este cupom atingiu o limite de uso" };
    }
    
    // Aplicar o cupom
    setAppliedCoupon(coupon);
    
    return { 
      success: true, 
      message: `Cupom "${coupon.code}" aplicado com sucesso: ${coupon.description}` 
    };
  };
  
  // Remover cupom aplicado
  const removeCoupon = () => {
    setAppliedCoupon(null);
  };
  
  // Calcular o desconto baseado no cupom aplicado
  const calculateDiscount = (subtotal: number, deliveryFee: number) => {
    if (!appliedCoupon) return 0;
    
    // Verificar se atinge o valor mínimo
    if (appliedCoupon.minOrderValue && subtotal < appliedCoupon.minOrderValue) return 0;
    
    let discountAmount = 0;
    
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = subtotal * (appliedCoupon.discountValue / 100);
    } else if (appliedCoupon.discountType === "fixed") {
      // Desconto de valor fixo
      discountAmount = appliedCoupon.discountValue;
      
      // Para descontos de frete (como "FRETEGRATIS")
      if (appliedCoupon.discountValue === deliveryFee) {
        discountAmount = deliveryFee;
      }
    }
    
    // Não permitir que o desconto exceda o total
    const total = subtotal + deliveryFee;
    return Math.min(discountAmount, total);
  };

  return (
    <CouponContext.Provider value={{ 
      coupons, 
      validateCoupon,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      calculateDiscount,
      isLoaded,
      isLoading,
      updateCoupon,
      addCoupon,
      deleteCoupon,
      error: error as Error | null
    }}>
      {children}
    </CouponContext.Provider>
  );
};

export const useCoupon = () => {
  const context = useContext(CouponContext);
  if (context === undefined) {
    throw new Error("useCoupon must be used within a CouponProvider");
  }
  return context;
};
