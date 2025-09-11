"use client";

import * as React from "react";
import type { Product } from "@/lib/mock-data";
import { toast } from "sonner";

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Product) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);

  const addItem = (product: Product) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === product.id);
      if (existingItem) {
        // If item exists, update its quantity
        return prevItems.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      // If item doesn't exist, add it to the cart
      return [...prevItems, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} ditambahkan ke keranjang!`);
  };

  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    toast.error("Item dihapus dari keranjang.");
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
    } else {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = React.useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const totalPrice = React.useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}