"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getStoredCartId,
  clearStoredCartId,
  cartExists,
  getOrCreateCart,
  getCartItems,
  addToCart,
  addV2SkuToCart,
  addDealToCart,
  updateQuantityAndPrice,
  removeItem,
  type CartItem,
} from "@/lib/cart";

type CartContextValue = {
  cartId: string | null;
  items: CartItem[];
  cartCount: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (skuId: string, qty: number, unitPrice: number) => Promise<void>;
  addV2Item: (v2SkuId: string, qty: number, unitPrice: number) => Promise<void>;
  addDeal: (dealId: string, selectedSkuId: string | null, qty: number, unitPrice: number) => Promise<void>;
  updateItem: (itemId: string, qty: number) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  clearAll: (cartId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

async function fetchItems(id: string): Promise<CartItem[]> {
  try {
    return await getCartItems(id);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const stored = getStoredCartId();
    if (!stored) return;
    cartExists(stored).then((exists) => {
      if (!exists) { clearStoredCartId(); return; }
      setCartId(stored);
      fetchItems(stored).then(setItems);
    });
  }, []);

  const ensureCart = useCallback(async (): Promise<string> => {
    if (cartId) return cartId;
    const id = await getOrCreateCart();
    setCartId(id);
    return id;
  }, [cartId]);

  const addItem = useCallback(async (skuId: string, qty: number, unitPrice: number) => {
    const id = await ensureCart();
    await addToCart(id, skuId, qty, unitPrice);
    const updated = await fetchItems(id);
    setItems(updated);
  }, [ensureCart]);

  const addV2Item = useCallback(async (v2SkuId: string, qty: number, unitPrice: number) => {
    const id = await ensureCart();
    await addV2SkuToCart(id, v2SkuId, qty, unitPrice);
    setItems(await fetchItems(id));
  }, [ensureCart]);

  const addDeal = useCallback(async (dealId: string, selectedSkuId: string | null, qty: number, unitPrice: number) => {
    const id = await ensureCart();
    await addDealToCart(id, dealId, selectedSkuId, qty, unitPrice);
    const updated = await fetchItems(id);
    setItems(updated);
  }, [ensureCart]);

  const updateItem = useCallback(async (itemId: string, qty: number) => {
    if (!cartId) return;
    // Flat list price per unit — quantity changes do not retier the line price.
    await updateQuantityAndPrice(itemId, qty, undefined);
    setItems(await fetchItems(cartId));
  }, [cartId]);

  const removeCartItem = useCallback(async (itemId: string) => {
    if (!cartId) return;
    await removeItem(itemId);
    const updated = await fetchItems(cartId);
    setItems(updated);
  }, [cartId]);

  const clearAll = useCallback(async (_id: string) => {
    clearStoredCartId();
    setCartId(null);
    setItems([]);
  }, []);

  return (
    <CartContext.Provider value={{
      cartId,
      items,
      cartCount,
      isDrawerOpen,
      openDrawer: () => setIsDrawerOpen(true),
      closeDrawer: () => setIsDrawerOpen(false),
      addItem,
      addV2Item,
      addDeal,
      updateItem,
      removeCartItem,
      clearAll,
    }}>
      {children}
    </CartContext.Provider>
  );
}
