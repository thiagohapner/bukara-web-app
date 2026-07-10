import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";
import type { ProductCardData } from "@/components/ProductCard";
import type { AccessoryItem } from "@/components/ProductAccessories";

type SkuCardRow = {
  slug: string;
  product_id: string;
  name: string;
  variant_label: string | null;
  badge: string | null;
  image: string | null;
  gallery_bg: string;
  price: number | null;
  original_price: number | null;
  campaign_price: number | null;
  has_staffelpreis: boolean;
};

/**
 * Hydrates a ranked list of product ids into carousel-ready cards, picking the
 * best-priced active SKU per product from `v2.catalog_sku_cards`. Preserves the
 * caller's ranking order (recommendation rank), not the DB's natural order.
 */
export async function hydrateProductCards(productIds: string[], limit?: number): Promise<ProductCardData[]> {
  if (productIds.length === 0) return [];

  const { data } = await supabaseAdminV2
    .from("catalog_sku_cards")
    .select("slug, product_id, name, variant_label, badge, image, gallery_bg, price, original_price, campaign_price, has_staffelpreis")
    .in("product_id", productIds);

  const rows = (data ?? []) as SkuCardRow[];
  const bestByProduct = new Map<string, SkuCardRow>();
  for (const row of rows) {
    const eff = row.campaign_price ?? row.price ?? Infinity;
    const current = bestByProduct.get(row.product_id);
    const currentEff = current ? (current.campaign_price ?? current.price ?? Infinity) : Infinity;
    if (eff < currentEff) bestByProduct.set(row.product_id, row);
  }

  const ordered = productIds
    .map((pid) => bestByProduct.get(pid))
    .filter((r): r is SkuCardRow => Boolean(r));

  const sliced = limit != null ? ordered.slice(0, limit) : ordered;

  return sliced.map((r) => {
    const hasCampaign = r.campaign_price != null && r.original_price != null && r.campaign_price < r.original_price;
    return {
      slug: r.slug,
      name: r.name,
      badge: r.badge ?? undefined,
      image: r.image ?? undefined,
      galleryBg: r.gallery_bg ?? "#e6eff5",
      hasVariants: false,
      fromCampaignPrice: r.price ?? undefined,
      fromOriginalPrice: hasCampaign ? r.original_price ?? undefined : undefined,
      variantLabel: r.variant_label ?? undefined,
      hasStaffelpreis: r.has_staffelpreis ?? false,
      hrefPrefix: "/katalog",
    };
  });
}

type AccProduct = { id: string; slug: string; display_name: string | null; base_name: string | null; default_image_url: string | null };
type AccSku = { id: string; product_id: string | null; variant_label: string | null; price_eur: number; campaign_price: number | null };
type AccImage = { sku_id: string; image_url: string; sort_order: number };

/**
 * Hydrates a ranked list of product ids into the `AccessoryItem[]` shape used
 * by `ProductAccessories` — for rule-generated complements and cart cross-sell,
 * mirroring the hydration already done for curated accessories in
 * `app/(public)/katalog/[slug]/page.tsx`.
 */
export async function hydrateAccessoryItems(productIds: string[], limit?: number): Promise<AccessoryItem[]> {
  if (productIds.length === 0) return [];

  const [{ data: products }, { data: skus }, { data: images }] = await Promise.all([
    supabaseAdminV2
      .from("products")
      .select("id, slug, display_name, base_name, default_image_url")
      .in("id", productIds),
    supabaseAdminV2
      .from("skus")
      .select("id, product_id, variant_label, price_eur, campaign_price")
      .in("product_id", productIds)
      .eq("is_active", true)
      .order("sort_order"),
    supabaseAdminV2
      .from("sku_images")
      .select("sku_id, image_url, sort_order")
      .order("sort_order"),
  ]);

  const productMap = Object.fromEntries(((products ?? []) as AccProduct[]).map((p) => [p.id, p]));

  const skusByProduct: Record<string, AccSku[]> = {};
  for (const s of (skus ?? []) as AccSku[]) {
    if (!s.product_id) continue;
    if (!skusByProduct[s.product_id]) skusByProduct[s.product_id] = [];
    skusByProduct[s.product_id].push(s);
  }

  const firstImageBySku: Record<string, string> = {};
  for (const img of (images ?? []) as AccImage[]) {
    if (!firstImageBySku[img.sku_id]) firstImageBySku[img.sku_id] = img.image_url;
  }

  const items = productIds
    .map((pid, idx) => {
      const p = productMap[pid];
      if (!p) return null;
      const productSkus = skusByProduct[pid] ?? [];
      if (productSkus.length === 0) return null;
      const firstSkuId = productSkus[0]?.id;
      const image = (firstSkuId && firstImageBySku[firstSkuId]) || p.default_image_url || null;
      return {
        id: p.id,
        accessory_product_id: p.id,
        sort_order: idx,
        slug: p.slug,
        name: p.display_name ?? p.base_name ?? "",
        images: image ? [image] : [],
        skus: productSkus.map((s) => ({
          id: s.id,
          variant_label: s.variant_label,
          price_eur: s.price_eur,
          campaign_price: s.campaign_price,
        })),
      };
    })
    .filter((a): a is AccessoryItem => a !== null);

  return limit != null ? items.slice(0, limit) : items;
}
