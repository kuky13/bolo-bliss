/**
 * Representa um produto na loja
 * @example
 * {
 *   id: "1",
 *   name: "Bolo de Chocolate",
 *   description: "Delicioso bolo caseiro",
 *   price: 25.90,
 *   imageUrl: "https://...",
 *   featured: true,
 *   category: "Bolos no pote",
 *   stock: 100,
 *   maxPurchaseQuantity: 5,
 *   valedoceReward: 5
 * }
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  featured?: boolean;
  category?: string;
  stock?: number;
  maxPurchaseQuantity?: number;
  valedoceReward?: number;
}

/**
 * Representa um item no carrinho de compras
 * @example
 * {
 *   product: { id: "1", name: "Bolo", price: 25.90, ... },
 *   quantity: 2
 * }
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Representa um cupom de desconto
 * @example
 * {
 *   code: "BEMVINDO10",
 *   discountType: "percentage",
 *   discountValue: 10,
 *   minOrderValue: 0,
 *   active: true,
 *   description: "10% de desconto na primeira compra"
 * }
 */
export interface Coupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  active: boolean;
  description: string;
  expiryDate?: string;
  usageLimit?: number;
  usageCount?: number;
}

/**
 * Representa os horários de funcionamento para um dia da semana
 * @example
 * {
 *   dayOfWeek: 1,
 *   openTime: "08:00",
 *   closeTime: "18:00",
 *   isClosed: false
 * }
 */
export interface StoreHours {
  id: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  openTime: string;  // Formato "HH:mm"
  closeTime: string; // Formato "HH:mm"
  isClosed: boolean;
}

/**
 * Representa um banner exibido na loja (ex: entrega grátis)
 */
export interface StoreBanner {
  id: string;
  text: string;
  /**
   * Classe Tailwind para cor de fundo (ex: "bg-store-yellow")
   */
  bgColor?: string;
  /**
   * Classe Tailwind para cor do texto (ex: "text-store-pink")
   */
  textColor?: string;
}

/**
 * Configurações da loja que podem ser editadas pelo administrador
 * @example
 * {
 *   storeName: "Minha Loja",
 *   whatsappNumber: "5511999999999",
 *   deliveryFee: 10,
 *   freeDeliveryThreshold: 50,
 *   welcomeMessage: "Bem-vindo!",
 *   footerMessage: "Feito com amor",
 *   customCakeMessage: "Descreva seu bolo personalizado:",
 *   announcements: ["Feriado: 30% OFF", "Entrega grátis acima de R$50"],
 *   freeDeliveryMessage: "Entrega Grátis acima de R$ 50",
 *   showFreeDeliveryBanner: true,
 *   alwaysOpen: false,
 *   storeClosedMessage: "Estamos fechados no momento",
 *   socialMedia: { 
 *     instagram: "https://instagram.com/minhaloja",
 *     whatsapp: "https://wa.me/5511999999999"
 *   },
 *   freeDeliveryBanners: [
 *     { id: "1", text: "Entrega Grátis acima de R$ 50", bgColor: "bg-store-yellow", textColor: "text-store-pink" }
 *   ],
 *   bannerRotationInterval: 5
 * }
 */
export interface StoreSettings {
  storeName: string;
  logoUrl?: string;
  whatsappNumber: string;
  deliveryFee: number;
  freeDeliveryThreshold?: number;
  address?: string;
  welcomeMessage?: string;
  footerMessage?: string;
  customCakeMessage?: string;
  announcements?: string[];
  freeDeliveryMessage?: string;
  /**
   * Controle específico do banner padrão (fallback)
   */
  freeDeliveryFallbackEnabled?: boolean;
  freeDeliveryFallbackBgColor?: string;
  freeDeliveryFallbackTextColor?: string;
  showFreeDeliveryBanner?: boolean;
  /**
   * Lista de banners rotativos exibidos na loja
   */
  freeDeliveryBanners?: StoreBanner[];
  /**
   * Intervalo entre trocas de banner, em segundos
   */
  bannerRotationInterval?: number;
  alwaysOpen?: boolean;
  storeClosedMessage?: string;
  socialMedia?: {
    instagram?: string;
    whatsapp?: string;
  };
}

/**
 * Representa um usuário do sistema
 * @example
 * {
 *   id: "1",
 *   email: "admin@exemplo.com",
 *   isAdmin: true
 * }
 */
export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Representa um afiliado no sistema
 * @example
 * {
 *   id: "1",
 *   code: "joao123",
 *   name: "João Silva",
 *   email: "joao@email.com",
 *   active: true,
 *   points: 15,
 *   totalSales: 500.00,
 *   salesCount: 10,
 *   valedoceBalance: 150
 * }
 */
export interface Affiliate {
  id: string;
  code: string;
  name: string;
  email?: string;
  commissionRate: number;
  active: boolean;
  points: number;
  totalSales: number;
  salesCount: number;
  storeId?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  valedoceBalance: number;
}

/**
 * Representa uma venda de afiliado
 * @example
 * {
 *   id: "1",
 *   affiliateId: "affiliate-1",
 *   orderValue: 25.90,
 *   commissionValue: 2.59,
 *   customerInfo: { name: "Cliente" },
 *   productsSold: [{ id: "1", name: "Bolo", quantity: 1 }]
 * }
 */
export interface AffiliateSale {
  id: string;
  affiliateId: string;
  orderValue: number;
  commissionValue: number;
  customerInfo?: any;
  productsSold?: any;
  storeId?: string;
  createdAt: string;
}

/**
 * Representa uma transação ValeDoce
 * @example
 * {
 *   id: "1",
 *   affiliateId: "affiliate-1",
 *   amount: 10,
 *   type: "earned",
 *   description: "Compra via link de afiliado",
 *   createdAt: "2024-01-01T00:00:00Z"
 * }
 */
export interface ValeDoceTransaction {
  id: string;
  affiliateId: string;
  amount: number;
  type: 'earned' | 'spent' | 'expired' | 'bonus';
  description?: string;
  orderId?: string;
  productId?: string;
  createdAt: string;
}

/**
 * Configurações globais do sistema ValeDoce
 * @example
 * {
 *   defaultReward: 5,
 *   valedoceValue: 1.00,
 *   emailNotifications: true
 * }
 */
export interface ValeDoceSettings {
  id?: string;
  storeId?: string;
  defaultReward: number;
  valedoceValue: number;
  emailNotifications: boolean;
}
