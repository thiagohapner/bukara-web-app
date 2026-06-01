import { supabase } from "./supabase";
import { supabaseV2 } from "./v2/supabase";

const CART_KEY = "bukara_cart_id";

export type CartItemSku = {
  artikel_nr: string;
  variant_label: string | null;
  price: number;
  campaign_price: number | null;
  stock_quantity: number;
  product: { name: string; slug: string } | null;
};

export type CartItemV2Sku = {
  identnummer: string;
  variant_label: string | null;
  price_eur: number;
  campaign_price: number | null;
  stock_quantity: number;
  has_staffelpreis: boolean;
  product: { base_name: string; display_name: string | null; slug: string } | null;
};

export type CartItemDeal = {
  slug: string;
  title: string;
  campaign_discount_percent: number;
};

export type CartItem = {
  id: string;
  cart_id: string;
  sku_id: string | null;
  v2_sku_id: string | null;
  deal_id: string | null;
  selected_sku_id: string | null;
  quantity: number;
  unit_price: number;
  discount_pct: number;
  added_at: string;
  sku: CartItemSku | null;
  v2Sku: CartItemV2Sku | null;
  deal: CartItemDeal | null;
  selected_sku: { artikel_nr: string; variant_label: string | null } | null;
};

export function getStoredCartId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CART_KEY);
}

export function clearStoredCartId(): void {
  if (typeof window !== "undefined") localStorage.removeItem(CART_KEY);
}

export async function getOrCreateCart(): Promise<string> {
  const stored = getStoredCartId();
  if (stored) return stored;
  const { data, error } = await supabase.from("carts").insert({}).select("id").single();
  if (error || !data) throw new Error("Failed to create cart");
  localStorage.setItem(CART_KEY, data.id);
  return data.id;
}

export async function getCartItems(cartId: string): Promise<CartItem[]> {
  const { data: rows, error } = await supabase
    .from("cart_items")
    .select(`
      *,
      sku:skus!cart_items_sku_id_fkey(artikel_nr, variant_label, price, campaign_price, stock_quantity, product:products(name, slug)),
      deal:offers(slug, title, campaign_discount_percent),
      selected_sku:skus!cart_items_selected_sku_id_fkey(artikel_nr, variant_label)
    `)
    .eq("cart_id", cartId)
    .order("added_at");
  if (error) throw error;

  const v2Ids = (rows ?? []).map((r) => r.v2_sku_id).filter(Boolean) as string[];
  let v2Map: Record<string, CartItemV2Sku> = {};
  if (v2Ids.length > 0) {
    const { data: v2Rows } = await supabaseV2
      .from("skus")
      .select("id, identnummer, variant_label, price_eur, campaign_price, stock_quantity, has_staffelpreis, product:products(base_name, display_name, slug)")
      .in("id", v2Ids);
    v2Map = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (v2Rows ?? []).map((s: any) => [
        s.id,
        {
          identnummer: s.identnummer,
          variant_label: s.variant_label,
          price_eur: s.price_eur,
          campaign_price: s.campaign_price,
          stock_quantity: s.stock_quantity,
          has_staffelpreis: s.has_staffelpreis ?? false,
          product: Array.isArray(s.product) ? (s.product[0] ?? null) : (s.product ?? null),
        } satisfies CartItemV2Sku,
      ])
    );
  }

  return (rows ?? []).map((r) => ({
    ...r,
    v2Sku: r.v2_sku_id ? (v2Map[r.v2_sku_id] ?? null) : null,
  })) as CartItem[];
}

export async function addToCart(
  cartId: string,
  skuId: string,
  quantity: number,
  unitPrice: number
): Promise<void> {
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("sku_id", skuId)
    .is("deal_id", null)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
  } else {
    await supabase.from("cart_items").insert({
      cart_id: cartId,
      sku_id: skuId,
      quantity,
      unit_price: unitPrice,
      discount_pct: 0,
    });
  }
  await supabase.from("carts").update({ updated_at: new Date().toISOString() }).eq("id", cartId);
}

export async function addV2SkuToCart(
  cartId: string,
  v2SkuId: string,
  quantity: number,
  unitPrice: number
): Promise<void> {
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("v2_sku_id", v2SkuId)
    .is("deal_id", null)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
  } else {
    await supabase.from("cart_items").insert({
      cart_id: cartId,
      v2_sku_id: v2SkuId,
      quantity,
      unit_price: unitPrice,
      discount_pct: 0,
    });
  }
  await supabase.from("carts").update({ updated_at: new Date().toISOString() }).eq("id", cartId);
}

export async function addDealToCart(
  cartId: string,
  dealId: string,
  selectedSkuId: string | null,
  quantity: number,
  unitPrice: number
): Promise<void> {
  let query = supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("deal_id", dealId);
  query = selectedSkuId ? query.eq("selected_sku_id", selectedSkuId) : query.is("selected_sku_id", null);
  const { data: existing } = await query.maybeSingle();

  if (existing) {
    await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
  } else {
    await supabase.from("cart_items").insert({
      cart_id: cartId,
      deal_id: dealId,
      selected_sku_id: selectedSkuId,
      quantity,
      unit_price: unitPrice,
      discount_pct: 0,
    });
  }
  await supabase.from("carts").update({ updated_at: new Date().toISOString() }).eq("id", cartId);
}

export async function updateQuantity(itemId: string, quantity: number): Promise<void> {
  await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
}

export async function updateQuantityAndPrice(
  itemId: string,
  quantity: number,
  unitPrice?: number
): Promise<void> {
  const patch: { quantity: number; unit_price?: number } = { quantity };
  if (unitPrice !== undefined) patch.unit_price = unitPrice;
  await supabase.from("cart_items").update(patch).eq("id", itemId);
}

export async function removeItem(itemId: string): Promise<void> {
  await supabase.from("cart_items").delete().eq("id", itemId);
}

export async function clearCart(cartId: string): Promise<void> {
  await supabase.from("cart_items").delete().eq("cart_id", cartId);
  await supabase.from("carts").delete().eq("id", cartId);
  clearStoredCartId();
}
