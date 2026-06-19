import { unstable_cache } from "next/cache";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";
import type { V2Category } from "@/lib/v2/types";
import type { EnrichedCard } from "@/lib/katalog/filter";

// One row per public+active product, pre-aggregated by the v2.catalog_cards view
// (price/diam/shank ranges, facets, search text) — replaces ~10 round-trips.
type CatalogCardRow = {
  id: string;
  slug: string;
  name: string;
  badge: string | null;
  image: string | null;
  gallery_bg: string;
  has_variants: boolean;
  from_campaign_price: number | null;
  from_original_price: number | null;
  min_diam: number | null;
  max_diam: number | null;
  min_shank: number | null;
  max_shank: number | null;
  category_ids: string[];
  application_tags: string[];
  materials: { material_name: string; score: number }[];
  search_text: string;
};

export interface CatalogData {
  cards: EnrichedCard[];
  categories: V2Category[];
  allApplicationTags: string[];
}

// Cached raw fetch — shared by /katalog and /sortiment so both render from the
// exact same product/category data. Refreshed every 5 min and on-demand from the
// admin product/SKU save actions via revalidateTag("catalog").
const fetchCatalog = unstable_cache(
  async () => {
    const [cardsRes, catsRes] = await Promise.all([
      supabaseAdminV2.from("catalog_cards").select("*").limit(2000),
      supabaseAdminV2
        .from("categories")
        .select(
          "id, name, slug, parent_id, sort_order, seo_title, seo_description, show_on_home, home_sort_order",
        )
        .order("sort_order")
        .order("id"),
    ]);
    // Throw on a real query error so the catalog never silently caches an empty
    // result (e.g. a missing grant on the view). ISR keeps serving the last good
    // render while a failed revalidation retries.
    if (cardsRes.error) throw new Error(`catalog_cards query failed: ${cardsRes.error.message}`);
    if (catsRes.error) throw new Error(`categories query failed: ${catsRes.error.message}`);
    return {
      cardRows: (cardsRes.data ?? []) as CatalogCardRow[],
      categories: (catsRes.data ?? []) as V2Category[],
    };
  },
  ["catalog-cards-v1"],
  { tags: ["catalog"], revalidate: 300 },
);

/** Enriched catalog cards + category tree + application-tag facet, for client filtering. */
export async function getCatalogData(): Promise<CatalogData> {
  const { cardRows, categories } = await fetchCatalog();

  const cards: EnrichedCard[] = cardRows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    badge: r.badge ?? undefined,
    image: r.image ?? undefined,
    galleryBg: r.gallery_bg ?? "#e6eff5",
    hasVariants: r.has_variants,
    fromCampaignPrice: r.from_campaign_price ?? undefined,
    fromOriginalPrice: r.from_original_price ?? undefined,
    hrefPrefix: "/katalog",
    categoryIds: r.category_ids ?? [],
    applicationTags: r.application_tags ?? [],
    materials: r.materials ?? [],
    minDiam: r.min_diam,
    maxDiam: r.max_diam,
    minShank: r.min_shank,
    maxShank: r.max_shank,
    searchText: r.search_text ?? "",
  }));

  const tagSet = new Set<string>();
  for (const card of cards) for (const t of card.applicationTags) tagSet.add(t);
  const allApplicationTags = [...tagSet].sort((a, b) => a.localeCompare(b, "de"));

  return { cards, categories, allApplicationTags };
}
