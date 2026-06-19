import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Footer from "@/components/Footer";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";
import KatalogProductContent from "./KatalogProductContent";
import type { V2Product, V2Sku, V2SkuImage, V2SkuSpec, V2ProductMaterial, V2ProductApplication, V2GroupVariant } from "@/lib/v2/types";
import type { AccessoryItem } from "@/components/ProductAccessories";

export const dynamic = "force-dynamic";

// Each catalog card links to a SKU slug. The canonical for the page is that very
// slug, so every variant has its own indexable URL.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data: skuCard } = await supabaseAdminV2
    .from("catalog_sku_cards")
    .select("slug, name, variant_label")
    .eq("slug", slug)
    .maybeSingle();

  if (!skuCard) return {};

  const title = [skuCard.name, skuCard.variant_label].filter(Boolean).join(" – ");
  return {
    title: `${title} | Bukara GmbH`,
    alternates: { canonical: `/katalog/${skuCard.slug}` },
  };
}

/**
 * Resolve a /katalog/[slug] request:
 *  - SKU slug → the parent product + that SKU preselected (the canonical link).
 *  - Legacy product slug → 308 to the representative SKU slug (one per product),
 *    honouring a legacy ?sku= deep link when it still resolves.
 *  - Otherwise notFound().
 */
async function resolveKatalogTarget(
  slug: string,
  requestedSkuId: string | undefined,
): Promise<{ product: V2Product; initialSkuId?: string }> {
  const { data: skuRow } = await supabaseAdminV2
    .from("skus")
    .select("id, product_id")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (skuRow) {
    const { data: p } = await supabaseAdminV2
      .from("products")
      .select("*")
      .eq("id", skuRow.product_id)
      .eq("has_public_page", true)
      .maybeSingle();
    if (p) return { product: p as V2Product, initialSkuId: skuRow.id };
    notFound();
  }

  const { data: prod } = await supabaseAdminV2
    .from("products")
    .select("id")
    .eq("slug", slug)
    .eq("has_public_page", true)
    .maybeSingle();

  if (prod) {
    let targetSlug: string | null = null;
    if (requestedSkuId) {
      const { data: s } = await supabaseAdminV2
        .from("skus")
        .select("slug")
        .eq("product_id", prod.id)
        .eq("id", requestedSkuId)
        .eq("is_active", true)
        .not("slug", "is", null)
        .maybeSingle();
      targetSlug = s?.slug ?? null;
    }
    if (!targetSlug) {
      const { data: s } = await supabaseAdminV2
        .from("skus")
        .select("slug")
        .eq("product_id", prod.id)
        .eq("is_active", true)
        .not("slug", "is", null)
        .order("sort_order")
        .limit(1)
        .maybeSingle();
      targetSlug = s?.slug ?? null;
    }
    if (targetSlug) permanentRedirect(`/katalog/${targetSlug}`);
  }

  notFound();
}

