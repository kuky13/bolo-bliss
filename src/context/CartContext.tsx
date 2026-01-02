
import React, { createContext, useContext, useState } from "react";
import { CartItem, Product } from "@/types";
import { toast } from "sonner";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, quantity: number) => void;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Removemos os useEffects de carregar/salvar do localStorage

  const addToCart = (product: Product) => {
    // Verificar se o produto está em estoque
    if (product.stock !== undefined && product.stock <= 0) {
      toast.error(`${product.name} está esgotado`);
      return;
    }
    
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      const maxQuantity = product.maxPurchaseQuantity || 5;
      
      if (existingItem) {
        // Verificar se a adição de mais um item ultrapassa o limite máximo ou o estoque disponível
        if (existingItem.quantity >= maxQuantity) {
          toast.error(`Quantidade máxima permitida é ${maxQuantity} unidades por cliente`);
          return prevItems;
        }
        
        // Verificar se há estoque suficiente
        if (product.stock !== undefined && existingItem.quantity >= product.stock) {
          toast.error(`Não há estoque suficiente. Disponível: ${product.stock} unidades`);
          return prevItems;
        }
        
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(prevItems => {
      const item = prevItems.find(item => item.product.id === productId);
      if (!item) return prevItems;
      
      const maxQuantity = item.product.maxPurchaseQuantity || 5;
      const availableStock = item.product.stock;
      
      // Verificar limite máximo por cliente
      if (quantity > maxQuantity) {
        toast.error(`Quantidade máxima permitida é ${maxQuantity} unidades por cliente`);
        return prevItems.map(item =>
          item.product.id === productId ? { ...item, quantity: maxQuantity } : item
        );
      }
      
      // Verificar estoque disponível
      if (availableStock !== undefined && quantity > availableStock) {
        toast.error(`Não há estoque suficiente. Disponível: ${availableStock} unidades`);
        return prevItems.map(item =>
          item.product.id === productId ? { ...item, quantity: availableStock } : item
        );
      }
      
      return prevItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        subtotal,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
