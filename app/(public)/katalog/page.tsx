import { Suspense } from "react";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";
import KatalogCatalog from "./KatalogCatalog";
import type { V2Category, V2ProductMaterial } from "@/lib/v2/types";
import type { EnrichedCard } from "./KatalogCatalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Produktkatalog | Bukara GmbH",
  description: "Zerspanungswerkzeuge – alle Produkte und Varianten.",
};

// Page through a query in 1000-row windows so we never hit PostgREST's default
// row cap (the catalog now has >1000 SKUs/images/materials).
async function fetchAll<T>(
  make: (from: number, to: number) => PromiseLike<{ data: unknown }>,
): Promise<T[]> {
  const out: T[] = [];
  const SIZE = 1000;
  for (let from = 0; ; from += SIZE) {
    const { data } = await make(from, from + SIZE - 1);
    const batch = ((data ?? []) as T[]);
    out.push(...batch);
    if (batch.length < SIZE) break;
  }
  return out;
}

export default async function KatalogPage() {
  const products = await fetchAll<{
    id: string; slug: string; base_name: string | null; display_name: string | null;
    badge: string | null; gallery_bg: string | null; default_image_url: string | null;
  }>((from, to) =>
    supabaseAdminV2
      .from("products")
      .select("id, slug, base_name, display_name, badge, gallery_bg, default_image_url")
      .eq("is_active", true)
      .eq("has_public_page", true)
      .order("sort_order")
      .order("id")
      .range(from, to),
  );

  if (!products || products.length === 0) {
    return (
      <Suspense>
        <KatalogCatalog initialCards={[]} allCategories={[]} allApplicationTags={[]} />
      </Suspense>
    );
  }

  const ids = (products as Array<{ id: string }>).map((p) => p.id);

  const [skuList, productCategories, productApplications, productMaterials, categories] =
    await Promise.all([
      fetchAll<{
        id: string; product_id: string; price_eur: number;
        campaign_price: number | null; diameter_mm: number | null; shank_mm: number | null; sort_order: number;
        merchant_sku: string | null; bukara_article_number: string | null;
      }>((from, to) =>
        supabaseAdminV2
          .from("skus")
          .select("id, product_id, price_eur, campaign_price, diameter_mm, shank_mm, sort_order, merchant_sku, bukara_article_number")
          .in("product_id", ids)
          .eq("is_active", true)
          .order("sort_order")
          .order("id")
          .range(from, to),
      ),
      fetchAll<{ product_id: string; category_id: string }>((from, to) =>
        supabaseAdminV2.from("product_categories").select("product_id, category_id")
          .in("product_id", ids).order("product_id").order("category_id").range(from, to),
      ),
      fetchAll<{ product_id: string; tag: string }>((from, to) =>
        supabaseAdminV2.from("product_applications").select("product_id, tag")
          .in("product_id", ids).order("product_id").order("tag").range(from, to),
      ),
      fetchAll<V2ProductMaterial>((from, to) =>
        supabaseAdminV2.from("product_materials").select("product_id, material_name, score")
          .in("product_id", ids).order("product_id").order("material_name").range(from, to),
      ),
      fetchAll<V2Category>((from, to) =>
        supabaseAdminV2.from("categories").select("id, name, slug, parent_id, sort_order")
          .order("sort_order").order("id").range(from, to),
      ),
    ]);

  const skuIds = skuList.map((s) => s.id);
  const skuImageList = skuIds.length > 0
    ? await fetchAll<{ sku_id: string; image_url: string; sort_order: number }>((from, to) =>
        supabaseAdminV2.from("sku_images").select("sku_id, image_url, sort_order")
          .in("sku_id", skuIds).order("sku_id").order("sort_order").order("id").range(from, to),
      )
    : [];

  const skuToProduct: Record<string, string> = {};
  for (const sku of skuList) {
    skuToProduct[sku.id] = sku.product_id;
  }

  // First image per product = the one with the lowest sort_order (order-independent,
  // since paginated fetches aren't globally ordered by sort_order).
  const firstImageByProduct: Record<string, string> = {};
  const firstImageSort: Record<string, number> = {};
  for (const img of skuImageList) {
    const productId = skuToProduct[img.sku_id];
    if (!productId) continue;
    if (firstImageByProduct[productId] === undefined || img.sort_order < firstImageSort[productId]) {
      firstImageByProduct[productId] = img.image_url;
      firstImageSort[productId] = img.sort_order;
    }
  }

  const priceMap: Record<string, { campaign: number; original: number }> = {};
  const diamRangeMap: Record<string, { min: number; max: number }> = {};
  const shankRangeMap: Record<string, { min: number; max: number }> = {};
  const merchantSkusMap: Record<string, string[]> = {};
  const bukaraSkusMap: Record<string, string[]> = {};
  for (const sku of skuList) {
    const pid = sku.product_id;
    const eff = sku.campaign_price ?? sku.price_eur;
    if (!priceMap[pid] || eff < priceMap[pid].campaign) {
      priceMap[pid] = { campaign: eff, original: sku.price_eur };
    }
    if (sku.diameter_mm !== null) {
      if (!diamRangeMap[pid]) {
        diamRangeMap[pid] = { min: sku.diameter_mm, max: sku.diameter_mm };
      } else {
        diamRangeMap[pid].min = Math.min(diamRangeMap[pid].min, sku.diameter_mm);
        diamRangeMap[pid].max = Math.max(diamRangeMap[pid].max, sku.diameter_mm);
      }
    }
    if (sku.shank_mm !== null) {
      if (!shankRangeMap[pid]) {
        shankRangeMap[pid] = { min: sku.shank_mm, max: sku.shank_mm };
      } else {
        shankRangeMap[pid].min = Math.min(shankRangeMap[pid].min, sku.shank_mm);
        shankRangeMap[pid].max = Math.max(shankRangeMap[pid].max, sku.shank_mm);
      }
    }
    if (sku.merchant_sku) {
      if (!merchantSkusMap[pid]) merchantSkusMap[pid] = [];
      if (!merchantSkusMap[pid].includes(sku.merchant_sku)) merchantSkusMap[pid].push(sku.merchant_sku);
    }
    if (sku.bukara_article_number) {
      if (!bukaraSkusMap[pid]) bukaraSkusMap[pid] = [];
      if (!bukaraSkusMap[pid].includes(sku.bukara_article_number)) bukaraSkusMap[pid].push(sku.bukara_article_number);
    }
  }

  const catMap: Record<string, string[]> = {};
  for (const pc of (productCategories ?? []) as Array<{ product_id: string; category_id: string }>) {
    if (!catMap[pc.product_id]) catMap[pc.product_id] = [];
    catMap[pc.product_id].push(pc.category_id);
  }

  const appMap: Record<string, string[]> = {};
  for (const pa of (productApplications ?? []) as Array<{ product_id: string; tag: string }>) {
    if (!appMap[pa.product_id]) appMap[pa.product_id] = [];
    appMap[pa.product_id].push(pa.tag);
  }

  const matMap: Record<string, V2ProductMaterial[]> = {};
  for (const pm of (productMaterials ?? []) as V2ProductMaterial[]) {
    if (!matMap[pm.product_id]) matMap[pm.product_id] = [];
    matMap[pm.product_id].push(pm);
  }

  const cards: EnrichedCard[] = (products as Array<{
    id: string; slug: string; base_name: string | null; display_name: string | null;
    badge: string | null; gallery_bg: string | null; default_image_url: string | null;
  }>).map((p) => {
    const image = firstImageByProduct[p.id] || p.default_image_url || undefined;
    const productCatIds = catMap[p.id] ?? [];

    return {
      id: p.id,
      slug: p.slug,
      name: p.display_name ?? p.base_name ?? "",
      badge: p.badge ?? undefined,
      image,
      galleryBg: p.gallery_bg ?? "#e6eff5",
      hasVariants: skuList.filter((s) => s.product_id === p.id).length > 1,
      fromCampaignPrice: priceMap[p.id]?.campaign,
      fromOriginalPrice: priceMap[p.id]?.original,
      hrefPrefix: "/katalog",
      categoryIds: productCatIds,
      applicationTags: appMap[p.id] ?? [],
      materials: (matMap[p.id] ?? []).map((m) => ({ material_name: m.material_name, score: m.score })),
      minDiam: diamRangeMap[p.id]?.min ?? null,
      maxDiam: diamRangeMap[p.id]?.max ?? null,
      minShank: shankRangeMap[p.id]?.min ?? null,
      maxShank: shankRangeMap[p.id]?.max ?? null,
      merchantSkus: merchantSkusMap[p.id] ?? [],
      bukaraSkus: bukaraSkusMap[p.id] ?? [],
    };
  });

  const tagSet = new Set<string>();
  for (const card of cards) for (const t of card.applicationTags) tagSet.add(t);
  const allApplicationTags = [...tagSet].sort((a, b) => a.localeCompare(b, "de"));

  return (
    <Suspense>
      <KatalogCatalog
        initialCards={cards}
        allCategories={(categories ?? []) as V2Category[]}
        allApplicationTags={allApplicationTags}
      />
    </Suspense>
  );
}