export default async function KatalogDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sku?: string }>;
}) {
  const { slug } = await params;
  const { sku: requestedSkuId } = await searchParams;

  // Resolve the URL slug to a product + the SKU it points at, or 308-redirect a
  // legacy product-slug URL to its representative SKU (see resolveKatalogTarget).
  const { product, initialSkuId: resolvedSkuId } = await resolveKatalogTarget(slug, requestedSkuId);
  let initialSkuId = resolvedSkuId;

  const { data: skuData } = await supabaseAdminV2
    .from("skus")
    .select("*")
    .eq("product_id", product.id)
    .eq("is_active", true)
    .order("sort_order");

  const skuList = (skuData ?? []) as V2Sku[];
  const skuIds = skuList.map((s) => s.id);

  // Variant group: every active SKU across all public products sharing this
  // product's `series` (the authoritative grouping key). The picker lists the
  // whole group, even though the current product's images/specs/etc. below stay
  // scoped to this product only.
  let groupVariants: V2GroupVariant[] = [];
  if (product.series) {
    const { data: seriesProducts } = await supabaseAdminV2
      .from("products")
      .select("id, slug")
      .eq("series", product.series)
      .eq("has_public_page", true)
      .eq("is_active", true);

    const slugByProductId: Record<string, string> = {};
    for (const p of (seriesProducts ?? []) as Array<{ id: string; slug: string }>) {
      slugByProductId[p.id] = p.slug;
    }
    const seriesProductIds = Object.keys(slugByProductId);

    if (seriesProductIds.length > 0) {
      const { data: groupSkuData } = await supabaseAdminV2
        .from("skus")
        .select(
          "id, product_id, diameter_mm, variant_label, coating_or_type, spin_direction, price_eur, campaign_price, merchant_sku, identnummer, sort_order",
        )
        .in("product_id", seriesProductIds)
        .eq("is_active", true)
        .order("sort_order");

      type GroupSkuRow = {
        id: string;
        product_id: string;
        diameter_mm: number | null;
        variant_label: string | null;
        coating_or_type: string | null;
        spin_direction: "rechts" | "links" | null;
        price_eur: number;
        campaign_price: number | null;
        merchant_sku: string | null;
        identnummer: string;
        sort_order: number;
      };

      groupVariants = ((groupSkuData ?? []) as GroupSkuRow[])
        .filter((s) => slugByProductId[s.product_id] !== undefined)
        .map((s) => ({
          skuId: s.id,
          productSlug: slugByProductId[s.product_id],
          isCurrentProduct: s.product_id === product.id,
          diameter_mm: s.diameter_mm,
          variant_label: s.variant_label,
          coating_or_type: s.coating_or_type,
          spin_direction: s.spin_direction,
          price_eur: s.price_eur,
          campaign_price: s.campaign_price,
          merchant_sku: s.merchant_sku,
          identnummer: s.identnummer,
          sort_order: s.sort_order,
        }));
    }
  }

  // Fallback when series is missing: build the group from this product's SKUs
  // only, so the picker behaves like the old single-product selector.
  if (groupVariants.length === 0) {
    groupVariants = skuList.map((s) => ({
      skuId: s.id,
      productSlug: product.slug,
      isCurrentProduct: true,
      diameter_mm: s.diameter_mm,
      variant_label: s.variant_label,
      coating_or_type: s.coating_or_type,
      spin_direction: s.spin_direction,
      price_eur: s.price_eur,
      campaign_price: s.campaign_price,
      merchant_sku: s.merchant_sku,
      identnummer: s.identnummer,
      sort_order: s.sort_order,
    }));
  }

  // `initialSkuId` (the SKU resolved from the URL slug) is validated against this
  // product's active SKUs; a stale id falls back to skus[0] inside the content.
  if (initialSkuId && !skuList.some((s) => s.id === initialSkuId)) {
    initialSkuId = undefined;
  }

  const [{ data: images }, { data: specs }, { data: mats }, { data: apps }, { data: accRows }] =
    await Promise.all([
      skuIds.length > 0
        ? supabaseAdminV2.from("sku_images").select("*").in("sku_id", skuIds).order("sort_order")
        : Promise.resolve({ data: [] }),
      skuIds.length > 0
        ? supabaseAdminV2.from("sku_specs").select("*").in("sku_id", skuIds).order("sort_order")
        : Promise.resolve({ data: [] }),
      supabaseAdminV2.from("product_materials").select("*").eq("product_id", product.id).order("sort_order"),
      supabaseAdminV2.from("product_applications").select("tag").eq("product_id", product.id),
      supabaseAdminV2
        .from("product_accessories")
        .select("id, accessory_product_id, sort_order")
        .eq("product_id", product.id)
        .order("sort_order"),
    ]);

  const accessoryRows = (accRows ?? []) as Array<{ id: string; accessory_product_id: string; sort_order: number }>;

  let accessories: AccessoryItem[] = [];
  if (accessoryRows.length > 0) {
    const accProductIds = accessoryRows.map((r) => r.accessory_product_id);

    const [{ data: accProducts }, { data: accSkus }, { data: accImages }] = await Promise.all([
      supabaseAdminV2
        .from("products")
        .select("id, slug, display_name, base_name, default_image_url")
        .in("id", accProductIds),
      supabaseAdminV2
        .from("skus")
        .select("id, product_id, variant_label, price_eur, campaign_price")
        .in("product_id", accProductIds)
        .eq("is_active", true)
        .order("sort_order"),
      supabaseAdminV2
        .from("sku_images")
        .select("sku_id, image_url, sort_order")
        .order("sort_order"),
    ]);

    type AccProduct = { id: string; slug: string; display_name: string | null; base_name: string | null; default_image_url: string | null };
    type AccSku = { id: string; product_id: string | null; variant_label: string | null; price_eur: number; campaign_price: number | null };
    type AccImage = { sku_id: string; image_url: string; sort_order: number };

    const accProductMap = Object.fromEntries(
      ((accProducts ?? []) as AccProduct[]).map((p) => [p.id, p])
    );

    const accSkusByProduct: Record<string, AccSku[]> = {};
    for (const s of (accSkus ?? []) as AccSku[]) {
      if (!s.product_id) continue;
      if (!accSkusByProduct[s.product_id]) accSkusByProduct[s.product_id] = [];
      accSkusByProduct[s.product_id].push(s);
    }

    const firstImageBySku: Record<string, string> = {};
    for (const img of (accImages ?? []) as AccImage[]) {
      if (!firstImageBySku[img.sku_id]) firstImageBySku[img.sku_id] = img.image_url;
    }

    accessories = accessoryRows
      .map((row) => {
        const acc = accProductMap[row.accessory_product_id];
        if (!acc) return null;
        const productSkus = accSkusByProduct[row.accessory_product_id] ?? [];
        const firstSkuId = productSkus[0]?.id;
        const image = (firstSkuId && firstImageBySku[firstSkuId]) || acc.default_image_url || null;
        return {
          id: row.id,
          accessory_product_id: row.accessory_product_id,
          sort_order: row.sort_order,
          slug: acc.slug,
          name: acc.display_name ?? acc.base_name ?? "",
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
  }

  return (
    <>
      <main className="min-h-screen bg-white">
        <KatalogProductContent
          product={product as V2Product}
          skus={skuList}
          skuImages={(images ?? []) as V2SkuImage[]}
          skuSpecs={(specs ?? []) as V2SkuSpec[]}
          materials={(mats ?? []) as V2ProductMaterial[]}
          applications={(apps ?? []) as V2ProductApplication[]}
          accessories={accessories}
          groupVariants={groupVariants}
          initialSkuId={initialSkuId}
        />
      </main>
      <Footer />
    </>
  );
}
