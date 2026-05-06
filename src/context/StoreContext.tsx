
import React, { createContext, useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { StoreSettings } from "@/types";
import defaultSettingsData from "@/config/defaultSettings.json";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface StoreContextType {
  settings: StoreSettings;
  activeStoreId: string | null;
  updateSettings: (newSettings: StoreSettings) => Promise<void>;
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

  const fetchStoreBySlug = async (slug: string) => {
    const { data, error } = await supabase
      .from('stores')
      .select('id, name')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Erro ao buscar loja pelo slug:', error);
      throw new Error("Loja não encontrada");
    }
    return data;
  };

  const fetchStoreSettings = async (storeId: string): Promise<StoreSettings> => {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('store_id', storeId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar configurações:', error);
      throw new Error(error.message);
    }

    if (!data) {
      return defaultSettingsData as StoreSettings;
    }

    return {
      storeName: data.store_name,
      whatsappNumber: data.whatsapp_number || '',
      delivery_fee: data.delivery_fee || 0,
      freeDeliveryThreshold: data.free_delivery_threshold,
      address: data.address,
      welcomeMessage: data.welcome_message,
      footerMessage: data.footer_message,
      customCakeMessage: data.custom_cake_message,
      logoUrl: data.logo_url,
      freeDeliveryMessage: data.free_delivery_message,
      showFreeDeliveryBanner: data.show_free_delivery_banner,
      freeDeliveryFallbackEnabled: (data as any).free_delivery_fallback_enabled ?? true,
      freeDeliveryFallbackBgColor: (data as any).free_delivery_fallback_bg_color || 'bg-store-yellow',
      freeDeliveryFallbackTextColor: (data as any).free_delivery_fallback_text_color || 'text-store-pink',
      freeDeliveryBanners: (data as any).free_delivery_banners || (defaultSettingsData as any).freeDeliveryBanners || [],
      bannerRotationInterval: (data as any).banner_rotation_interval ?? (defaultSettingsData as any).bannerRotationInterval ?? 5,
      alwaysOpen: data.always_open || false,
      storeClosedMessage: data.store_closed_message,
      socialMedia: data.social_media || {}
    } as StoreSettings;
  };

  const {
    data: storeInfo,
    isLoading: isLoadingStore,
    error: storeError
  } = useQuery({
    queryKey: ['storeInfo', storeSlug],
    queryFn: () => fetchStoreBySlug(storeSlug!),
    enabled: !!storeSlug,
  });

  useEffect(() => {
    if (storeInfo?.id) {
      setActiveStoreId(storeInfo.id);
    }
  }, [storeInfo]);

  const {
    data: settings = defaultSettingsData as StoreSettings,
    isLoading: isLoadingSettings,
    error: settingsError,
    isError
  } = useQuery({
    queryKey: ['storeSettings', activeStoreId],
    queryFn: () => fetchStoreSettings(activeStoreId!),
    enabled: !!activeStoreId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  const isLoading = isLoadingStore || isLoadingSettings;
  const error = (storeError || settingsError) as Error | null;

  useEffect(() => {
    if (!isLoading) {
      setIsLoaded(true);
    }
  }, [isLoading]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: StoreSettings) => {
      if (!activeStoreId) throw new Error("ID da loja não definido");

      const dbSettings = {
        store_id: activeStoreId,
        store_name: newSettings.storeName,
        whatsapp_number: newSettings.whatsappNumber,
        delivery_fee: newSettings.deliveryFee,
        free_delivery_threshold: newSettings.freeDeliveryThreshold,
        address: newSettings.address,
        welcome_message: newSettings.welcomeMessage,
        footer_message: newSettings.footerMessage,
        custom_cake_message: newSettings.customCakeMessage,
        logo_url: newSettings.logoUrl,
        free_delivery_message: newSettings.freeDeliveryMessage,
        show_free_delivery_banner: newSettings.showFreeDeliveryBanner,
        free_delivery_fallback_enabled: newSettings.freeDeliveryFallbackEnabled ?? true,
        free_delivery_fallback_bg_color: newSettings.freeDeliveryFallbackBgColor || null,
        free_delivery_fallback_text_color: newSettings.freeDeliveryFallbackTextColor || null,
        free_delivery_banners: (newSettings.freeDeliveryBanners as any) || null,
        banner_rotation_interval: newSettings.bannerRotationInterval ?? null,
        always_open: newSettings.alwaysOpen,
        store_closed_message: newSettings.storeClosedMessage,
        social_media: newSettings.socialMedia || {}
      } as any;

      const { data: existingSettings } = await supabase
        .from('store_settings')
        .select('id')
        .eq('store_id', activeStoreId)
        .maybeSingle();

      if (existingSettings) {
        const { data, error } = await supabase
          .from('store_settings')
          .update(dbSettings)
          .eq('id', existingSettings.id)
          .select();

        if (error) throw new Error(error.message);
        return data;
      } else {
        const { data, error } = await supabase
          .from('store_settings')
          .insert(dbSettings)
          .select();

        if (error) throw new Error(error.message);
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeSettings', activeStoreId] });
      toast.success("Configurações atualizadas com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar configurações: ${error.message}`);
    }
  });

  const updateSettings = async (newSettings: StoreSettings) => {
    await updateSettingsMutation.mutateAsync(newSettings);
  };

  return (
    <StoreContext.Provider value={{
      settings,
      activeStoreId,
      updateSettings,
      isLoaded,
      isLoading,
      error
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
