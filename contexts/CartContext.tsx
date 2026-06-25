'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { Product } from '@/data/products';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isLoadingCart: boolean;
}

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = 'cart';

function readLocal(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const { user, isLoading: isAuthLoading } = useAuth();
  const prevUserId = useRef<string | null>(null);
  const supabase = createClient();

  // Load from localStorage immediately for instant cart display
  useEffect(() => {
    setCartItems(readLocal());
    setIsLoadingCart(false);
  }, []);

  // React to auth state changes (login/logout)
  useEffect(() => {
    if (isAuthLoading) return;

    const userId = user?.id ?? null;
    if (userId === prevUserId.current) return;

    const wasLoggedIn = prevUserId.current !== null;
    prevUserId.current = userId;

    if (userId) {
      handleLoginSync(userId);
    } else if (wasLoggedIn) {
      // Logged out: clear in-memory cart (Supabase copy is preserved)
      setCartItems([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user?.id, isAuthLoading]);

  // Persist to localStorage when not logged in
  useEffect(() => {
    if (!user && !isAuthLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, user, isAuthLoading]);

  const handleLoginSync = async (userId: string) => {
    setIsLoadingCart(true);

    const { data: rows } = await supabase
      .from('cart_items')
      .select('product_id, product_data, quantity')
      .eq('user_id', userId);

    const remote: CartItem[] = (rows ?? []).map(r => ({
      ...(r.product_data as Product),
      quantity: r.quantity,
    }));

    // Merge local items into remote (take max qty for duplicates)
    const local = readLocal();
    const merged = [...remote];
    for (const item of local) {
      const idx = merged.findIndex(r => String(r.id) === String(item.id));
      if (idx >= 0) {
        merged[idx].quantity = Math.max(merged[idx].quantity, item.quantity);
      } else {
        merged.push(item);
      }
    }

    if (merged.length > 0) {
      await supabase.from('cart_items').upsert(
        merged.map(({ quantity, ...product }) => ({
          user_id: userId,
          product_id: String(product.id),
          product_data: product,
          quantity,
        })),
        { onConflict: 'user_id,product_id' }
      );
    }

    localStorage.removeItem(STORAGE_KEY);
    setCartItems(merged);
    setIsLoadingCart(false);
  };

  const addToCart = async (product: Product, quantity = 1) => {
    const currentQty = cartItems.find(i => String(i.id) === String(product.id))?.quantity ?? 0;
    const newQty = currentQty + quantity;

    setCartItems(prev => {
      const exists = prev.find(i => String(i.id) === String(product.id));
      if (exists) return prev.map(i => String(i.id) === String(product.id) ? { ...i, quantity: newQty } : i);
      return [...prev, { ...product, quantity }];
    });

    toast.success('Ajouté au panier');

    if (user) {
      await supabase.from('cart_items').upsert({
        user_id: user.id,
        product_id: String(product.id),
        product_data: product,
        quantity: newQty,
      }, { onConflict: 'user_id,product_id' });
    }
  };

  const removeFromCart = async (productId: string | number) => {
    setCartItems(prev => prev.filter(i => String(i.id) !== String(productId)));
    toast.success('Retiré du panier');

    if (user) {
      await supabase.from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', String(productId));
    }
  };

  const updateQuantity = async (productId: string | number, quantity: number) => {
    if (quantity < 1) { removeFromCart(productId); return; }

    setCartItems(prev =>
      prev.map(i => String(i.id) === String(productId) ? { ...i, quantity } : i)
    );

    if (user) {
      await supabase.from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', String(productId));
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
    }
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity,
      clearCart, cartCount, cartTotal, isLoadingCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
