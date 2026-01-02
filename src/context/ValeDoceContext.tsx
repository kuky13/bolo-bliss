import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { ValeDoceSettings, ValeDoceTransaction, Affiliate } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ValeDoceContextType {
  settings: ValeDoceSettings;
  currentAffiliate: Affiliate | null;
  transactions: ValeDoceTransaction[];
  isLoading: boolean;
  balance: number;
  refreshBalance: () => Promise<void>;
  spendValeDoce: (amount: number, description: string) => Promise<boolean>;
  loadTransactions: () => Promise<void>;
  updateSettings: (newSettings: Partial<ValeDoceSettings>) => Promise<void>;
  applyDefaultRewardToAll: () => Promise<void>;
}

const defaultSettings: ValeDoceSettings = {
  defaultReward: 5,
  valedoceValue: 1.00,
  emailNotifications: true
};

const ValeDoceContext = createContext<ValeDoceContextType | undefined>(undefined);

export const useValeDoce = () => {
  const context = useContext(ValeDoceContext);
  if (!context) {
    throw new Error("useValeDoce must be used within a ValeDoceProvider");
  }
  return context;
};

interface ValeDoceProviderProps {
  children: ReactNode;
}

export const ValeDoceProvider: React.FC<ValeDoceProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<ValeDoceSettings>(defaultSettings);
  const [currentAffiliate, setCurrentAffiliate] = useState<Affiliate | null>(null);
  const [transactions, setTransactions] = useState<ValeDoceTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  // Obter usuário autenticado
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUserId(user?.id || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setAuthUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carregar configurações
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("valedoce_settings")
          .select("*")
          .limit(1)
          .single();

        if (error) {
          console.log("Usando configurações padrão:", error.message);
          return;
        }

        if (data) {
          setSettings({
            id: data.id,
            storeId: data.store_id,
            defaultReward: data.default_reward,
            valedoceValue: data.valedoce_value,
            emailNotifications: data.email_notifications
          });
        }
      } catch (error) {
        console.error("Erro ao carregar configurações ValeDoce:", error);
      }
    };

    loadSettings();
  }, []);

  // Carregar afiliado do usuário logado
  useEffect(() => {
    const loadCurrentAffiliate = async () => {
      if (!authUserId) {
        setCurrentAffiliate(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("affiliates")
          .select("*")
          .eq("user_id", authUserId)
          .single();

        if (error) {
          if (error.code !== "PGRST116") {
            console.error("Erro ao carregar afiliado:", error);
          }
          return;
        }

        if (data) {
          setCurrentAffiliate({
            id: data.id,
            code: data.code,
            name: data.name,
            email: data.email,
            commissionRate: data.commission_rate || 0,
            active: data.active,
            points: data.points,
            totalSales: data.total_sales,
            salesCount: data.sales_count,
            storeId: data.store_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            userId: data.user_id,
            valedoceBalance: data.valedoce_balance || 0
          });
        }
      } catch (error) {
        console.error("Erro ao carregar afiliado:", error);
      }
    };

    loadCurrentAffiliate();
  }, [authUserId]);

  const refreshBalance = useCallback(async () => {
    if (!currentAffiliate) return;

    try {
      const { data, error } = await supabase
        .from("affiliates")
        .select("valedoce_balance")
        .eq("id", currentAffiliate.id)
        .single();

      if (error) throw error;

      setCurrentAffiliate(prev => prev ? {
        ...prev,
        valedoceBalance: data.valedoce_balance || 0
      } : null);
    } catch (error) {
      console.error("Erro ao atualizar saldo:", error);
    }
  }, [currentAffiliate]);

  const loadTransactions = useCallback(async () => {
    if (!currentAffiliate) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("valedoce_transactions")
        .select("*")
        .eq("affiliate_id", currentAffiliate.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedTransactions: ValeDoceTransaction[] = (data || []).map(t => ({
        id: t.id,
        affiliateId: t.affiliate_id,
        amount: t.amount,
        type: t.type as ValeDoceTransaction['type'],
        description: t.description,
        orderId: t.order_id,
        productId: t.product_id,
        createdAt: t.created_at
      }));

      setTransactions(mappedTransactions);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentAffiliate]);

  const spendValeDoce = useCallback(async (amount: number, description: string): Promise<boolean> => {
    if (!currentAffiliate || currentAffiliate.valedoceBalance < amount) {
      toast.error("Saldo ValeDoce insuficiente");
      return false;
    }

    try {
      // Registrar transação de gasto
      const { error: transactionError } = await supabase
        .from("valedoce_transactions")
        .insert([{
          affiliate_id: currentAffiliate.id,
          amount: -amount,
          type: "spent",
          description
        }]);

      if (transactionError) throw transactionError;

      // Atualizar saldo
      const { error: updateError } = await supabase
        .from("affiliates")
        .update({ 
          valedoce_balance: currentAffiliate.valedoceBalance - amount 
        })
        .eq("id", currentAffiliate.id);

      if (updateError) throw updateError;

      await refreshBalance();
      toast.success(`${amount} ValeDoce utilizados!`);
      return true;
    } catch (error) {
      console.error("Erro ao gastar ValeDoce:", error);
      toast.error("Erro ao utilizar ValeDoce");
      return false;
    }
  }, [currentAffiliate, refreshBalance]);

  const updateSettings = useCallback(async (newSettings: Partial<ValeDoceSettings>) => {
    try {
      const { error } = await supabase
        .from("valedoce_settings")
        .update({
          default_reward: newSettings.defaultReward,
          valedoce_value: newSettings.valedoceValue,
          email_notifications: newSettings.emailNotifications
        })
        .eq("id", settings.id);

      if (error) throw error;

      setSettings(prev => ({ ...prev, ...newSettings }));
      toast.success("Configurações ValeDoce salvas!");
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error);
      toast.error("Erro ao salvar configurações");
    }
  }, [settings.id]);

  const applyDefaultRewardToAll = useCallback(async () => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ valedoce_reward: settings.defaultReward })
        .gte("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;

      toast.success(`Recompensa de ${settings.defaultReward} ValeDoce aplicada a todos os produtos!`);
    } catch (error) {
      console.error("Erro ao aplicar recompensa padrão:", error);
      toast.error("Erro ao aplicar recompensa padrão");
    }
  }, [settings.defaultReward]);

  const balance = currentAffiliate?.valedoceBalance || 0;

  return (
    <ValeDoceContext.Provider
      value={{
        settings,
        currentAffiliate,
        transactions,
        isLoading,
        balance,
        refreshBalance,
        spendValeDoce,
        loadTransactions,
        updateSettings,
        applyDefaultRewardToAll
      }}
    >
      {children}
    </ValeDoceContext.Provider>
  );
};
