import { getCatalogData } from "@/lib/katalog/data";
import type { V2Category } from "@/lib/v2/types";
import type { EnrichedCard } from "@/lib/katalog/filter";
import { filterCards } from "@/lib/katalog/filter";

export type SortimentCategory = V2Category & { exampleImage: string | null };

/**
 * Categories surfaced as /sortiment landing pages + home tiles
 * (v2.categories.show_on_home = true), ordered by home_sort_order.
 * Each category also carries the first available product image for display in the tile.
 */
export async function getSortimentCategories(): Promise<SortimentCategory[]> {
  const { categories, cards } = await getCatalogData();
  return categories
    .filter((c) => c.show_on_home)
    .sort((a, b) => (a.home_sort_order ?? 0) - (b.home_sort_order ?? 0))
    .map((c) => {
      const card = cards.find((card) => card.categoryIds.includes(c.id));
      return { ...c, exampleImage: card?.image ?? null };
    });
}

export interface SortimentPageData {
  category: V2Category;
  /** All cards + category tree + facet, for the reused client catalog. */
  initialCards: EnrichedCard[];
  allCategories: V2Category[];
  allApplicationTags: string[];
  /** Products in this category only — for server-rendered JSON-LD / counts. */
  categoryCards: EnrichedCard[];
}

/**
 * Resolve a sub-catalog page by slug. Only approved (show_on_home) categories are
 * served; anything else returns null so the route can 404. Uses the SAME
 * category-filtering logic as /katalog (lib/katalog/filter).
 */
export async function getSortimentPageData(slug: string): Promise<SortimentPageData | null> {
  const { cards, categories, allApplicationTags } = await getCatalogData();

  const category = categories.find((c) => c.slug === slug && c.show_on_home);
  if (!category) return null;

  // All 5 approved categories are sub-categories → apply via the `sub` dimension.
  const categoryCards = filterCards(
    cards,
    {
      kategorie: "",
      sub: slug,
      materials: [],
      anwendungen: [],
      minScore: 1,
      search: "",
      priceMin: null,
      priceMax: null,
      diamMin: null,
      diamMax: null,
      shankMin: null,
      shankMax: null,
      sort: "",
    },
    categories,
  );

  return {
    category,
    initialCards: cards,
    allCategories: categories,
    allApplicationTags,
    categoryCards,
  };
}
