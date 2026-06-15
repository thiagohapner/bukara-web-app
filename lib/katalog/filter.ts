import type { ProductCardData } from "@/components/ProductCard";
import type { V2Category } from "@/lib/v2/types";

/** A catalog product card enriched with the facets used for client-side filtering. */
export type EnrichedCard = ProductCardData & {
  id: string;
  categoryIds: string[];
  applicationTags: string[];
  materials: { material_name: string; score: number }[];
  minDiam: number | null;
  maxDiam: number | null;
  minShank: number | null;
  maxShank: number | null;
  merchantSkus: string[];
  bukaraSkus: string[];
};

/** All applied filter values (presentation `view`/`sort` excluded from filtering except sort). */
export interface KatalogFilterState {
  kategorie: string;
  sub: string;
  materials: string[];
  anwendungen: string[];
  minScore: number;
  search: string;
  priceMin: number | null;
  priceMax: number | null;
  diamMin: number | null;
  diamMax: number | null;
  shankMin: number | null;
  shankMax: number | null;
  sort: string;
}

/** Reduce to the products matching a category selection (sub takes precedence over parent). */
function applyCategory(
  cards: EnrichedCard[],
  kategorie: string,
  sub: string,
  allCategories: V2Category[],
): EnrichedCard[] {
  if (sub) {
    const subCat = allCategories.find((c) => c.slug === sub);
    return subCat ? cards.filter((c) => c.categoryIds.includes(subCat.id)) : cards;
  }
  if (kategorie) {
    const parent = allCategories.find((c) => c.slug === kategorie && c.parent_id === null);
    if (!parent) return cards;
    const childIds = allCategories.filter((c) => c.parent_id === parent.id).map((c) => c.id);
    return childIds.length > 0
      ? cards.filter((c) => c.categoryIds.some((id) => childIds.includes(id)))
      : cards.filter((c) => c.categoryIds.includes(parent.id));
  }
  return cards;
}

/** Pure client-side filter + sort. Identical semantics to the former sidebar logic. */
export function filterCards(
  cards: EnrichedCard[],
  state: KatalogFilterState,
  allCategories: V2Category[],
): EnrichedCard[] {
  let result = applyCategory([...cards], state.kategorie, state.sub, allCategories);

  if (state.anwendungen.length > 0) {
    result = result.filter((c) => state.anwendungen.some((tag) => c.applicationTags.includes(tag)));
  }

  if (state.materials.length > 0) {
    result = result.filter((c) =>
      state.materials.some((m) =>
        c.materials.some((pm) => pm.material_name === m && pm.score >= state.minScore),
      ),
    );
  }

  if (state.search) {
    const q = state.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.merchantSkus.some((s) => s.toLowerCase().includes(q)) ||
        c.bukaraSkus.some((s) => s.toLowerCase().includes(q)),
    );
  }

  if (state.priceMin !== null) result = result.filter((c) => (c.fromCampaignPrice ?? 0) >= state.priceMin!);
  if (state.priceMax !== null) result = result.filter((c) => (c.fromCampaignPrice ?? 0) <= state.priceMax!);

  if (state.diamMin !== null) result = result.filter((c) => c.maxDiam !== null && c.maxDiam >= state.diamMin!);
  if (state.diamMax !== null) result = result.filter((c) => c.minDiam !== null && c.minDiam <= state.diamMax!);

  if (state.shankMin !== null) result = result.filter((c) => c.maxShank !== null && c.maxShank >= state.shankMin!);
  if (state.shankMax !== null) result = result.filter((c) => c.minShank !== null && c.minShank <= state.shankMax!);

  if (state.sort === "preis-asc") result.sort((a, b) => (a.fromCampaignPrice ?? 0) - (b.fromCampaignPrice ?? 0));
  else if (state.sort === "preis-desc") result.sort((a, b) => (b.fromCampaignPrice ?? 0) - (a.fromCampaignPrice ?? 0));
  else if (state.sort === "name-az") result.sort((a, b) => a.name.localeCompare(b.name, "de"));

  return result;
}

/** Count of products for a state — used for the "[N] Produkte anzeigen" panel buttons. */
export function countCards(
  cards: EnrichedCard[],
  state: KatalogFilterState,
  allCategories: V2Category[],
): number {
  return filterCards(cards, state, allCategories).length;
}

/** Material option counts within the current category scope (for the Material panel). */
export function materialCountsFor(
  cards: EnrichedCard[],
  kategorie: string,
  sub: string,
  allCategories: V2Category[],
): { name: string; count: number }[] {
  const scoped = applyCategory([...cards], kategorie, sub, allCategories);
  const counts: Record<string, number> = {};
  for (const card of scoped) {
    const seen = new Set<string>();
    for (const pm of card.materials) {
      if (pm.score > 0 && !seen.has(pm.material_name)) {
        seen.add(pm.material_name);
        counts[pm.material_name] = (counts[pm.material_name] ?? 0) + 1;
      }
    }
  }
  return Object.entries(counts)
    .sort((a, b) => a[0].localeCompare(b[0], "de"))
    .map(([name, count]) => ({ name, count }));
}
