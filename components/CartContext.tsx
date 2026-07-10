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
import { unitPriceForQuantity } from "@/lib/pricing";
import { useTrackEvent } from "@/lib/events/useTrackEvent";

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

function reprice(item: CartItem, qty: number): number | undefined {
  const basePrice = item.sku?.price ?? item.v2Sku?.price_eur;
  const hasStaffel = item.v2Sku?.has_staffelpreis ?? false;
  if (hasStaffel && basePrice != null) {
    return unitPriceForQuantity(basePrice, true, qty);
  }
  return undefined;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const { trackEvent } = useTrackEvent();

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
    const updated = await fetchItems(id);
    const addedProductId = updated.find((i) => i.v2_sku_id === v2SkuId)?.v2Sku?.product?.id;
    if (addedProductId) trackEvent("add_to_cart", addedProductId, { skuId: v2SkuId });
    // Fix unit_price for the merged line if tier changed
    const merged = updated.find(i => i.v2_sku_id === v2SkuId && i.v2Sku?.has_staffelpreis);
    if (merged) {
      const tiered = unitPriceForQuantity(merged.v2Sku!.price_eur, true, merged.quantity);
      if (Math.abs(tiered - merged.unit_price) > 0.001) {
        await updateQuantityAndPrice(merged.id, merged.quantity, tiered);
        const final = await fetchItems(id);
        setItems(final);
        return;
      }
    }
    setItems(updated);
  }, [ensureCart]);

  const addDeal = useCallback(async (dealId: string, selectedSkuId: string | null, qty: number, unitPrice: number) => {
    const id = await ensureCart();
    await addDealToCart(id, dealId, selectedSkuId, qty, unitPrice);
    const updated = await fetchItems(id);
    setItems(updated);
  }, [ensureCart]);

  const updateItem = useCallback(async (itemId: string, qty: number) => {
    if (!cartId) return;
    const item = items.find(i => i.id === itemId);
    const unitPrice = item ? reprice(item, qty) : undefined;
    await updateQuantityAndPrice(itemId, qty, unitPrice);
    setItems(await fetchItems(cartId));
  }, [cartId, items]);

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
