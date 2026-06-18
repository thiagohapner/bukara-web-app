import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";
import KatalogCatalog from "./KatalogCatalog";
import type { V2Category } from "@/lib/v2/types";
import type { EnrichedCard } from "./KatalogCatalog";

// Cached static render, refreshed every 5 min and on-demand from the admin
// product/SKU save actions via revalidateTag("catalog").
export const revalidate = 300;

export const metadata = {
  title: "Produktkatalog | Bukara GmbH",
  description: "Zerspanungswerkzeuge – alle Produkte und Varianten.",
};

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

const getCatalogData = unstable_cache(
  async () => {
    const [cardsRes, catsRes] = await Promise.all([
      supabaseAdminV2.from("catalog_cards").select("*").limit(2000),
      supabaseAdminV2
        .from("categories")
        .select("id, name, slug, parent_id, sort_order")
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

export default async function KatalogPage() {
  const { cardRows, categories } = await getCatalogData();

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

  return (
    <Suspense>
      <KatalogCatalog
        initialCards={cards}
        allCategories={categories}
        allApplicationTags={allApplicationTags}
      />
    </Suspense>
  );
}
