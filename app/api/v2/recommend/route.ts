import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const material = searchParams.get("material");
  const minScore = searchParams.get("minScore") ? Number(searchParams.get("minScore")) : null;
  const application = searchParams.get("application");
  const machineId = searchParams.get("machineId");
  const categoryId = searchParams.get("categoryId");
  const minDiameter = searchParams.get("minDiameter") ? Number(searchParams.get("minDiameter")) : null;
  const maxDiameter = searchParams.get("maxDiameter") ? Number(searchParams.get("maxDiameter")) : null;
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  const hasFilter = material || application || machineId || categoryId || minDiameter != null || maxDiameter != null || minPrice != null || maxPrice != null;
  if (!hasFilter) {
    return NextResponse.json(
      { error: "At least one filter parameter is required (material, application, machineId, categoryId, minDiameter, maxDiameter, minPrice, maxPrice)" },
      { status: 400 }
    );
  }

  // 1. Fetch all active products with public pages
  const { data: allProducts } = await supabaseAdminV2
    .from("products")
    .select("id, slug, display_name, badge, gallery_bg, default_image_url")
    .eq("is_active", true)
    .eq("has_public_page", true);

  if (!allProducts || allProducts.length === 0) {
    return NextResponse.json({ products: [] });
  }

  let productIds: Set<string> = new Set((allProducts as { id: string }[]).map((p) => p.id));

  // 2. Filter by material + minScore (family-level)
  if (material) {
    const score = minScore ?? 1;
    const { data: matMatches } = await supabaseAdminV2
      .from("product_materials")
      .select("product_id")
      .eq("material_name", material)
      .gte("score", score);
    const matchedIds = new Set(((matMatches ?? []) as { product_id: string }[]).map((r) => r.product_id));
    productIds = new Set([...productIds].filter((id) => matchedIds.has(id)));
  }

  // 3. Filter by application tag (family-level)
  if (application) {
    const { data: appMatches } = await supabaseAdminV2
      .from("product_applications")
      .select("product_id")
      .eq("tag", application);
    const matchedIds = new Set(((appMatches ?? []) as { product_id: string }[]).map((r) => r.product_id));
    productIds = new Set([...productIds].filter((id) => matchedIds.has(id)));
  }

  // 4. Filter by category (family-level)
  if (categoryId) {
    const { data: catMatches } = await supabaseAdminV2
      .from("product_categories")
      .select("product_id")
      .eq("category_id", categoryId);
    const matchedIds = new Set(((catMatches ?? []) as { product_id: string }[]).map((r) => r.product_id));
    productIds = new Set([...productIds].filter((id) => matchedIds.has(id)));
  }

  if (productIds.size === 0) {
    return NextResponse.json({ products: [] });
  }

  // 5. Fetch SKUs for matching products + apply SKU-level filters
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

  // 6. Filter by machine (SKU-level)
  let filteredSkus = skuList;
  if (machineId) {
    const { data: machineSkus } = await supabaseAdminV2
      .from("sku_machines")
      .select("sku_id")
      .eq("machine_id", machineId);
    const machineSkuIds = new Set(((machineSkus ?? []) as { sku_id: string }[]).map((r) => r.sku_id));
    filteredSkus = skuList.filter((s) => machineSkuIds.has(s.id));
  }

  if (filteredSkus.length === 0) {
    return NextResponse.json({ products: [] });
  }

  // 7. Best SKU per product (lowest effective price)
  const bestSkuByProduct = new Map<string, typeof filteredSkus[number]>();
  for (const sku of filteredSkus) {
    const eff = sku.campaign_price ?? sku.price_eur;
    const current = bestSkuByProduct.get(sku.product_id);
    const currentEff = current ? (current.campaign_price ?? current.price_eur) : Infinity;
    if (eff < currentEff) bestSkuByProduct.set(sku.product_id, sku);
  }

  const matchedProductIds = [...bestSkuByProduct.keys()].slice(0, limit);
  const bestSkuIds = matchedProductIds.map((pid) => bestSkuByProduct.get(pid)!.id);

  // 8. Fetch first image per best SKU
  const { data: skuImages } = await supabaseAdminV2
    .from("sku_images")
    .select("sku_id, image_url, sort_order")
    .in("sku_id", bestSkuIds)
    .order("sort_order");

  const firstImageBySku: Record<string, string> = {};
  for (const img of (skuImages ?? []) as { sku_id: string; image_url: string }[]) {
    if (!firstImageBySku[img.sku_id]) firstImageBySku[img.sku_id] = img.image_url;
  }

  // 9. Compose response
  const productMap = new Map((allProducts as { id: string; slug: string; display_name: string; badge: string | null; gallery_bg: string | null; default_image_url: string | null }[]).map((p) => [p.id, p]));

  const result = matchedProductIds.map((pid) => {
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

  return NextResponse.json({ products: result });
}
