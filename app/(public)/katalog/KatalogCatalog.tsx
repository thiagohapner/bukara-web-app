"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SlidersHorizontal, X } from "lucide-react";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";
import CustomSelect from "@/components/CustomSelect";
import KatalogFilterSidebar from "./KatalogFilterSidebar";
import { DS_INPUT } from "@/lib/ds";
import type { V2Category, V2ProductMaterial } from "@/lib/v2/types";

gsap.registerPlugin(ScrollTrigger);

type EnrichedCard = ProductCardData & {
  id: string;
  categoryIds: string[];
  applicationTags: string[];
  materials: { material_name: string; score: number }[];
  minDiam: number | null;
  maxDiam: number | null;
};

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="text-white/70 hover:text-white transition-colors leading-none"
        aria-label={`${label} entfernen`}
      >
        ×
      </button>
    </span>
  );
}

export default function KatalogCatalog() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tilesRef = useRef<HTMLDivElement>(null);
  const isFirstSearchRender = useRef(true);

  const [allCards, setAllCards] = useState<EnrichedCard[]>([]);
  const [allCategories, setAllCategories] = useState<V2Category[]>([]);
  const [allApplicationTags, setAllApplicationTags] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // URL params
  const kategorieParam = searchParams.get("kategorie") ?? "";
  const subParam = searchParams.get("sub") ?? "";
  const materialParam = searchParams.get("material") ?? "";
  const anwendungParam = searchParams.get("anwendung") ?? "";
  const minScoreParam = searchParams.get("minScore");
  const sortParam = searchParams.get("sort") ?? "";
  const searchQuery = searchParams.get("q") ?? "";
  const priceMinParam = searchParams.get("priceMin");
  const priceMaxParam = searchParams.get("priceMax");
  const diamMinParam = searchParams.get("diamMin");
  const diamMaxParam = searchParams.get("diamMax");
  const priceMin = priceMinParam ? Number(priceMinParam) : null;
  const priceMax = priceMaxParam ? Number(priceMaxParam) : null;
  const diamMin = diamMinParam ? Number(diamMinParam) : null;
  const diamMax = diamMaxParam ? Number(diamMaxParam) : null;
  const minScore = minScoreParam ? Number(minScoreParam) : 1;
  const selectedMaterials = materialParam ? materialParam.split(",").filter(Boolean) : [];

  const [localSearch, setLocalSearch] = useState(searchQuery);
  useEffect(() => { setLocalSearch(searchQuery); }, [searchQuery]);
  useEffect(() => {
    if (isFirstSearchRender.current) { isFirstSearchRender.current = false; return; }
    const t = setTimeout(() => {
      const p = new URLSearchParams(searchParams.toString());
      if (localSearch) p.set("q", localSearch); else p.delete("q");
      router.push(`/katalog?${p.toString()}`);
    }, 350);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  // ── Data load ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: products } = await supabase
        .schema("v2")
        .from("products")
        .select("id, slug, display_name, badge, gallery_bg, default_image_url")
        .eq("is_active", true)
        .eq("has_public_page", true)
        .order("sort_order");

      if (!products || products.length === 0) { setLoaded(true); return; }

      const ids = products.map((p: { id: string }) => p.id);

      const [
        { data: skus },
        { data: skuImages },
        { data: productCategories },
        { data: productApplications },
        { data: productMaterials },
        { data: categories },
      ] = await Promise.all([
        supabase.schema("v2").from("skus")
          .select("id, product_id, price_eur, campaign_price, diameter_mm, sort_order")
          .in("product_id", ids)
          .eq("is_active", true)
          .order("sort_order"),
        supabase.schema("v2").from("sku_images")
          .select("sku_id, image_url, sort_order")
          .order("sort_order"),
        supabase.schema("v2").from("product_categories")
          .select("product_id, category_id")
          .in("product_id", ids),
        supabase.schema("v2").from("product_applications")
          .select("product_id, tag")
          .in("product_id", ids),
        supabase.schema("v2").from("product_materials")
          .select("product_id, material_name, score")
          .in("product_id", ids),
        supabase.schema("v2").from("categories")
          .select("id, name, slug, parent_id"),
      ]);

      // First SKU per product → first image for that SKU
      const skuList = (skus ?? []) as Array<{ id: string; product_id: string; price_eur: number; campaign_price: number | null; diameter_mm: number | null; sort_order: number }>;
      const skuImageList = (skuImages ?? []) as Array<{ sku_id: string; image_url: string; sort_order: number }>;

      const firstSkuPerProduct: Record<string, string> = {};
      for (const sku of skuList) {
        if (!firstSkuPerProduct[sku.product_id]) firstSkuPerProduct[sku.product_id] = sku.id;
      }

      const firstImageBySku: Record<string, string> = {};
      for (const img of skuImageList) {
        if (!firstImageBySku[img.sku_id]) firstImageBySku[img.sku_id] = img.image_url;
      }

      // Min price & diameter range per product
      const priceMap: Record<string, { campaign: number; original: number }> = {};
      const diamRangeMap: Record<string, { min: number; max: number }> = {};
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

      // Collect category names for card labels
      const categoryNameById: Record<string, string> = {};
      for (const cat of (categories ?? []) as V2Category[]) {
        categoryNameById[cat.id] = cat.name;
      }

      const cards: EnrichedCard[] = products.map((p: {
        id: string; slug: string; display_name: string;
        badge: string | null; gallery_bg: string | null; default_image_url: string | null;
      }) => {
        const firstSkuId = firstSkuPerProduct[p.id];
        const image = (firstSkuId && firstImageBySku[firstSkuId]) || p.default_image_url || undefined;
        const productCatIds = catMap[p.id] ?? [];
        const firstCatName = productCatIds.length > 0 ? categoryNameById[productCatIds[0]] : undefined;

        return {
          id: p.id,
          slug: p.slug,
          name: p.display_name,
          badge: p.badge ?? undefined,
          image,
          galleryBg: p.gallery_bg ?? "#e6eff5",
          hasVariants: (skuList.filter((s) => s.product_id === p.id).length) > 1,
          fromCampaignPrice: priceMap[p.id]?.campaign,
          fromOriginalPrice: priceMap[p.id]?.original,
          categoryLabel: firstCatName,
          hrefPrefix: "/katalog",
          categoryIds: productCatIds,
          applicationTags: appMap[p.id] ?? [],
          materials: (matMap[p.id] ?? []).map((m) => ({ material_name: m.material_name, score: m.score })),
          minDiam: diamRangeMap[p.id]?.min ?? null,
          maxDiam: diamRangeMap[p.id]?.max ?? null,
        };
      });

      // Collect all application tags (sorted, deduplicated)
      const tagSet = new Set<string>();
      for (const card of cards) for (const t of card.applicationTags) tagSet.add(t);
      setAllApplicationTags([...tagSet].sort((a, b) => a.localeCompare(b, "de")));

      setAllCards(cards);
      setAllCategories((categories ?? []) as V2Category[]);
      setLoaded(true);
    }
    load();
  }, []);

  // ── Absolute bounds ───────────────────────────────────────────────────────
  const absoluteMinPrice = allCards.length > 0
    ? Math.floor(Math.min(...allCards.map((c) => c.fromCampaignPrice ?? 0)))
    : 0;
  const absoluteMaxPrice = allCards.length > 0
    ? Math.ceil(Math.max(...allCards.map((c) => c.fromCampaignPrice ?? 0)))
    : 999;

  const allDiams = allCards.flatMap((c) =>
    c.minDiam !== null && c.maxDiam !== null ? [c.minDiam, c.maxDiam] : []
  );
  const absoluteMinDiam = allDiams.length > 0 ? Math.floor(Math.min(...allDiams)) : 0;
  const absoluteMaxDiam = allDiams.length > 0 ? Math.ceil(Math.max(...allDiams)) : 100;

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = (() => {
    let result = [...allCards];

    if (subParam) {
      const sub = allCategories.find((c) => c.slug === subParam);
      if (sub) result = result.filter((c) => c.categoryIds.includes(sub.id));
    } else if (kategorieParam) {
      const parent = allCategories.find((c) => c.slug === kategorieParam && c.parent_id === null);
      if (parent) {
        const childIds = allCategories.filter((c) => c.parent_id === parent.id).map((c) => c.id);
        result = result.filter((c) => c.categoryIds.some((id) => childIds.includes(id)));
      }
    }

    if (anwendungParam) {
      result = result.filter((c) => c.applicationTags.includes(anwendungParam));
    }

    if (selectedMaterials.length > 0) {
      result = result.filter((c) =>
        selectedMaterials.some((m) =>
          c.materials.some((pm) => pm.material_name === m && pm.score >= minScore)
        )
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }

    if (priceMin !== null) result = result.filter((c) => (c.fromCampaignPrice ?? 0) >= priceMin);
    if (priceMax !== null) result = result.filter((c) => (c.fromCampaignPrice ?? 0) <= priceMax);

    if (diamMin !== null) result = result.filter((c) => c.maxDiam !== null && c.maxDiam >= diamMin);
    if (diamMax !== null) result = result.filter((c) => c.minDiam !== null && c.minDiam <= diamMax);

    if (sortParam === "preis-asc") result.sort((a, b) => (a.fromCampaignPrice ?? 0) - (b.fromCampaignPrice ?? 0));
    else if (sortParam === "preis-desc") result.sort((a, b) => (b.fromCampaignPrice ?? 0) - (a.fromCampaignPrice ?? 0));
    else if (sortParam === "name-az") result.sort((a, b) => a.name.localeCompare(b.name, "de"));

    return result;
  })();

  // ── Material counts ────────────────────────────────────────────────────────
  const categoryFiltered = (() => {
    let result = [...allCards];
    if (subParam) {
      const sub = allCategories.find((c) => c.slug === subParam);
      if (sub) result = result.filter((c) => c.categoryIds.includes(sub.id));
    } else if (kategorieParam) {
      const parent = allCategories.find((c) => c.slug === kategorieParam && c.parent_id === null);
      if (parent) {
        const childIds = allCategories.filter((c) => c.parent_id === parent.id).map((c) => c.id);
        result = result.filter((c) => c.categoryIds.some((id) => childIds.includes(id)));
      }
    }
    return result;
  })();

  const materialCounts = (() => {
    const counts: Record<string, number> = {};
    for (const card of categoryFiltered) {
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
  })();

  // ── GSAP animation ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded || filtered.length === 0) return;
    const ctx = gsap.context(() => {
      const tiles = gsap.utils.toArray<HTMLElement>(".katalog-tile");
      gsap.from(tiles, {
        opacity: 0, y: 20, duration: 0.5, stagger: 0.07, ease: "power3.out",
        scrollTrigger: { trigger: tilesRef.current, start: "top 90%" },
      });
    });
    return () => ctx.revert();
  }, [loaded, filtered.length]);

  function pushParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    router.push(`/katalog?${p.toString()}`);
  }

  function resetFilters() {
    router.push("/katalog");
  }

  function resetPriceFilter() {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("priceMin"); p.delete("priceMax");
    router.push(`/katalog?${p.toString()}`);
  }

  function resetDiamFilter() {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("diamMin"); p.delete("diamMax");
    router.push(`/katalog?${p.toString()}`);
  }

  const hasActiveFilters = !!(kategorieParam || subParam || materialParam || anwendungParam || searchQuery || priceMinParam || priceMaxParam || diamMinParam || diamMaxParam);
  const activeFilterCount =
    (kategorieParam && !subParam ? 1 : 0) +
    (subParam ? 1 : 0) +
    selectedMaterials.length +
    (anwendungParam ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (priceMinParam || priceMaxParam ? 1 : 0) +
    (diamMinParam || diamMaxParam ? 1 : 0);

  const sidebarProps = {
    allCategories,
    materialCounts,
    applicationTags: allApplicationTags,
    selectedMaterials,
    minScore,
    priceMin,
    priceMax,
    absoluteMinPrice,
    absoluteMaxPrice,
    diamMin,
    diamMax,
    absoluteMinDiam,
    absoluteMaxDiam,
  };

  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Katalog</span>
          </nav>
        </div>

        <section className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-8 pb-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">Produktkatalog</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {loaded ? `${allCards.length} Produkte` : "Wird geladen…"}
          </p>
        </section>

        {/* Two-column layout */}
        <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-6 pb-20">
          <div className="flex gap-10 items-start">

            {/* Sidebar — desktop */}
            <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-20">
              <KatalogFilterSidebar {...sidebarProps} />
            </aside>

            {/* Right column */}
            <div className="flex-1 min-w-0">
              {/* Mobile filter button */}
              <button
                className="lg:hidden w-full flex items-center justify-center gap-2 btn-outline mb-5 text-sm"
                onClick={() => setDrawerOpen(true)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filter
                {hasActiveFilters && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Search + Sort */}
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Produkt suchen…"
                    className={DS_INPUT}
                  />
                  {localSearch && (
                    <button
                      type="button"
                      onClick={() => setLocalSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
                    >×</button>
                  )}
                </div>
                <div className="w-52 flex-shrink-0">
                  <CustomSelect
                    value={sortParam}
                    onChange={(v) => pushParam("sort", v)}
                    options={[
                      { value: "", label: "Sortieren nach" },
                      { value: "preis-asc", label: "Preis aufsteigend" },
                      { value: "preis-desc", label: "Preis absteigend" },
                      { value: "name-az", label: "Name A–Z" },
                    ]}
                  />
                </div>
              </div>

              {/* Result count */}
              <div className="mb-3">
                <span className="text-sm text-slate-500">
                  {loaded ? `${filtered.length} Produkt${filtered.length !== 1 ? "e" : ""}` : "Lädt…"}
                </span>
              </div>

              {/* Active filter chips */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {kategorieParam && !subParam && (
                    <FilterChip
                      label={allCategories.find((c) => c.slug === kategorieParam)?.name ?? kategorieParam}
                      onRemove={resetFilters}
                    />
                  )}
                  {subParam && (
                    <FilterChip
                      label={allCategories.find((c) => c.slug === subParam)?.name ?? subParam}
                      onRemove={resetFilters}
                    />
                  )}
                  {anwendungParam && (
                    <FilterChip label={anwendungParam} onRemove={() => pushParam("anwendung", "")} />
                  )}
                  {selectedMaterials.map((m) => (
                    <FilterChip
                      key={m}
                      label={m}
                      onRemove={() => {
                        const next = selectedMaterials.filter((x) => x !== m);
                        pushParam("material", next.join(","));
                      }}
                    />
                  ))}
                  {searchQuery && (
                    <FilterChip label={`"${searchQuery}"`} onRemove={() => pushParam("q", "")} />
                  )}
                  {(priceMinParam || priceMaxParam) && (
                    <FilterChip
                      label={`${priceMin ?? absoluteMinPrice}–${priceMax ?? absoluteMaxPrice} €`}
                      onRemove={resetPriceFilter}
                    />
                  )}
                  {(diamMinParam || diamMaxParam) && (
                    <FilterChip
                      label={`${diamMin ?? absoluteMinDiam}–${diamMax ?? absoluteMaxDiam} mm`}
                      onRemove={resetDiamFilter}
                    />
                  )}
                </div>
              )}

              {/* Grid */}
              {loaded && filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-slate-500 text-sm mb-4">Keine Produkte gefunden.</p>
                  <button onClick={resetFilters} className="btn-outline text-sm">
                    Filter zurücksetzen
                  </button>
                </div>
              ) : (
                <div ref={tilesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((card) => (
                    <div key={card.slug} className="katalog-tile">
                      <ProductCard card={card} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-72 bg-white z-50 overflow-y-auto shadow-xl lg:hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-900">Filter</span>
              <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <KatalogFilterSidebar {...sidebarProps} onFilterApplied={() => setDrawerOpen(false)} />
            </div>
          </div>
        </>
      )}

      <Footer />
    </>
  );
}
