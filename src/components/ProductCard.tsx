import React, { useState, memo, useCallback } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useStoreHours } from "@/hooks/useStoreHours";
import { Product } from "@/types";
import { ShoppingCart, XCircle, Package, Heart, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ProductDetailsDialog from "@/components/ProductDetailsDialog";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductCardProps {
  product: Product;
}

const OptimizedImage: React.FC<{ src: string; alt: string; className?: string }> = memo(({ src, alt, className }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  if (hasError) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground text-sm">Imagem não disponível</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <Skeleton className={`absolute inset-0 ${className}`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
});

const ProductCard: React.FC<ProductCardProps> = memo(({ product }) => {
  const { addToCart } = useCart();
  const { settings } = useStore();
  const { isStoreOpen } = useStoreHours();
  const isMobile = useIsMobile();
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Motion values for swipe
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, 0, 100],
    [
      "linear-gradient(90deg, hsl(var(--destructive)) 0%, transparent 100%)",
      "transparent",
      "linear-gradient(270deg, hsl(var(--primary)) 0%, transparent 100%)"
    ]
  );
  const addIconOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);
  const addIconScale = useTransform(x, [0, 50, 100], [0.5, 0.8, 1]);
  
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isStoreClosed = !settings.alwaysOpen && !isStoreOpen;
  const isDisabled = isOutOfStock || isAdding || isStoreClosed;

  const handleAddToCart = async () => {
    if (isDisabled) return;
    
    setIsAdding(true);
    addToCart(product);
    
    setTimeout(() => {
      setIsAdding(false);
    }, 1500);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 80 && !isDisabled) {
      handleAddToCart();
    }
    // Could add delete/remove functionality for negative swipe
  };

  const getButtonContent = () => {
    if (isOutOfStock) {
      return (
        <>
          <XCircle className="mr-1 h-3 w-3" />
          Esgotado
        </>
      );
    }
    
    if (isStoreClosed) {
      return (
        <>
          <Clock className="mr-1 h-3 w-3" />
          Fechado
        </>
      );
    }
    
    if (isAdding) {
      return (
        <motion.div 
          className="flex items-center justify-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          <motion.div
            className="mr-1 h-2 w-2 bg-white rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
          />
          <span className="font-semibold">Ok!</span>
        </motion.div>
      );
    }
    
    return (
      <>
        <ShoppingCart className="mr-1 h-3 w-3 transition-transform duration-300 group-hover:scale-110" />
        Adicionar
      </>
    );
  };

  const getButtonClassName = () => {
    if (isOutOfStock || isStoreClosed) {
      return 'bg-muted text-muted-foreground cursor-not-allowed';
    }
    
    if (isAdding) {
      return 'bg-emerald-500 hover:bg-emerald-500 scale-105 shadow-xl';
    }
    
    return 'bg-primary hover:bg-primary/90 shadow-sm hover:shadow-lg';
  };

  const handleCardClick = () => {
    setIsDialogOpen(true);
  };

  const cardContent = (
    <Card 
      className="overflow-hidden border-0 bg-card shadow-md transition-all hover:shadow-lg h-full group flex flex-col cursor-pointer rounded-2xl"
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="aspect-square overflow-hidden rounded-t-2xl">
          <OptimizedImage
            src={product.imageUrl || "https://placehold.co/400x400"}
            alt={product.name}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock || isStoreClosed ? 'opacity-70' : ''}`}
          />
        </div>
        
        {product.featured && (
          <motion.div 
            className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow-sm"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Top
          </motion.div>
        )}
        
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {product.stock !== undefined && product.stock > 0 && !isStoreClosed && (
            <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
              <Package className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-700 dark:text-emerald-400">{product.stock}</span>
            </div>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground text-xs font-bold py-1.5 px-2 flex items-center justify-center gap-1">
            <XCircle className="h-3 w-3" /> Esgotado
          </div>
        )}

        {isStoreClosed && !isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold py-1.5 px-2 flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" /> Fechado
          </div>
        )}
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full bg-background/90 hover:bg-background hover:text-primary shadow-lg h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleAddToCart();
            }}
            disabled={isDisabled}
          >
            {isDisabled ? <XCircle className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <CardContent className="p-3 text-left flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground leading-tight mb-2 line-clamp-2">
            {product.name}
          </h3>
        </div>
        <p className="text-sm font-bold text-primary mt-auto">
          R$ {product.price.toFixed(2)}
        </p>
      </CardContent>
      
      <CardFooter className="p-3 pt-0">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleAddToCart();
          }}
          disabled={isDisabled}
          className={`w-full rounded-xl text-xs py-1 h-9 transition-all duration-300 ${getButtonClassName()}`}
        >
          {getButtonContent()}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <>
      {isMobile ? (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="relative"
          whileTap={{ scale: 0.98 }}
        >
          {/* Swipe indicator background */}
          <motion.div
            className="absolute inset-0 rounded-2xl -z-10"
            style={{ background }}
          />
          
          {/* Add to cart indicator on right swipe */}
          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2 -z-10 flex items-center gap-2"
            style={{ opacity: addIconOpacity, scale: addIconScale }}
          >
            <ShoppingCart className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-primary">Adicionar</span>
          </motion.div>
          
          {cardContent}
        </motion.div>
      ) : (
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {cardContent}
        </motion.div>
      )}

      <ProductDetailsDialog
        product={product}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
});

OptimizedImage.displayName = 'OptimizedImage';
ProductCard.displayName = 'ProductCard';

export default ProductCard;
