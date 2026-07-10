import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";

export interface AttributeFilters {
  material?: string | string[] | null;
  minScore?: number | null;
  application?: string | string[] | null;
  machineId?: string | null;
  categoryId?: string | null;
  minDiameter?: number | null;
  maxDiameter?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  limit?: number;
}

export interface AttributeMatch {
  id: string;
  slug: string;
  display_name: string;
  badge: string | null;
  gallery_bg: string | null;
  best_sku: {
    id: string;
    variant_label: string | null;
    diameter_mm: number | null;
    price_eur: number;
    campaign_price: number | null;
  };
  image_url: string | null;
}

/**
 * Finds products by attribute filters (material suitability, application tag,
 * machine compatibility, category, diameter/price range), returning the
 * best-priced active SKU per matching product. Shared by the public
 * `/api/v2/recommend` route and the `form_success` recommendation surface
 * (seeded from a form's collected material/application/machine answers).
 */
export async function findProductsByAttributes(filters: AttributeFilters): Promise<AttributeMatch[]> {
  const { material, application, machineId, categoryId, minDiameter, maxDiameter, minPrice, maxPrice } = filters;
  const minScore = filters.minScore ?? null;
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));

  const hasValue = (v: string | string[] | null | undefined) => (Array.isArray(v) ? v.length > 0 : Boolean(v));
  const hasFilter = hasValue(material) || hasValue(application) || machineId || categoryId || minDiameter != null || maxDiameter != null || minPrice != null || maxPrice != null;
  if (!hasFilter) return [];

  const { data: allProducts } = await supabaseAdminV2
    .from("products")
    .select("id, slug, display_name, badge, gallery_bg, default_image_url")
    .eq("is_active", true)
    .eq("has_public_page", true);

  if (!allProducts || allProducts.length === 0) return [];

  let productIds: Set<string> = new Set((allProducts as { id: string }[]).map((p) => p.id));

  if (material && (Array.isArray(material) ? material.length > 0 : true)) {
    const score = minScore ?? 1;
    let matQuery = supabaseAdminV2.from("product_materials").select("product_id").gte("score", score);
    matQuery = Array.isArray(material) ? matQuery.in("material_name", material) : matQuery.eq("material_name", material);
    const { data: matMatches } = await matQuery;
    const matchedIds = new Set(((matMatches ?? []) as { product_id: string }[]).map((r) => r.product_id));
    productIds = new Set([...productIds].filter((id) => matchedIds.has(id)));
  }

  if (application && (Array.isArray(application) ? application.length > 0 : true)) {
    let appQuery = supabaseAdminV2.from("product_applications").select("product_id");
    appQuery = Array.isArray(application) ? appQuery.in("tag", application) : appQuery.eq("tag", application);
    const { data: appMatches } = await appQuery;
    const matchedIds = new Set(((appMatches ?? []) as { product_id: string }[]).map((r) => r.product_id));
    productIds = new Set([...productIds].filter((id) => matchedIds.has(id)));
  }

  if (categoryId) {
    const { data: catMatches } = await supabaseAdminV2
      .from("product_categories")
      .select("product_id")
      .eq("category_id", categoryId);
    const matchedIds = new Set(((catMatches ?? []) as { product_id: string }[]).map((r) => r.product_id));
    productIds = new Set([...productIds].filter((id) => matchedIds.has(id)));
  }

  if (productIds.size === 0) return [];

  let skuQuery = supabaseAdminV2
    .from("skus")
    .select("id, product_id, variant_label, diameter_mm, price_eur, campaign_price")
    .in("product_id", [...productIds])
    .eq("is_active", true);

  if (minDiameter != null) skuQuery = skuQuery.gte("diameter_mm", minDiameter);
  if (maxDiameter != null) skuQuery = skuQuery.lte("diameter_mm", maxDiameter);
  if (minPrice != null) skuQuery = skuQuery.gte("price_eur", minPrice);
  if (maxPrice != null) skuQuery = skuQuery.lte("price_eur", maxPrice);

  const { data: skus } = await skuQuery;
  const skuList = (skus ?? []) as Array<{
    id: string; product_id: string; variant_label: string | null;
    diameter_mm: number | null; price_eur: number; campaign_price: number | null;
  }>;

  let filteredSkus = skuList;
  if (machineId) {
    const { data: machineSkus } = await supabaseAdminV2
      .from("sku_machines")
      .select("sku_id")
      .eq("machine_id", machineId);
    const machineSkuIds = new Set(((machineSkus ?? []) as { sku_id: string }[]).map((r) => r.sku_id));
    filteredSkus = skuList.filter((s) => machineSkuIds.has(s.id));
  }

  if (filteredSkus.length === 0) return [];

  const bestSkuByProduct = new Map<string, (typeof filteredSkus)[number]>();
  for (const sku of filteredSkus) {
    const eff = sku.campaign_price ?? sku.price_eur;
    const current = bestSkuByProduct.get(sku.product_id);
    const currentEff = current ? (current.campaign_price ?? current.price_eur) : Infinity;
    if (eff < currentEff) bestSkuByProduct.set(sku.product_id, sku);
  }

  const matchedProductIds = [...bestSkuByProduct.keys()].slice(0, limit);
  const bestSkuIds = matchedProductIds.map((pid) => bestSkuByProduct.get(pid)!.id);

  const { data: skuImages } = await supabaseAdminV2
    .from("sku_images")
    .select("sku_id, image_url, sort_order")
    .in("sku_id", bestSkuIds)
    .order("sort_order");

  const firstImageBySku: Record<string, string> = {};
  for (const img of (skuImages ?? []) as { sku_id: string; image_url: string }[]) {
    if (!firstImageBySku[img.sku_id]) firstImageBySku[img.sku_id] = img.image_url;
  }

  const productMap = new Map((allProducts as { id: string; slug: string; display_name: string; badge: string | null; gallery_bg: string | null; default_image_url: string | null }[]).map((p) => [p.id, p]));

  return matchedProductIds.map((pid) => {
    const product = productMap.get(pid)!;
    const bestSku = bestSkuByProduct.get(pid)!;
    const imageUrl = firstImageBySku[bestSku.id] ?? product.default_image_url;

    return {
      id: product.id,
      slug: product.slug,
      display_name: product.display_name,
      badge: product.badge,
      gallery_bg: product.gallery_bg,
      best_sku: {
        id: bestSku.id,
        variant_label: bestSku.variant_label,
        diameter_mm: bestSku.diameter_mm,
        price_eur: bestSku.price_eur,
        campaign_price: bestSku.campaign_price,
      },
      image_url: imageUrl,
    };
  });
}
