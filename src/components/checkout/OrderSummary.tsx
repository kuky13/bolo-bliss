import React from "react";
import { CartItem } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import CartItemCard from "@/components/CartItemCard";
import { CheckCircle, ShieldCheck } from "lucide-react";
import GhostLoader from "@/components/ui/ghost-loader";
import CouponForm from "./CouponForm";
import { useIsMobile } from "@/hooks/use-mobile.tsx";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  hasFreeDelivery: boolean;
  total: number;
  isDelivery: boolean;
  isLoading: boolean;
  discountAmount?: number;
  onCheckout: () => void;
}

const OrderSummary = ({
  items,
  subtotal,
  deliveryFee,
  hasFreeDelivery,
  total,
  isDelivery,
  isLoading,
  discountAmount = 0,
  onCheckout,
}: OrderSummaryProps) => {
  const isMobile = useIsMobile();

  return (
    <div
      className={`rounded-xl border bg-card/90 dark:bg-card ${isMobile ? "p-2.5" : "p-4 md:p-6"} shadow-md backdrop-blur-sm animate-fade-in`}
    >
      <h2 className={`mb-2 ${isMobile ? "text-base" : "text-xl"} font-semibold text-gradient`}>Resumo do Pedido</h2>

      <div
        className={`mb-2 ${isMobile ? "max-h-32" : "max-h-48 md:max-h-64"} ${isMobile ? "space-y-1.5" : "space-y-2 md:space-y-3"} overflow-y-auto scrollbar-none ${items.length > 1 ? "border-b border-border/50 pb-2" : ""}`}
      >
        {items.map((item) => (
          <CartItemCard key={item.product.id} item={item} allowEdit={false} />
        ))}
      </div>

      {!isMobile && <Separator className="my-3 md:my-4" />}

      {/* Coupon Form */}
      <div className={`${isMobile ? "mb-2" : "mb-3 md:mb-4"}`}>
        <CouponForm />
      </div>

      <div className={`${isMobile ? "space-y-1.5 text-xs" : "space-y-2 md:space-y-3 text-xs md:text-sm"}`}>
        <div className="flex justify-between">
          <span className="text-muted-foreground font-medium">Subtotal</span>
          <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground font-medium">Taxa de Entrega</span>
          <span>
            {isDelivery ? (
              hasFreeDelivery ? (
                <span className="text-store-green font-medium">Grátis</span>
              ) : (
                `R$ ${deliveryFee.toFixed(2)}`
              )
            ) : (
              "N/A"
            )}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-store-green">
            <span className="font-medium">Desconto</span>
            <span className="font-medium">-R$ {discountAmount.toFixed(2)}</span>
          </div>
        )}

        <Separator className="my-1" />
        <div className={`flex justify-between font-medium ${isMobile ? "text-sm" : "text-sm md:text-base"}`}>
          <span>Total</span>
          <span className="text-store-pink font-bold">R$ {total.toFixed(2)}</span>
        </div>
      </div>

      <Button
        className={`${isMobile ? "mt-3 py-2.5 text-sm h-10" : "mt-4 md:mt-6 py-3 text-base"} w-full bg-[#FF1B8D] hover:bg-[#e0177c] hover:shadow-lg text-white font-medium rounded-xl transition-all`}
        onClick={onCheckout}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className={`mr-1.5 inline-flex items-center ${isMobile ? "scale-75" : ""}`}>
              <GhostLoader size="small" />
            </div>
            Processando...
          </>
        ) : (
          <>
            <CheckCircle className={`mr-1.5 ${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
            Finalizar Pedido
          </>
        )}
      </Button>

      <div
        className={`${isMobile ? "mt-2" : "mt-2 md:mt-3"} flex items-center justify-center text-center ${isMobile ? "text-[10px]" : "text-xs"} text-muted-foreground`}
      >
        <ShieldCheck className="h-3 w-3 mr-1" />
        <p>Pagamento seguro via Mercado Pago</p>
      </div>
    </div>
  );
};

export default OrderSummary;
