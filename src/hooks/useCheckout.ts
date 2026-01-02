import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useCoupon } from "@/context/CouponContext";
import { useAffiliate } from "@/context/AffiliateContext";
import { useValeDoce } from "@/context/ValeDoceContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type DeliveryMethodType = "delivery" | "pickup";
export type PaymentMethodType = "pix" | "card" | "cash" | "valedoce";

export interface CustomerInfoType {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export interface ShippingInfoType {
  name: string;
  address: string;
  complement: string;
  district: string;
  reference: string;
  latitude?: number;
  longitude?: number;
}

export interface PaymentResultType {
  orderId: string;
  orderCode: string;
  paymentMethod: string;
  preferenceId?: string;
  initPoint?: string;
  sandboxInitPoint?: string;
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  pixPaymentId?: string;
  paymentStatus?: string;
}

const useCheckout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useStore();
  const { appliedCoupon, calculateDiscount } = useCoupon();
  const { activeAffiliate, clearActiveAffiliate } = useAffiliate();
  const { settings: valedoceSettings, balance, currentAffiliate, refreshBalance } = useValeDoce();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodType>("delivery");
  
  // Customer info (new)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfoType>({
    name: "",
    email: "",
    phone: "",
    cpf: "",
  });
  
  // Shipping info
  const [shippingInfo, setShippingInfo] = useState<ShippingInfoType>({
    name: "",
    address: "",
    complement: "",
    district: "",
    reference: "",
  });
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("pix");
  const [needChange, setNeedChange] = useState(false);
  const [changeAmount, setChangeAmount] = useState("");
  const [customCakeDetails, setCustomCakeDetails] = useState("");
  const [couponCode, setCouponCode] = useState("");
  
  // ValeDoce state
  const [isUsingValeDoce, setIsUsingValeDoce] = useState(false);
  const [valedoceAmount, setValedoceAmount] = useState(0);
  
  // Payment result (after order creation)
  const [paymentResult, setPaymentResult] = useState<PaymentResultType | null>(null);

  // Check if any item is a custom cake
  const hasCustomCakeItem = items.some(item => 
    item.product.category === "Bolos Personalizados"
  );
  
  // Calculate total with delivery fee and discount logic
  const deliveryFee = settings.deliveryFee || 0;
  const hasFreeDelivery = settings.freeDeliveryThreshold && subtotal >= settings.freeDeliveryThreshold;
  const calculatedDeliveryFee = (deliveryMethod === "delivery" && !hasFreeDelivery) ? deliveryFee : 0;
  
  // Calculate discount amount
  const discountAmount = calculateDiscount(subtotal, calculatedDeliveryFee);
  
  // Calculate ValeDoce discount based on payment method
  // If paying 100% with ValeDoce, discount is the full total
  // Otherwise, use the slider amount
  const baseTotal = subtotal + calculatedDeliveryFee - discountAmount;
  const valedoceDiscount = paymentMethod === "valedoce" 
    ? baseTotal 
    : (isUsingValeDoce ? valedoceAmount * valedoceSettings.valedoceValue : 0);
  
  // Calculate final total
  const total = Math.max(0, baseTotal - valedoceDiscount);
  
  // Check if user can pay 100% with ValeDoce
  const canPayFullWithValeDoce = currentAffiliate && 
    balance * valedoceSettings.valedoceValue >= baseTotal;
  
  // Handle customer info change
  const handleCustomerInfoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  }, []);
  
  // Handle shipping form input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  }, []);
  
  // Handle location selection from map
  const handleLocationSelect = useCallback((location: { latitude: number; longitude: number; address: string; district: string }) => {
    setShippingInfo((prev) => ({
      ...prev,
      address: location.address,
      district: location.district,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  }, []);

  // Handle custom cake details change
  const handleCustomCakeDetailsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomCakeDetails(e.target.value);
  }, []);
  
  // Format WhatsApp message with all order details (for cash payments)
  const formatWhatsAppMessage = useCallback((orderCode: string) => {
    let message = `*Novo Pedido em ${settings.storeName}*\n`;
    message += `*Código:* #${orderCode}\n\n`;
    
    // Add products
    message += "*Produtos:*\n";
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name} - ${item.quantity}x R$ ${item.product.price.toFixed(2)} = R$ ${(item.product.price * item.quantity).toFixed(2)}\n`;
      
      if (item.product.category === "Bolos Personalizados" && customCakeDetails) {
        message += `   *Detalhes:* ${customCakeDetails}\n`;
      }
    });
    
    message += `\n*Subtotal:* R$ ${subtotal.toFixed(2)}`;
    
    if (deliveryMethod === "delivery") {
      message += `\n*Taxa de Entrega:* ${hasFreeDelivery ? "Grátis" : `R$ ${deliveryFee.toFixed(2)}`}`;
    }
    
    if (appliedCoupon && discountAmount > 0) {
      message += `\n*Cupom:* ${appliedCoupon.code} (-R$ ${discountAmount.toFixed(2)})`;
    }
    
    if (valedoceDiscount > 0) {
      message += `\n*ValeDoce:* -R$ ${valedoceDiscount.toFixed(2)}`;
    }
    
    message += `\n*Total:* R$ ${total.toFixed(2)}`;
    message += `\n\n*Entrega:* ${deliveryMethod === "delivery" ? "Entrega a Domicílio" : "Retirada no Local"}`;
    
    if (deliveryMethod === "delivery") {
      message += `\n*Nome:* ${customerInfo.name}`;
      message += `\n*Endereço:* ${shippingInfo.address}`;
      if (shippingInfo.complement) message += `\n*Complemento:* ${shippingInfo.complement}`;
      message += `\n*Bairro:* ${shippingInfo.district}`;
      if (shippingInfo.reference) message += `\n*Referência:* ${shippingInfo.reference}`;
    }
    
    message += `\n\n*Contato:*`;
    message += `\n*Email:* ${customerInfo.email}`;
    message += `\n*Telefone:* ${customerInfo.phone}`;
    
    message += `\n\n*Pagamento:* Dinheiro`;
    if (needChange) {
      message += `\n*Troco para:* ${changeAmount}`;
    } else {
      message += "\n*Troco:* Não precisa";
    }
    
    if (activeAffiliate) {
      message += `\n\n🎯 *Afiliado:* ${activeAffiliate.name} (${activeAffiliate.code})`;
    }
    
    return encodeURIComponent(message);
  }, [items, subtotal, deliveryMethod, hasFreeDelivery, deliveryFee, total, customerInfo, shippingInfo, needChange, changeAmount, customCakeDetails, settings.storeName, appliedCoupon, discountAmount, valedoceDiscount, activeAffiliate]);
  
  // Type-safe handlers for component props
  const handleDeliveryMethodChange = (value: string) => {
    setDeliveryMethod(value as DeliveryMethodType);
  };

  const handlePaymentMethodChange = (value: string) => {
    const newMethod = value as PaymentMethodType;
    setPaymentMethod(newMethod);
    
    // Reset ValeDoce slider if switching to/from valedoce method
    if (newMethod === "valedoce") {
      setIsUsingValeDoce(false);
      setValedoceAmount(0);
    }
  };
  
  // Validate form
  const validateForm = useCallback((): boolean => {
    // Customer info validation
    if (!customerInfo.name.trim()) {
      toast.error("Por favor, informe seu nome.");
      return false;
    }
    
    if (!customerInfo.email.trim() || !customerInfo.email.includes("@")) {
      toast.error("Por favor, informe um email válido.");
      return false;
    }
    
    if (!customerInfo.phone.trim() || customerInfo.phone.replace(/\D/g, "").length < 10) {
      toast.error("Por favor, informe um telefone válido.");
      return false;
    }
    
    // Delivery validation
    if (deliveryMethod === "delivery") {
      if (!shippingInfo.address.trim()) {
        toast.error("Por favor, informe o endereço de entrega.");
        return false;
      }
      if (!shippingInfo.district.trim()) {
        toast.error("Por favor, informe o bairro.");
        return false;
      }
      if (!shippingInfo.latitude || !shippingInfo.longitude) {
        toast.error("Por favor, selecione a localização no mapa.");
        return false;
      }
    }
    
    // Cash payment validation
    if (paymentMethod === "cash" && needChange && !changeAmount) {
      toast.error("Por favor, informe o valor para troco.");
      return false;
    }

    // ValeDoce validation
    if (paymentMethod === "valedoce") {
      if (!currentAffiliate) {
        toast.error("Você precisa estar logado como afiliado para usar ValeDoce.");
        return false;
      }
      if (!canPayFullWithValeDoce) {
        toast.error("Saldo ValeDoce insuficiente para pagar o pedido completo.");
        return false;
      }
    }

    // Custom cake validation
    if (hasCustomCakeItem && !customCakeDetails.trim()) {
      toast.error("Por favor, descreva os detalhes do seu bolo personalizado.");
      return false;
    }
    
    return true;
  }, [customerInfo, deliveryMethod, shippingInfo, paymentMethod, needChange, changeAmount, hasCustomCakeItem, customCakeDetails, currentAffiliate, canPayFullWithValeDoce]);
  
  // Handle checkout process
  const handleCheckout = useCallback(async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // NOTE: ValeDoce spending is now handled server-side after payment confirmation
      // This prevents losing ValeDoce if payment fails
      
      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            imageUrl: item.product.imageUrl,
          },
          quantity: item.quantity,
        })),
        customer: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          cpf: customerInfo.cpf || undefined,
        },
        delivery: {
          method: deliveryMethod,
          address: shippingInfo.address || undefined,
          district: shippingInfo.district || undefined,
          complement: shippingInfo.complement || undefined,
          reference: shippingInfo.reference || undefined,
          latitude: shippingInfo.latitude || undefined,
          longitude: shippingInfo.longitude || undefined,
        },
        payment: {
          method: paymentMethod,
          needChange: needChange,
          changeAmount: changeAmount || undefined,
        },
        totals: {
          subtotal,
          deliveryFee: calculatedDeliveryFee,
          discountAmount,
          valedoceDiscount,
          total,
        },
        customCakeDetails: customCakeDetails || undefined,
        affiliateId: activeAffiliate?.id || undefined,
        affiliateCode: activeAffiliate?.code || undefined,
        couponCode: appliedCoupon?.code || undefined,
        buyerAffiliateId: currentAffiliate?.id || undefined,
      };
      
      console.log("Creating order:", orderData);
      
      // Call edge function to create order
      const { data, error } = await supabase.functions.invoke("create-payment-preference", {
        body: orderData,
      });
      
      if (error) {
        console.error("Error creating order:", error);
        throw new Error(error.message || "Erro ao criar pedido");
      }
      
      console.log("Order created:", data);
      
      // Track affiliate sale if there's an active affiliate
      if (activeAffiliate) {
        const saleData = {
          affiliate_id: activeAffiliate.id,
          order_value: total,
          commission_value: (total * (activeAffiliate.commissionRate / 100)),
          customer_info: {
            name: customerInfo.name,
            method: deliveryMethod,
            payment: paymentMethod
          },
          products_sold: items.map(item => ({
            id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            total: item.product.price * item.quantity
          })),
          store_id: null
        };

        await supabase
          .from("affiliate_sales")
          .insert([saleData]);
      }
      
      // Handle payment based on method
      if (paymentMethod === "valedoce") {
        // ValeDoce-only payment - already processed server-side
        clearCart();
        clearActiveAffiliate(); // Clear affiliate after successful purchase
        await refreshBalance(); // Refresh balance after spending
        toast.success("Pedido realizado com sucesso! Código: " + data.orderCode);
        navigate(`/payment/success?order=${data.orderCode}`);
      } else if (paymentMethod === "cash") {
        // For cash, send to WhatsApp
        const whatsappNumber = settings.whatsappNumber.replace(/\D/g, "");
        const message = formatWhatsAppMessage(data.orderCode);
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;
        
        clearCart();
        clearActiveAffiliate(); // Clear affiliate after successful purchase
        window.open(whatsappLink, "_blank");
        toast.success("Pedido enviado! Código: " + data.orderCode);
        navigate("/");
      } else if (paymentMethod === "pix") {
        // For PIX, go to pending page with QR code
        clearCart();
        clearActiveAffiliate(); // Clear affiliate after successful purchase
        setPaymentResult(data);
        navigate(`/payment/pending?order=${data.orderCode}`);
      } else if (paymentMethod === "card") {
        // For card, redirect to Mercado Pago
        clearCart();
        clearActiveAffiliate(); // Clear affiliate after successful purchase
        if (data.initPoint) {
          window.location.href = data.initPoint;
        } else {
          toast.error("Erro ao gerar link de pagamento");
        }
      }
    } catch (error: any) {
      console.error("Error processing checkout:", error);
      toast.error(error.message || "Erro ao finalizar o pedido. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [
    validateForm,
    items,
    customerInfo,
    deliveryMethod,
    shippingInfo,
    paymentMethod,
    needChange,
    changeAmount,
    subtotal,
    calculatedDeliveryFee,
    discountAmount,
    valedoceDiscount,
    total,
    customCakeDetails,
    activeAffiliate,
    appliedCoupon,
    currentAffiliate,
    settings.whatsappNumber,
    formatWhatsAppMessage,
    clearCart,
    clearActiveAffiliate,
    navigate,
    refreshBalance
  ]);

  return {
    items,
    subtotal,
    deliveryFee,
    hasFreeDelivery,
    total,
    isLoading,
    deliveryMethod,
    customerInfo,
    shippingInfo,
    paymentMethod,
    needChange,
    changeAmount,
    customCakeDetails,
    hasCustomCakeItem,
    appliedCoupon,
    discountAmount,
    paymentResult,
    handleCustomerInfoChange,
    handleInputChange,
    handleLocationSelect,
    handleDeliveryMethodChange,
    handlePaymentMethodChange,
    setNeedChange,
    setChangeAmount,
    handleCustomCakeDetailsChange,
    handleCheckout,
    couponCode,
    setCouponCode,
    // ValeDoce
    isUsingValeDoce,
    setIsUsingValeDoce,
    valedoceAmount,
    setValedoceAmount,
    valedoceDiscount,
    canPayFullWithValeDoce,
    balance,
  };
};

export default useCheckout;
