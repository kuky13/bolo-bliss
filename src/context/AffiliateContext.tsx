import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Affiliate } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AffiliateContextType {
  activeAffiliate: Affiliate | null;
  setActiveAffiliate: (affiliate: Affiliate | null) => void;
  trackAffiliateCode: (code: string) => Promise<boolean>;
  clearActiveAffiliate: () => void;
  isTracking: boolean;
}

const AffiliateContext = createContext<AffiliateContextType | undefined>(undefined);

export const useAffiliate = () => {
  const context = useContext(AffiliateContext);
  if (!context) {
    throw new Error("useAffiliate must be used within an AffiliateProvider");
  }
  return context;
};

interface AffiliateProviderProps {
  children: ReactNode;
}

export const AffiliateProvider: React.FC<AffiliateProviderProps> = ({ children }) => {
  const [activeAffiliate, setActiveAffiliate] = useState<Affiliate | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Carregar afiliado do localStorage ao inicializar
  useEffect(() => {
    const savedAffiliateCode = localStorage.getItem("affiliate_code");
    if (savedAffiliateCode && !activeAffiliate) {
      trackAffiliateCode(savedAffiliateCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Salvar código do afiliado no localStorage
  useEffect(() => {
    if (activeAffiliate) {
      localStorage.setItem("affiliate_code", activeAffiliate.code);
      // Definir expiração de 30 dias
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);
      localStorage.setItem("affiliate_expiry", expirationDate.toISOString());
    } else {
      localStorage.removeItem("affiliate_code");
      localStorage.removeItem("affiliate_expiry");
    }
  }, [activeAffiliate]);

  // Verificar expiração do afiliado
  useEffect(() => {
    const checkExpiration = () => {
      const expiryDate = localStorage.getItem("affiliate_expiry");
      if (expiryDate && new Date() > new Date(expiryDate)) {
        clearActiveAffiliate();
      }
    };

    checkExpiration();
    const interval = setInterval(checkExpiration, 60000); // Verificar a cada minuto
    return () => clearInterval(interval);
  }, []);

  const trackAffiliateCode = async (code: string): Promise<boolean> => {
    if (!code.trim()) return false;
    
    const normalizedCode = code.toLowerCase().trim();
    
    // Se já existe um afiliado ativo com o mesmo código, não fazer nada
    if (activeAffiliate && activeAffiliate.code === normalizedCode) {
      return true;
    }
    
    setIsTracking(true);
    try {
      const { data: affiliate, error } = await supabase
        .from("affiliates")
        .select("*")
        .eq("code", normalizedCode)
        .eq("active", true)
        .maybeSingle();

      if (error || !affiliate) {
        toast.error("Código de afiliado não encontrado ou inativo");
        return false;
      }

      // Verificar se o toast já foi exibido para este código
      const lastNotifiedCode = localStorage.getItem("affiliate_notified_code");
      const isNewAffiliate = !activeAffiliate || activeAffiliate.code !== normalizedCode;
      const shouldShowToast = isNewAffiliate && lastNotifiedCode !== normalizedCode;

      setActiveAffiliate({
        id: affiliate.id,
        code: affiliate.code,
        name: affiliate.name,
        email: affiliate.email,
        commissionRate: affiliate.commission_rate || 0,
        active: affiliate.active,
        points: affiliate.points,
        totalSales: affiliate.total_sales,
        salesCount: affiliate.sales_count,
        storeId: affiliate.store_id,
        createdAt: affiliate.created_at,
        updatedAt: affiliate.updated_at,
        userId: affiliate.user_id,
        valedoceBalance: affiliate.valedoce_balance || 0,
      });

      // Só exibir o toast se for um novo afiliado e ainda não foi notificado
      if (shouldShowToast) {
        toast.success(`Você está comprando por um link do programa de afiliados!`);
        localStorage.setItem("affiliate_notified_code", normalizedCode);
      }
      return true;
    } catch (error) {
      console.error("Erro ao buscar afiliado:", error);
      toast.error("Erro ao processar código de afiliado");
      return false;
    } finally {
      setIsTracking(false);
    }
  };

  const clearActiveAffiliate = () => {
    setActiveAffiliate(null);
    localStorage.removeItem("affiliate_code");
    localStorage.removeItem("affiliate_expiry");
    localStorage.removeItem("affiliate_notified_code");
  };

  return (
    <AffiliateContext.Provider
      value={{
        activeAffiliate,
        setActiveAffiliate,
        trackAffiliateCode,
        clearActiveAffiliate,
        isTracking,
      }}
    >
      {children}
    </AffiliateContext.Provider>
  );
};