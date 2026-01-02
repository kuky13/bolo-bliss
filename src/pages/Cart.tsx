import React from "react";
import { Link, useNavigate } from "react-router-dom";
import StoreLayout from "@/components/layout/StoreLayout";
import CartItemCard from "@/components/CartItemCard";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ShoppingCart, Trash2, ShoppingBag } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useCoupon } from "@/context/CouponContext";
import { useValeDoce } from "@/context/ValeDoceContext";
import CouponForm from "@/components/checkout/CouponForm";
import ValeDoceBalanceBadge from "@/components/ui/ValeDoceBalanceBadge";
import { IOSCard } from "@/components/ui/IOSCard";
import { useIsMobile } from "@/hooks/use-mobile.tsx";
import { PageTransition } from "@/components/layout/PageTransition";

const Cart = () => {
  const { items, clearCart, subtotal } = useCart();
  const { settings } = useStore();
  const { calculateDiscount } = useCoupon();
  const { currentAffiliate, balance } = useValeDoce();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const deliveryFee = settings.deliveryFee || 0;
  const hasFreeDelivery = settings.freeDeliveryThreshold && subtotal >= settings.freeDeliveryThreshold;
  const calculatedDeliveryFee = hasFreeDelivery ? 0 : deliveryFee;
  const discountAmount = calculateDiscount(subtotal, calculatedDeliveryFee);
  const total = subtotal + calculatedDeliveryFee - discountAmount;

  return (
    <StoreLayout>
      <PageTransition>
        <div className="container max-w-4xl mx-auto px-4 py-4 sm:py-6 pb-24">
        {/* Header */}
        <div className="mb-4 flex items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Seu Carrinho</h1>
        </div>

        {/* ValeDoce Balance Card */}
        {currentAffiliate && balance > 0 && (
          <div className="mb-4 animate-fade-in-up">
            <ValeDoceBalanceBadge variant="card" />
          </div>
        )}

        {items.length === 0 ? (
          <IOSCard variant="elevated" className="flex flex-col items-center justify-center p-8 text-center animate-fade-in-up">
            <div className="rounded-full bg-muted p-5 mb-4">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-lg font-semibold">Carrinho vazio</h2>
            <p className="mb-5 text-sm text-muted-foreground max-w-xs">
              Adicione produtos para começar a comprar
            </p>
            <Link to="/">
              <Button className="touch-feedback shadow-lg shadow-primary/20">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Ver Produtos
              </Button>
            </Link>
          </IOSCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-11">
            {/* Cart Items */}
            <div className="md:col-span-6 lg:col-span-7">
              <IOSCard variant="default" padding="none" className="overflow-hidden">
                <div className="p-4 border-b border-border/50">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    Itens ({items.length})
                  </h2>
                </div>
                
                <div className="divide-y divide-border/50 max-h-[55vh] overflow-y-auto">
                  {items.map((item, index) => (
                    <div 
                      key={item.product.id} 
                      className="animate-fade-in-up p-3"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CartItemCard item={item} />
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-border/50 flex justify-between bg-muted/30">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs touch-feedback"
                    onClick={() => navigate("/")}
                  >
                    <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                    Continuar
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-destructive hover:bg-destructive/10 touch-feedback"
                    onClick={clearCart}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Limpar
                  </Button>
                </div>
              </IOSCard>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-5 lg:col-span-4">
              <IOSCard 
                variant="elevated" 
                padding="md" 
                className="sticky top-20 animate-fade-in-up"
                style={{ animationDelay: '0.1s' }}
              >
                <h2 className="mb-4 text-base font-semibold text-foreground">
                  Resumo do Pedido
                </h2>
                
                <div className="mb-4">
                  <CouponForm />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entrega</span>
                    <span className={hasFreeDelivery ? "text-green-600 font-medium" : "font-medium"}>
                      {hasFreeDelivery ? "Grátis" : `R$ ${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto</span>
                      <span className="font-medium">-R$ {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">
                      R$ {total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button 
                  className="mt-5 w-full shadow-lg shadow-primary/20 touch-feedback"
                  size="lg"
                  onClick={() => navigate("/checkout")}
                >
                  {isMobile ? 'Finalizar' : 'Finalizar Compra'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <p className="mt-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                  Pagamento seguro
                </p>
                
                {hasFreeDelivery && (
                  <div className="mt-3 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg text-xs text-green-700 dark:text-green-400 text-center flex items-center justify-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Entrega gratuita aplicada
                  </div>
                )}
              </IOSCard>
            </div>
          </div>
        )}
        </div>
      </PageTransition>
    </StoreLayout>
  );
};

export default Cart;
