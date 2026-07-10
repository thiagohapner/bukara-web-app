import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";
import { supabase } from "@/lib/supabase";
import { findProductsByAttributes } from "@/lib/recommendations/attributeFinder";
import { hydrateProductCards, hydrateAccessoryItems } from "@/lib/recommendations/hydrate";
import type { ProductCardData } from "@/components/ProductCard";
import type { AccessoryItem } from "@/components/ProductAccessories";

export type RecSurface = "pdp_similar" | "pdp_cross_sell" | "cart" | "home_popular" | "form_success";

export interface GetRecommendationsOptions {
  surface: RecSurface;
  /** PDP: [current product id]. Cart: all product ids currently in the cart. */
  anchorProductIds?: string[];
  /** pdp_similar only: the diameter of the SKU actually being viewed, so recs are re-ranked toward the visitor's size. */
  viewedDiameter?: number | null;
  /** form_success only: the form's collected material/application/machine/category answers. */
  seedFilters?: { material?: string | string[]; application?: string | string[]; machineId?: string; categoryId?: string };
  /** Ids to never recommend back (anchors + cart contents are excluded by default). */
  excludeProductIds?: string[];
  limit?: number;
}

const DEFAULT_LIMIT: Record<RecSurface, number> = {
  pdp_similar: 8,
  pdp_cross_sell: 4,
  cart: 3,
  home_popular: 8,
  form_success: 8,
};

// The "Weitere Produkte" carousel must always show at least this many items.
const MIN_RECS = 5;

// Serve-time similarity: the v2.similar_for() SQL function applies the diameter
// re-rank against the viewed SKU's size, dedupes by display_name (no two cards
// alike), excludes the same product family, and drops hard size-mismatches. The
// scoring weights and diameter tolerance live entirely in that function, so the
// app never re-implements ranking here.
async function similarProductIds(anchorId: string, viewedDiameter: number | null | undefined, exclude: Set<string>, limit: number): Promise<string[]> {
  const { data } = await supabaseAdminV2.rpc("similar_for", {
    p_anchor: anchorId,
    p_diam: viewedDiameter ?? null,
    p_limit: limit + exclude.size,
    p_min: MIN_RECS + exclude.size,
  });
  return ((data ?? []) as { recommended_product_id: string }[])
    .map((r) => r.recommended_product_id)
    .filter((id) => !exclude.has(id))
    .slice(0, limit);
}

// Guarantees the "Weitere Produkte" carousel never renders fewer than MIN_RECS.
// Only reached for the handful of products whose category is too small to yield
// MIN_RECS similar items (e.g. the 7 Spannzangen): tops up with same-category
// products first, then the merchant's global sort order — never repeating a
// display_name, the anchor, or its own family.
async function fallbackFillProductIds(anchorId: string, exclude: Set<string>, needed: number): Promise<string[]> {
  const { data: anchorRow } = await supabaseAdminV2.from("products").select("series").eq("id", anchorId).maybeSingle();
  const anchorSeries = (anchorRow as { series: string | null } | null)?.series ?? null;

  const chosen: string[] = [];
  const seenIds = new Set<string>(exclude);
  seenIds.add(anchorId);
  const seenNames = new Set<string>();

  type FillProduct = { id: string; display_name: string | null; base_name: string | null; series: string | null };
  const consider = (rows: FillProduct[]) => {
    for (const p of rows) {
      if (chosen.length >= needed) break;
      if (seenIds.has(p.id)) continue;
      if (anchorSeries && p.series === anchorSeries) continue;
      const name = p.display_name ?? p.base_name ?? p.id;
      if (seenNames.has(name)) continue;
      seenNames.add(name);
      seenIds.add(p.id);
      chosen.push(p.id);
    }
  };

  // Same category first.
  const { data: catRows } = await supabaseAdminV2.from("product_categories").select("category_id").eq("product_id", anchorId);
  const catIds = ((catRows ?? []) as { category_id: string }[]).map((r) => r.category_id);
  if (catIds.length > 0) {
    const { data: pcRows } = await supabaseAdminV2.from("product_categories").select("product_id").in("category_id", catIds);
    const catProductIds = [...new Set(((pcRows ?? []) as { product_id: string }[]).map((r) => r.product_id))];
    const { data: catProducts } = await supabaseAdminV2
      .from("products")
      .select("id, display_name, base_name, series, sort_order")
      .in("id", catProductIds).eq("is_active", true).eq("has_public_page", true).order("sort_order");
    consider((catProducts ?? []) as FillProduct[]);
  }

  // Then the global merchandising order.
  if (chosen.length < needed) {
    const { data: globalProducts } = await supabaseAdminV2
      .from("products")
      .select("id, display_name, base_name, series, sort_order")
      .eq("is_active", true).eq("has_public_page", true).order("sort_order").limit(300);
    consider((globalProducts ?? []) as FillProduct[]);
  }

  return chosen;
}

