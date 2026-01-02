
import React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { CartItem as CartItemType } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile.tsx";
interface CartItemCardProps {
  item: CartItemType;
  allowEdit?: boolean;
}
const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  allowEdit = true
}) => {
  const {
    updateQuantity,
    removeFromCart
  } = useCart();
  const {
    product,
    quantity
  } = item;
  const isMobile = useIsMobile();
  return <div className="group bg-white/95 backdrop-blur-sm border border-gray-100 rounded-lg p-2 transition-all hover:shadow-md hover:border-gray-200/80 hover:bg-white">
      <div className="flex items-center">
        <div className={`${isMobile ? 'mr-2 h-12 w-12' : 'mr-3 h-14 w-14'} flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 shadow-sm group-hover:shadow-md transition-all`}>
          <img src={product.imageUrl || "https://placehold.co/400x400"} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} mb-0.5 font-medium text-gray-800 truncate`}>{product.name}</h3>
          <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500`}>
            R$ {product.price.toFixed(2)} x {quantity}
          </p>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-store-pink`}>
            R$ {(product.price * quantity).toFixed(2)}
          </p>
        </div>
        {allowEdit && <div className={`flex ${isMobile ? 'flex-col gap-1 ml-1' : 'items-center gap-2'}`}>
            <div className="flex items-center bg-gray-100 rounded-full px-1 shadow-sm group-hover:bg-gray-200 transition-colors">
              <Button variant="ghost" size="icon" className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} rounded-full p-0 text-gray-600 hover:bg-gray-200 hover:text-gray-800`} onClick={() => updateQuantity(product.id, quantity - 1)} disabled={quantity <= 1}>
                <Minus className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
              </Button>
              <span className={`${isMobile ? 'mx-0.5 w-4 text-[10px]' : 'mx-1 w-5 text-xs'} text-center font-medium`}>{quantity}</span>
              <Button variant="ghost" size="icon" className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} rounded-full p-0 text-gray-600 hover:bg-gray-200 hover:text-gray-800`} onClick={() => updateQuantity(product.id, quantity + 1)}>
                <Plus className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
              </Button>
            </div>
            
          </div>}
      </div>
    </div>;
};
export default CartItemCard;
