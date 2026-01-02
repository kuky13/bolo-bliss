
import { useState } from 'react';
import storeConfig from '@/config/store.json';
import appearanceConfig from '@/config/appearance.json';
import productsConfig from '@/config/products.json';
import couponsConfig from '@/config/coupons.json';

/**
 * Hook para acessar as configurações do site de forma centralizada
 */
export function useConfig() {
  const [store] = useState(storeConfig);
  const [appearance] = useState(appearanceConfig);
  const [products] = useState(productsConfig);
  const [coupons] = useState(couponsConfig);

  // Removemos o carregamento de configurações do localStorage
  const isLoaded = true;

  return {
    store,
    appearance,
    products,
    coupons,
    isLoaded
  };
}
