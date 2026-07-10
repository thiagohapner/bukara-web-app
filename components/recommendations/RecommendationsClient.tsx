"use client";

import { useEffect, useState } from "react";
import RecommendationsCarousel from "@/components/recommendations/RecommendationsCarousel";
import ProductAccessories, { type AccessoryItem } from "@/components/ProductAccessories";
import type { ProductCardData } from "@/components/ProductCard";
import type { RecSurface } from "@/lib/recommendations/service";

type Result = { cards: ProductCardData[]; accessories: AccessoryItem[] };

// Module-level so navigating between products (or reopening the cart drawer)
// doesn't refetch the same anchor twice in one session.
const cache = new Map<string, Promise<Result>>();

const ANCHORED_SURFACES: RecSurface[] = ["pdp_similar", "pdp_cross_sell", "cart"];

export default function RecommendationsClient({
  surface,
  anchorProductIds,
  excludeProductIds,
  seedFilters,
  limit,
  title,
  accessoriesTitle,
  linkBase = "/katalog",
}: {
  surface: RecSurface;
  anchorProductIds?: string[];
  excludeProductIds?: string[];
  seedFilters?: { material?: string | string[]; application?: string | string[]; machineId?: string; categoryId?: string };
  limit?: number;
  /** Heading for the carousel form (pdp_similar, form_success, home_popular). */
  title?: string;
  /** Heading for the accessory-row form (pdp_cross_sell, cart). */
  accessoriesTitle?: string;
  linkBase?: string;
}) {
  const [result, setResult] = useState<Result | null>(null);

  const anchorKey = (anchorProductIds ?? []).slice().sort().join(",");
  const excludeKey = (excludeProductIds ?? []).slice().sort().join(",");
  const seedKey = `${seedFilters?.material ?? ""}|${seedFilters?.application ?? ""}|${seedFilters?.machineId ?? ""}`;
  const cacheKey = `${surface}|${anchorKey}|${excludeKey}|${seedKey}|${limit ?? ""}`;
  const needsAnchor = ANCHORED_SURFACES.includes(surface);

  useEffect(() => {
    if (needsAnchor && !anchorKey) {
      setResult({ cards: [], accessories: [] });
      return;
    }

    let cancelled = false;
    let req = cache.get(cacheKey);
    if (!req) {
      const params = new URLSearchParams({ surface });
      if (anchorProductIds?.length) params.set("anchor", anchorProductIds.join(","));
      if (excludeProductIds?.length) params.set("exclude", excludeProductIds.join(","));
      const materialVal = Array.isArray(seedFilters?.material) ? seedFilters.material.join(",") : seedFilters?.material;
      const applicationVal = Array.isArray(seedFilters?.application) ? seedFilters.application.join(",") : seedFilters?.application;
      if (materialVal) params.set("material", materialVal);
      if (applicationVal) params.set("application", applicationVal);
      if (seedFilters?.machineId) params.set("machineId", seedFilters.machineId);
      if (seedFilters?.categoryId) params.set("categoryId", seedFilters.categoryId);
      if (limit) params.set("limit", String(limit));
      req = fetch(`/api/v2/recommendations?${params.toString()}`)
        .then((res) => (res.ok ? res.json() : { cards: [], accessories: [] }))
        .catch(() => ({ cards: [], accessories: [] }));
      cache.set(cacheKey, req);
    }
    req.then((data) => {
      if (!cancelled) setResult({ cards: data.cards ?? [], accessories: data.accessories ?? [] });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  if (!result) return null;
  if (result.accessories.length > 0) {
    return <ProductAccessories accessories={result.accessories} linkBase={linkBase} title={accessoriesTitle} />;
  }
  if (result.cards.length > 0) {
    return <RecommendationsCarousel title={title ?? "Weitere Produkte"} cards={result.cards} />;
  }
  return null;
}
