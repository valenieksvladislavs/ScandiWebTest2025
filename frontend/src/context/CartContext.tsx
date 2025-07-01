import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  attributes: Record<string, string>;
  image?: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateAttributes: (id: string, attributes: Record<string, string>) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id && JSON.stringify(i.attributes) === JSON.stringify(item.attributes));
      if (existing) {
        return prev.map(i =>
          i.id === item.id && JSON.stringify(i.attributes) === JSON.stringify(item.attributes)
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        return [...prev, item];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => setItems([]);

  const updateAttributes = (id: string, attributes: Record<string, string>) => {
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, attributes } : i
    ));
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, updateAttributes }}>
      {children}
    </CartContext.Provider>
  );
};