// "Passend dazu" is exact-fit accessories only — hand-curated in
// v2.product_accessories, never algorithmic. (Cross-sell recommendations, if any,
// are a separate concern from this curated slot.)
async function curatedAccessoryProductIds(anchorIds: string[], exclude: Set<string>, limit: number): Promise<string[]> {
  const curatedRes = await supabaseAdminV2
    .from("product_accessories")
    .select("product_id, accessory_product_id, sort_order")
    .in("product_id", anchorIds)
    .order("sort_order");

  const ordered: string[] = [];
  const seen = new Set<string>(exclude);
  for (const row of (curatedRes.data ?? []) as { accessory_product_id: string }[]) {
    const id = row.accessory_product_id;
    if (seen.has(id)) continue;
    seen.add(id);
    ordered.push(id);
    if (ordered.length >= limit) break;
  }
  return ordered;
}

async function popularProductIds(exclude: Set<string>, limit: number): Promise<string[]> {
  const { data } = await supabase
    .from("popular_products")
    .select("product_id, rank")
    .eq("time_window", "30d")
    .order("rank")
    .limit(limit + exclude.size);
  return ((data ?? []) as { product_id: string }[])
    .map((r) => r.product_id)
    .filter((id) => !exclude.has(id))
    .slice(0, limit);
}

export interface RecResult {
  cards: ProductCardData[];
  accessories: AccessoryItem[];
}

/**
 * Single entry point for every recommendation surface in the app. Each surface
 * has its own retrieval strategy but shares the same fallback discipline: if a
 * surface's primary source comes up short, it falls through to the next best
 * source rather than rendering nothing. Callers pick `cards` (carousels) or
 * `accessories` (compact add-to-cart rows) depending on where they render.
 */
export async function getRecommendations(opts: GetRecommendationsOptions): Promise<RecResult> {
  const limit = opts.limit ?? DEFAULT_LIMIT[opts.surface];
  const exclude = new Set([...(opts.anchorProductIds ?? []), ...(opts.excludeProductIds ?? [])]);

  switch (opts.surface) {
    case "pdp_similar": {
      const anchor = opts.anchorProductIds?.[0];
      if (!anchor) return { cards: [], accessories: [] };
      const ids = await similarProductIds(anchor, opts.viewedDiameter, exclude, limit);
      // Guarantee at least MIN_RECS: top up the few products whose catalog niche
      // is too small (e.g. Spannzangen) with next-closest products.
      if (ids.length < MIN_RECS) {
        const fillExclude = new Set([...exclude, ...ids]);
        const fill = await fallbackFillProductIds(anchor, fillExclude, MIN_RECS - ids.length);
        ids.push(...fill);
      }
      return { cards: await hydrateProductCards(ids, limit), accessories: [] };
    }

    case "pdp_cross_sell":
    case "cart": {
      // Curated exact-fit accessories only ("Passend dazu"); no algorithmic complements.
      const anchors = opts.anchorProductIds ?? [];
      if (anchors.length === 0) return { cards: [], accessories: [] };
      const ids = await curatedAccessoryProductIds(anchors, exclude, limit);
      return { cards: [], accessories: await hydrateAccessoryItems(ids, limit) };
    }

    case "home_popular": {
      const ids = await popularProductIds(exclude, limit);
      return { cards: await hydrateProductCards(ids, limit), accessories: [] };
    }

    case "form_success": {
      const matches = await findProductsByAttributes({
        material: opts.seedFilters?.material,
        application: opts.seedFilters?.application,
        machineId: opts.seedFilters?.machineId,
        categoryId: opts.seedFilters?.categoryId,
        limit: limit + exclude.size,
      });
      const filtered = matches.filter((m) => !exclude.has(m.id)).slice(0, limit);
      if (filtered.length === 0) {
        const ids = await popularProductIds(exclude, limit);
        return { cards: await hydrateProductCards(ids, limit), accessories: [] };
      }
      const cards: ProductCardData[] = filtered.map((m) => {
        const price = m.best_sku.campaign_price ?? m.best_sku.price_eur;
        const hasCampaign = m.best_sku.campaign_price != null && m.best_sku.campaign_price < m.best_sku.price_eur;
        return {
          slug: m.slug,
          name: m.display_name,
          badge: m.badge ?? undefined,
          image: m.image_url ?? undefined,
          galleryBg: m.gallery_bg ?? "#e6eff5",
          hasVariants: false,
          fromCampaignPrice: price,
          fromOriginalPrice: hasCampaign ? m.best_sku.price_eur : undefined,
          variantLabel: m.best_sku.variant_label ?? undefined,
          hrefPrefix: "/katalog",
        };
      });
      return { cards, accessories: [] };
    }

    default:
      return { cards: [], accessories: [] };
  }
}
