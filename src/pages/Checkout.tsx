import React, { useRef } from "react";
import StoreLayout from "@/components/layout/StoreLayout";
import DeliveryMethodSelector from "@/components/checkout/DeliveryMethodSelector";
import ShippingInfoForm from "@/components/checkout/ShippingInfoForm";
import CustomerInfoForm from "@/components/checkout/CustomerInfoForm";
import PaymentMethodSelector from "@/components/checkout/PaymentMethodSelector";
import OrderSummary from "@/components/checkout/OrderSummary";
import CustomCakeForm from "@/components/checkout/CustomCakeForm";
import ValeDocePayment from "@/components/checkout/ValeDocePayment";
import ValeDoceBalanceBadge from "@/components/ui/ValeDoceBalanceBadge";
import LocationMapPicker from "@/components/checkout/LocationMapPicker";
import { IOSCard } from "@/components/ui/IOSCard";
import useCheckout from "@/hooks/useCheckout";
import { useStore } from "@/context/StoreContext";
import { useValeDoce } from "@/context/ValeDoceContext";
import { ArrowRight, ArrowUp, Truck, CreditCard, Cake, Candy, User, MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile.tsx";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";

const Checkout = () => {
  const { settings } = useStore();
  const { currentAffiliate, balance } = useValeDoce();
  const isMobile = useIsMobile();
  const topRef = useRef<HTMLDivElement>(null);
  
  const {
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
    discountAmount,
    handleCustomerInfoChange,
    handleInputChange,
    handleLocationSelect,
    handleDeliveryMethodChange,
    handlePaymentMethodChange,
    setNeedChange,
    setChangeAmount,
    handleCustomCakeDetailsChange,
    handleCheckout,
    isUsingValeDoce,
    setIsUsingValeDoce,
    valedoceAmount,
    setValedoceAmount,
    valedoceDiscount
  } = useCheckout();

  if (items.length === 0) {
    return null;
  }

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Calculate step numbers dynamically
  let stepNumber = 1;
  const customerStep = stepNumber++;
  const deliveryStep = stepNumber++;
  const customCakeStep = hasCustomCakeItem ? stepNumber++ : 0;
  const paymentStep = stepNumber++;
  const valedoceStep = currentAffiliate && balance > 0 ? stepNumber++ : 0;

  const StepIndicator = ({ number, title, icon: Icon }: { number: number; title: string; icon: React.ElementType }) => (
    <div className={`flex items-center ${isMobile ? 'mb-3 mt-5' : 'mb-4 mt-6'} first:mt-0`}>
      <div className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mr-2.5 shadow-lg shadow-primary/20`}>
        <span className={`text-primary-foreground font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>{number}</span>
      </div>
      <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-foreground flex items-center gap-1.5`}>
        <Icon className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-primary`} />
        {title}
      </h2>
    </div>
  );

  return (
    <PageTransition>
      <StoreLayout>
        <div ref={topRef} className={`container mx-auto ${isMobile ? 'px-3 py-3' : 'px-4 py-6'} pb-24`}>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${isMobile ? 'mb-3 text-xl' : 'mb-6 text-2xl'} font-bold text-foreground`}
          >
            Finalizar Pedido
          </motion.h1>

          {/* ValeDoce Balance - Mobile only */}
          {isMobile && currentAffiliate && balance > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3"
            >
              <ValeDoceBalanceBadge variant="card" showLink={false} />
            </motion.div>
          )}

          <div className={`grid ${isMobile ? 'gap-3' : 'gap-6 md:grid-cols-3'}`}>
            {/* Main Form */}
            <div className={`${isMobile ? 'order-2' : 'md:col-span-2'} ${isMobile ? 'space-y-1' : 'space-y-2'}`}>
              
              {/* Step 1: Customer Info */}
              <StepIndicator number={customerStep} title="Seus Dados" icon={User} />
              <IOSCard variant="default" padding={isMobile ? "sm" : "md"}>
                <CustomerInfoForm 
                  customerInfo={customerInfo}
                  onChange={handleCustomerInfoChange}
                />
              </IOSCard>

              {/* Step 2: Delivery */}
              <StepIndicator number={deliveryStep} title="Entrega" icon={Truck} />
              <IOSCard variant="default" padding={isMobile ? "sm" : "md"}>
                <DeliveryMethodSelector 
                  value={deliveryMethod}
                  onChange={handleDeliveryMethodChange}
                />

                {deliveryMethod === "delivery" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-border/50 space-y-4"
                  >
                    {/* Location Map Picker */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        Localização
                      </div>
                      <LocationMapPicker 
                        onLocationSelect={handleLocationSelect}
                        initialLocation={shippingInfo.latitude && shippingInfo.longitude ? {
                          latitude: shippingInfo.latitude,
                          longitude: shippingInfo.longitude
                        } : undefined}
                      />
                      {shippingInfo.latitude && shippingInfo.longitude && (
                        <p className="text-xs text-muted-foreground">
                          📍 Localização selecionada no mapa
                        </p>
                      )}
                    </div>
                    
                    <ShippingInfoForm 
                      shippingInfo={shippingInfo}
                      onChange={handleInputChange}
                    />
                  </motion.div>
                )}
              </IOSCard>

              {/* Step: Custom Cake (conditional) */}
              {hasCustomCakeItem && (
                <>
                  <StepIndicator number={customCakeStep} title="Personalização" icon={Cake} />
                  <IOSCard variant="default" padding={isMobile ? "sm" : "md"}>
                    <CustomCakeForm
                      customCakeDetails={customCakeDetails}
                      customCakeMessage={settings.customCakeMessage || ""}
                      onChange={handleCustomCakeDetailsChange}
                    />
                  </IOSCard>
                </>
              )}

              {/* Payment Step */}
              <StepIndicator number={paymentStep} title="Pagamento" icon={CreditCard} />
              <IOSCard variant="default" padding={isMobile ? "sm" : "md"}>
                <PaymentMethodSelector 
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                  needChange={needChange}
                  changeAmount={changeAmount}
                  onChangeOptionChange={setNeedChange}
                  onChangeAmountChange={setChangeAmount}
                  total={total}
                  isUsingValeDoce={isUsingValeDoce}
                  onUseValeDoceChange={setIsUsingValeDoce}
                  valedoceAmount={valedoceAmount}
                  onValeDoceAmountChange={setValedoceAmount}
                />
              </IOSCard>

              {/* ValeDoce Payment Section */}
              {currentAffiliate && balance > 0 && (
                <>
                  <StepIndicator number={valedoceStep} title="ValeDoce" icon={Candy} />
                  <IOSCard 
                    variant="gradient" 
                    padding={isMobile ? "sm" : "md"} 
                    className="bg-gradient-to-br from-pink-50/50 to-purple-50/50 dark:from-pink-950/20 dark:to-purple-950/20"
                  >
                    <ValeDocePayment
                      total={total}
                      valedoceAmount={valedoceAmount}
                      onValeDoceAmountChange={setValedoceAmount}
                      isUsingValeDoce={isUsingValeDoce}
                      onUseValeDoceChange={setIsUsingValeDoce}
                    />
                  </IOSCard>
                </>
              )}
              
              {isMobile && (
                <div className="flex justify-center mt-4 mb-2">
                  <Button 
                    onClick={scrollToTop} 
                    variant="outline" 
                    size="sm"
                    className="rounded-full touch-feedback text-xs h-8 px-3"
                  >
                    <ArrowUp className="mr-1.5 h-3 w-3" />
                    Voltar ao topo
                  </Button>
                </div>
              )}
              {!isMobile && (
                <div className="flex justify-center mt-6 mb-4">
                  <Button 
                    onClick={scrollToTop} 
                    variant="outline" 
                    size="sm"
                    className="rounded-full touch-feedback"
                  >
                    <ArrowUp className="mr-2 h-3.5 w-3.5" />
                    Voltar ao topo
                  </Button>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className={`${isMobile ? 'order-1 mb-1' : 'md:sticky md:top-20 self-start'}`}>
              <IOSCard variant="elevated" padding={isMobile ? "xs" : "sm"}>
                <OrderSummary 
                  items={items}
                  subtotal={subtotal}
                  deliveryFee={deliveryFee}
                  hasFreeDelivery={hasFreeDelivery}
                  total={total}
                  isDelivery={deliveryMethod === "delivery"}
                  isLoading={isLoading}
                  discountAmount={discountAmount + valedoceDiscount}
                  onCheckout={handleCheckout}
                />
                
                {isUsingValeDoce && valedoceAmount > 0 && (
                  <div className={`flex items-center justify-center ${isMobile ? 'py-1.5 px-2 mt-2' : 'py-2 px-3 mt-3'} bg-pink-50 dark:bg-pink-950/30 rounded-lg text-xs text-pink-600 dark:text-pink-400`}>
                    <Candy className="h-3 w-3 mr-1.5" />
                    <span>{valedoceAmount} ValeDoce = -R$ {valedoceDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                {!isMobile && (
                  <div className="flex items-center justify-center py-2 px-3 bg-primary/5 rounded-lg mt-3 text-xs text-muted-foreground">
                    <ArrowRight className="h-3 w-3 mr-1.5 text-primary animate-pulse" />
                    <p>Complete seu pedido para finalizar</p>
                  </div>
                )}
              </IOSCard>
            </div>
          </div>
        </div>
      </StoreLayout>
    </PageTransition>
  );
};

export default Checkout;
