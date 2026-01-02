import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useStoreHours } from "@/hooks/useStoreHours";
import { Product } from "@/types";
import {
  ShoppingCart,
  XCircle,
  Package,
  Plus,
  Minus,
  Clock,
  Check,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductDetailsDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductDetailsDialog: React.FC<ProductDetailsDialogProps> = ({
  product,
  open,
  onOpenChange,
}) => {
  const { addToCart, items, updateQuantity } = useCart();
  const { settings } = useStore();
  const { isStoreOpen } = useStoreHours();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!product) return null;

  const cartItem = items.find((item) => item.product.id === product.id);
  const currentQuantity = cartItem?.quantity || 0;
  const maxQuantity = product.maxPurchaseQuantity || 5;
  const availableStock = product.stock ?? Infinity;
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isStoreClosed = !settings.alwaysOpen && !isStoreOpen;
  const isDisabled = isOutOfStock || isStoreClosed;

  // Calcular quantidade máxima permitida
  const maxAllowedQuantity = Math.max(
    0,
    Math.min(
      maxQuantity - currentQuantity,
      availableStock !== Infinity ? availableStock - currentQuantity : maxQuantity - currentQuantity
    )
  );

  // Resetar quantidade quando o produto mudar ou quando o carrinho mudar
  useEffect(() => {
    if (product) {
      setImageLoading(true);
      // Calcular quantidade máxima permitida para este efeito
      const cartItemForEffect = items.find((item) => item.product.id === product.id);
      const currentQty = cartItemForEffect?.quantity || 0;
      const maxQty = product.maxPurchaseQuantity || 5;
      const available = product.stock ?? Infinity;
      
      const maxAllowed = Math.max(
        0,
        Math.min(
          maxQty - currentQty,
          available !== Infinity ? available - currentQty : maxQty - currentQty
        )
      );
      
      // Ajustar quantidade inicial baseado no que está disponível
      if (maxAllowed > 0) {
        setQuantity(1);
      } else {
        setQuantity(0);
      }
    }
  }, [product?.id, items]); // Depender do ID do produto e items do carrinho

  const handleIncreaseQuantity = () => {
    if (quantity < maxAllowedQuantity && maxAllowedQuantity > 0) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (isDisabled || quantity <= 0 || maxAllowedQuantity <= 0) return;

    setIsAdding(true);

    // Adicionar a quantidade especificada
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    // Resetar após adicionar
    setTimeout(() => {
      setIsAdding(false);
      const newMaxAllowed = Math.max(
        0,
        Math.min(
          maxQuantity - (currentQuantity + quantity),
          availableStock !== Infinity ? availableStock - (currentQuantity + quantity) : maxQuantity - (currentQuantity + quantity)
        )
      );
      setQuantity(newMaxAllowed > 0 ? 1 : 0);
    }, 1000);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </DialogTitle>
              {product.category && (
                <Badge variant="secondary" className="mb-2">
                  {product.category}
                </Badge>
              )}
            </div>
            {product.featured && (
              <Badge className="bg-store-pink text-white animate-pulse">
                Top
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Imagem do produto */}
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
            {imageLoading && (
              <Skeleton className="absolute inset-0 w-full h-full" />
            )}
            <img
              src={product.imageUrl || "https://placehold.co/600x600"}
              alt={product.name}
              className={`w-full h-full object-cover ${
                imageLoading ? "opacity-0" : "opacity-100"
              } transition-opacity duration-300`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>

          {/* Descrição */}
          {product.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                Descrição
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Informações do produto */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 mb-1">Preço</p>
              <p className="text-2xl font-bold text-store-pink">
                R$ {product.price.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Estoque</p>
              <div className="flex items-center gap-2">
                {isOutOfStock ? (
                  <div className="flex items-center gap-1 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span className="font-semibold">Esgotado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-600">
                    <Package className="h-4 w-4" />
                    <span className="font-semibold">
                      {product.stock !== undefined
                        ? `${product.stock} disponíveis`
                        : "Disponível"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status da loja */}
          {isStoreClosed && !isOutOfStock && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2 text-orange-700">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Loja fechada no momento
              </span>
            </div>
          )}

          {/* Controle de quantidade */}
          {!isDisabled && maxAllowedQuantity > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Quantidade
                </label>
                {currentQuantity > 0 && (
                  <span className="text-xs text-gray-500">
                    {currentQuantity} no carrinho
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border rounded-lg p-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleDecreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold w-8 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleIncreaseQuantity}
                    disabled={quantity >= maxAllowedQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">
                    Máximo: {maxQuantity} por cliente
                    {availableStock !== Infinity &&
                      ` • Disponível: ${availableStock}`}
                    {currentQuantity > 0 &&
                      ` • Restante: ${maxAllowedQuantity}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem quando já atingiu o limite */}
          {!isDisabled && maxAllowedQuantity === 0 && currentQuantity > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Você já adicionou a quantidade máxima deste produto ao carrinho ({currentQuantity} unidade{currentQuantity > 1 ? 's' : ''}).
              </p>
            </div>
          )}

          {/* Botão de adicionar ao carrinho */}
          <Button
            onClick={handleAddToCart}
            disabled={isDisabled || isAdding || maxAllowedQuantity <= 0}
            className={`w-full h-12 text-base font-semibold rounded-full transition-all duration-300 ${
              isDisabled || maxAllowedQuantity <= 0
                ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                : isAdding
                ? "bg-green-500 hover:bg-green-500"
                : "bg-store-pink hover:bg-store-pink/90"
            }`}
          >
            {isOutOfStock ? (
              <>
                <XCircle className="mr-2 h-5 w-5" />
                Produto Esgotado
              </>
            ) : isStoreClosed ? (
              <>
                <Clock className="mr-2 h-5 w-5" />
                Loja Fechada
              </>
            ) : isAdding ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Adicionado!
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Adicionar {quantity > 1 ? `${quantity} ao` : "ao"} Carrinho
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;

