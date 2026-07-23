import { unstable_cache } from "next/cache";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";
import type { V2Category } from "@/lib/v2/types";
import type { EnrichedCard } from "@/lib/katalog/filter";

// One row per public+active SKU, pre-aggregated by the v2.catalog_sku_cards view.
// Each catalog card is a single SKU with its own slug, exact price, and exact
// diameter/shank — so clicking a card lands on exactly that variant's PDP, with
// no "ab …" price (the card is the variant, not the product). Facets (category /
// application / materials / search text) are inherited from the parent product.
type SkuCardRow = {
  id: string;
  slug: string;
  product_id: string;
  product_slug: string;
  series: string | null;
  series_title: string | null;
  name: string;
  variant_label: string | null;
  badge: string | null;
  image: string | null;
  gallery_bg: string;
  price: number | null;
  original_price: number | null;
  campaign_price: number | null;
  diameter_mm: number | null;
  shank_mm: number | null;
  sku_sort_order: number;
  product_sort_order: number;
  category_ids: string[];
  application_tags: string[];
  materials: { material_name: string; score: number }[];
  search_text: string;
  has_staffelpreis: boolean;
};

export interface CatalogData {
  cards: EnrichedCard[];
  categories: V2Category[];
  allApplicationTags: string[];
}

// Fetch every SKU card, paging past PostgREST's 1000-row response cap (which
// ignores a larger .limit()). A deterministic order makes the ranges stable.
async function fetchAllSkuCards(): Promise<SkuCardRow[]> {
  const CHUNK = 1000;
  const all: SkuCardRow[] = [];
  for (let from = 0; ; from += CHUNK) {
    const { data, error } = await supabaseAdminV2
      .from("catalog_sku_cards")
      .select("*")
      .order("product_sort_order")
      .order("product_slug")
      .order("sku_sort_order")
      .order("id")
      .range(from, from + CHUNK - 1);
    if (error) throw new Error(`catalog_sku_cards query failed: ${error.message}`);
    const rows = (data ?? []) as SkuCardRow[];
    all.push(...rows);
    if (rows.length < CHUNK) break;
  }
  return all;
}

// Cached raw fetch — shared by /katalog and /sortiment so both render from the
// exact same product/category data. Refreshed daily and on-demand from the
// admin product/SKU save actions via revalidateTag("catalog"). The on-demand
// purge keeps content fresh; the long timer is a fallback to minimize ISR writes.
const fetchCatalog = unstable_cache(
  async () => {
    const [cardRows, catsRes] = await Promise.all([
      fetchAllSkuCards(),
      supabaseAdminV2
        .from("categories")
        .select(
          "id, name, slug, parent_id, sort_order, seo_title, seo_description, category_intro, show_on_home, home_sort_order",
        )
        .order("sort_order")
        .order("id"),
    ]);
    // Throw on a real query error so the catalog never silently caches an empty
    // result (e.g. a missing grant on the view). ISR keeps serving the last good
    // render while a failed revalidation retries.
    if (catsRes.error) throw new Error(`categories query failed: ${catsRes.error.message}`);
    return {
      cardRows,
      categories: (catsRes.data ?? []) as V2Category[],
    };
  },
  ["catalog-sku-cards-v3"],
  { tags: ["catalog"], revalidate: 86400 },
);

/** Enriched catalog cards + category tree + application-tag facet, for client filtering. */
export async function getCatalogData(): Promise<CatalogData> {
  const { cardRows, categories } = await fetchCatalog();

  // Products in the Wendemesser category use tightly-cropped (background-removed)
  // images that would otherwise render edge-to-edge; flag them so the card insets
  // the image for a consistent scale. Resolved by slug at query time (no hardcoded id).
  const wendemesserCatId = categories.find((c) => c.slug === "wendemesser")?.id;

  const cards: EnrichedCard[] = cardRows.map((r) => {
    // A campaign card shows the campaign price with the original struck through.
    const hasCampaign =
      r.campaign_price != null && r.original_price != null && r.campaign_price < r.original_price;
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      badge: r.badge ?? undefined,
      image: r.image ?? undefined,
      galleryBg: r.gallery_bg ?? "#e6eff5",
      // Each card is a single SKU — never "ab …".
      hasVariants: false,
      // r.price is COALESCE(campaign_price, price_eur): the effective list price.
      fromCampaignPrice: r.price ?? undefined,
      fromOriginalPrice: hasCampaign ? r.original_price ?? undefined : undefined,
      variantLabel: r.variant_label ?? undefined,
      hrefPrefix: "/katalog",
      categoryIds: r.category_ids ?? [],
      applicationTags: r.application_tags ?? [],
      materials: r.materials ?? [],
      // Exact per-SKU dimensions — the range filters/sliders collapse to a point.
      minDiam: r.diameter_mm,
      maxDiam: r.diameter_mm,
      minShank: r.shank_mm,
      maxShank: r.shank_mm,
      searchText: r.search_text ?? "",
      hasStaffelpreis: r.has_staffelpreis ?? false,
      paddedImage: wendemesserCatId ? (r.category_ids ?? []).includes(wendemesserCatId) : false,
    };
  });

  const tagSet = new Set<string>();
  for (const card of cards) for (const t of card.applicationTags) tagSet.add(t);
  const allApplicationTags = [...tagSet].sort((a, b) => a.localeCompare(b, "de"));

  return { cards, categories, allApplicationTags };
}
