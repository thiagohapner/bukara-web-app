"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, Search, SlidersHorizontal } from "lucide-react";
import Footer from "@/components/Footer";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";
import CustomSelect from "@/components/CustomSelect";
import KatalogFilterSidebar from "./KatalogFilterSidebar";
import { DS_INPUT } from "@/lib/ds";
import type { V2Category } from "@/lib/v2/types";

gsap.registerPlugin(ScrollTrigger);

export type EnrichedCard = ProductCardData & {
  id: string;
  categoryIds: string[];
  applicationTags: string[];
  materials: { material_name: string; score: number }[];
  minDiam: number | null;
  maxDiam: number | null;
  merchantSkus: string[];
};

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-slate-900 text-white text-xs font-medium">
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

interface Props {
  initialCards: EnrichedCard[];
  allCategories: V2Category[];
  allApplicationTags: string[];
}

export default function KatalogCatalog({ initialCards, allCategories, allApplicationTags }: Props) {
  const sp = useSearchParams();
  const router = useRouter();
  const tilesRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  const [allCards] = useState<EnrichedCard[]>(initialCards);

  // Local filter state — initialized from URL once (supports deep links / refresh)
  const [kategorieParam, setKategorieParam] = useState(sp.get("kategorie") ?? "");
  const [subParam, setSubParam] = useState(sp.get("sub") ?? "");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    (sp.get("material") ?? "").split(",").filter(Boolean)
  );
  const [selectedAnwendungen, setSelectedAnwendungen] = useState<string[]>(
    (sp.get("anwendung") ?? "").split(",").filter(Boolean)
  );
  const [minScore, setMinScore] = useState(sp.get("minScore") ? Number(sp.get("minScore")) : 1);
  const [sortParam, setSortParam] = useState(sp.get("sort") ?? "");
  const [viewParam, setViewParam] = useState(sp.get("view") ?? "");
  const [searchQuery, setSearchQuery] = useState(sp.get("q") ?? "");
  const [priceMin, setPriceMin] = useState<number | null>(
    sp.get("priceMin") ? Number(sp.get("priceMin")) : null
  );
  const [priceMax, setPriceMax] = useState<number | null>(
    sp.get("priceMax") ? Number(sp.get("priceMax")) : null
  );
  const [diamMin, setDiamMin] = useState<number | null>(
    sp.get("diamMin") ? Number(sp.get("diamMin")) : null
  );
  const [diamMax, setDiamMax] = useState<number | null>(
    sp.get("diamMax") ? Number(sp.get("diamMax")) : null
  );

  const [localSearch, setLocalSearch] = useState(searchQuery);

  // ── URL builder ───────────────────────────────────────────────────────────
  function makeUrl(overrides: {
    kategorie?: string; sub?: string; materials?: string[]; anwendungen?: string[];
    minScore?: number; sort?: string; view?: string; q?: string;
    priceMin?: number | null; priceMax?: number | null;
    diamMin?: number | null; diamMax?: number | null;
  } = {}): string {
    const s = {
      kategorie: overrides.kategorie !== undefined ? overrides.kategorie : kategorieParam,
      sub: overrides.sub !== undefined ? overrides.sub : subParam,
      materials: overrides.materials !== undefined ? overrides.materials : selectedMaterials,
      anwendungen: overrides.anwendungen !== undefined ? overrides.anwendungen : selectedAnwendungen,
      minScore: overrides.minScore !== undefined ? overrides.minScore : minScore,
      sort: overrides.sort !== undefined ? overrides.sort : sortParam,
      view: overrides.view !== undefined ? overrides.view : viewParam,
      q: overrides.q !== undefined ? overrides.q : searchQuery,
      priceMin: overrides.priceMin !== undefined ? overrides.priceMin : priceMin,
      priceMax: overrides.priceMax !== undefined ? overrides.priceMax : priceMax,
      diamMin: overrides.diamMin !== undefined ? overrides.diamMin : diamMin,
      diamMax: overrides.diamMax !== undefined ? overrides.diamMax : diamMax,
    };
    const p = new URLSearchParams();
    if (s.kategorie) p.set("kategorie", s.kategorie);
    if (s.sub) p.set("sub", s.sub);
    if (s.materials.length) p.set("material", s.materials.join(","));
    if (s.anwendungen.length) p.set("anwendung", s.anwendungen.join(","));
    if (s.minScore > 1) p.set("minScore", String(s.minScore));
    if (s.sort) p.set("sort", s.sort);
    if (s.view) p.set("view", s.view);
    if (s.q) p.set("q", s.q);
    if (s.priceMin !== null) p.set("priceMin", String(s.priceMin));
    if (s.priceMax !== null) p.set("priceMax", String(s.priceMax));
    if (s.diamMin !== null) p.set("diamMin", String(s.diamMin));
    if (s.diamMax !== null) p.set("diamMax", String(s.diamMax));
    const qs = p.toString();
    return qs ? `/katalog?${qs}` : "/katalog";
  }

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
        if (childIds.length > 0) {
          result = result.filter((c) => c.categoryIds.some((id) => childIds.includes(id)));
        } else {
          result = result.filter((c) => c.categoryIds.includes(parent.id));
        }
      }
    }

    if (selectedAnwendungen.length > 0) {
      result = result.filter((c) => selectedAnwendungen.some((tag) => c.applicationTags.includes(tag)));
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
      result = result.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.merchantSkus.some((s) => s.toLowerCase().includes(q))
      );
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
        if (childIds.length > 0) {
          result = result.filter((c) => c.categoryIds.some((id) => childIds.includes(id)));
        } else {
          result = result.filter((c) => c.categoryIds.includes(parent.id));
        }
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
    if (allCards.length === 0) return;
    const ctx = gsap.context(() => {
      const tiles = gsap.utils.toArray<HTMLElement>(".katalog-tile");
      gsap.from(tiles, {
        opacity: 0, y: 20, duration: 0.5, stagger: 0.07, ease: "power3.out",
        scrollTrigger: { trigger: tilesRef.current, start: "top 90%" },
      });
    });
    return () => ctx.revert();
  }, [allCards.length]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Filter handlers ───────────────────────────────────────────────────────
  function handleToggleMaterial(name: string) {
    const next = selectedMaterials.includes(name)
      ? selectedMaterials.filter((m) => m !== name)
      : [...selectedMaterials, name];
    setSelectedMaterials(next);
    startTransition(() => router.replace(makeUrl({ materials: next })));
  }

  function handleToggleAnwendung(tag: string) {
    const next = selectedAnwendungen.includes(tag)
      ? selectedAnwendungen.filter((t) => t !== tag)
      : [...selectedAnwendungen, tag];
    setSelectedAnwendungen(next);
    startTransition(() => router.replace(makeUrl({ anwendungen: next })));
  }

  function handleSetMinScore(score: number) {
    setMinScore(score);
    startTransition(() => router.replace(makeUrl({ minScore: score })));
  }

  function handleSelectCategory(parentSlug: string, subSlug: string) {
    setKategorieParam(parentSlug);
    setSubParam(subSlug);
    startTransition(() => router.replace(makeUrl({ kategorie: parentSlug, sub: subSlug })));
  }

  function handleCommitPrice(min: number, max: number) {
    const newMin = min > absoluteMinPrice ? min : null;
    const newMax = max < absoluteMaxPrice ? max : null;
    setPriceMin(newMin);
    setPriceMax(newMax);
    startTransition(() => router.replace(makeUrl({ priceMin: newMin, priceMax: newMax })));
  }

  function handleCommitDiam(min: number, max: number) {
    const newMin = min > absoluteMinDiam ? min : null;
    const newMax = max < absoluteMaxDiam ? max : null;
    setDiamMin(newMin);
    setDiamMax(newMax);
    startTransition(() => router.replace(makeUrl({ diamMin: newMin, diamMax: newMax })));
  }

  function handleResetAnwendung() {
    setSelectedAnwendungen([]);
    startTransition(() => router.replace(makeUrl({ anwendungen: [] })));
  }

  function handleSort(value: string) {
    setSortParam(value);
    startTransition(() => router.replace(makeUrl({ sort: value })));
  }

  function handleView(value: string) {
    setViewParam(value);
    startTransition(() => router.replace(makeUrl({ view: value })));
  }

  function commitSearch(value: string) {
    const trimmed = value.trim();
    setSearchQuery(trimmed);
    startTransition(() => router.replace(makeUrl({ q: trimmed })));
  }

  function resetFilters() {
    setKategorieParam("");
    setSubParam("");
    setSelectedMaterials([]);
    setSelectedAnwendungen([]);
    setMinScore(1);
    setSortParam("");
    setViewParam("");
    setSearchQuery("");
    setLocalSearch("");
    setPriceMin(null);
    setPriceMax(null);
    setDiamMin(null);
    setDiamMax(null);
    startTransition(() => router.replace("/katalog"));
  }

  function resetPriceFilter() {
    setPriceMin(null);
    setPriceMax(null);
    startTransition(() => router.replace(makeUrl({ priceMin: null, priceMax: null })));
  }

  function resetDiamFilter() {
    setDiamMin(null);
    setDiamMax(null);
    startTransition(() => router.replace(makeUrl({ diamMin: null, diamMax: null })));
  }

  function removeKategorie() {
    setKategorieParam("");
    setSubParam("");
    startTransition(() => router.replace(makeUrl({ kategorie: "", sub: "" })));
  }

  function removeSub() {
    setSubParam("");
    startTransition(() => router.replace(makeUrl({ sub: "" })));
  }

  function removeAnwendung(tag: string) {
    const next = selectedAnwendungen.filter((t) => t !== tag);
    setSelectedAnwendungen(next);
    startTransition(() => router.replace(makeUrl({ anwendungen: next })));
  }

  function removeMaterial(m: string) {
    const next = selectedMaterials.filter((x) => x !== m);
    setSelectedMaterials(next);
    startTransition(() => router.replace(makeUrl({ materials: next })));
  }

  function removeSearch() {
    setSearchQuery("");
    setLocalSearch("");
    startTransition(() => router.replace(makeUrl({ q: "" })));
  }

  const hasActiveFilters = !!(kategorieParam || subParam || selectedMaterials.length || selectedAnwendungen.length || searchQuery || priceMin !== null || priceMax !== null || diamMin !== null || diamMax !== null);
  const activeFilterCount =
    (kategorieParam && !subParam ? 1 : 0) +
    (subParam ? 1 : 0) +
    selectedMaterials.length +
    selectedAnwendungen.length +
    (searchQuery ? 1 : 0) +
    (priceMin !== null || priceMax !== null ? 1 : 0) +
    (diamMin !== null || diamMax !== null ? 1 : 0);

  const sidebarProps = {
    allCategories,
    materialCounts,
    applicationTags: allApplicationTags,
    selectedMaterials,
    selectedAnwendungen,
    currentKategorie: kategorieParam,
    currentSub: subParam,
    minScore,
    priceMin,
    priceMax,
    absoluteMinPrice,
    absoluteMaxPrice,
    diamMin,
    diamMax,
    absoluteMinDiam,
    absoluteMaxDiam,
    onSelectCategory: handleSelectCategory,
    onToggleMaterial: handleToggleMaterial,
    onToggleAnwendung: handleToggleAnwendung,
    onSetMinScore: handleSetMinScore,
    onCommitPrice: handleCommitPrice,
    onCommitDiam: handleCommitDiam,
    onResetAnwendung: handleResetAnwendung,
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

        {/* Two-column layout */}
        <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10 pb-20">
          <div className="flex gap-10 items-start">

            {/* Sidebar — desktop */}
            <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-20">
              <KatalogFilterSidebar {...sidebarProps} />
            </aside>

            {/* Right column */}
            <div className="flex-1 min-w-0">
              {/* Sort + Search — mobile */}
              <div className="flex flex-col gap-2 mb-4 lg:hidden">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-sm border border-slate-200 text-sm font-medium text-slate-700 w-fit"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtern & Sortieren
                  {activeFilterCount > 0 && (
                    <span className="bg-slate-900 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => { e.preventDefault(); commitSearch(localSearch); }}
                >
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
                        onClick={() => { setLocalSearch(""); commitSearch(""); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
                      >×</button>
                    )}
                  </div>
                  <button type="submit" className="btn-orange flex-shrink-0 flex items-center gap-1.5 px-4">
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Sort + Search — desktop */}
              <div className="hidden lg:flex gap-3 mb-4">
                <div className="w-52 flex-shrink-0">
                  <CustomSelect
                    value={sortParam}
                    onChange={handleSort}
                    options={[
                      { value: "", label: "Sortieren nach" },
                      { value: "preis-asc", label: "Preis aufsteigend" },
                      { value: "preis-desc", label: "Preis absteigend" },
                      { value: "name-az", label: "Name A–Z" },
                    ]}
                  />
                </div>
                <form
                  className="flex gap-2 flex-1"
                  onSubmit={(e) => { e.preventDefault(); commitSearch(localSearch); }}
                >
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
                        onClick={() => { setLocalSearch(""); commitSearch(""); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
                      >×</button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn-orange flex-shrink-0 flex items-center gap-1.5 px-4"
                  >
                    <Search className="w-4 h-4" />
                    <span className="text-sm">Suchen</span>
                  </button>
                </form>
              </div>

              {/* Result count + desktop view toggle */}
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm text-slate-500">
                  {`${filtered.length} Produkt${filtered.length !== 1 ? "e" : ""}`}
                </span>
                <span className="hidden lg:block text-sm text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => handleView(viewParam === "list" ? "" : "list")}
                  className="hidden lg:block text-sm text-slate-500 hover:text-slate-900 transition-colors underline underline-offset-2"
                  aria-label={viewParam === "list" ? "In Kachelansicht wechseln" : "In Listenansicht wechseln"}
                >
                  {viewParam === "list" ? "Als Kacheln anzeigen" : "Als Liste anzeigen"}
                </button>
              </div>

              {/* Active filter chips */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {kategorieParam && !subParam && (
                    <FilterChip
                      label={allCategories.find((c) => c.slug === kategorieParam)?.name ?? kategorieParam}
                      onRemove={removeKategorie}
                    />
                  )}
                  {subParam && (
                    <FilterChip
                      label={allCategories.find((c) => c.slug === subParam)?.name ?? subParam}
                      onRemove={removeSub}
                    />
                  )}
                  {selectedAnwendungen.map((tag) => (
                    <FilterChip
                      key={tag}
                      label={tag}
                      onRemove={() => removeAnwendung(tag)}
                    />
                  ))}
                  {selectedMaterials.map((m) => (
                    <FilterChip
                      key={m}
                      label={m}
                      onRemove={() => removeMaterial(m)}
                    />
                  ))}
                  {searchQuery && (
                    <FilterChip label={`"${searchQuery}"`} onRemove={removeSearch} />
                  )}
                  {(priceMin !== null || priceMax !== null) && (
                    <FilterChip
                      label={`${priceMin ?? absoluteMinPrice}–${priceMax ?? absoluteMaxPrice} €`}
                      onRemove={resetPriceFilter}
                    />
                  )}
                  {(diamMin !== null || diamMax !== null) && (
                    <FilterChip
                      label={`${diamMin ?? absoluteMinDiam}–${diamMax ?? absoluteMaxDiam} mm`}
                      onRemove={resetDiamFilter}
                    />
                  )}
                </div>
              )}

              {/* Grid */}
              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-slate-500 text-sm mb-4">Keine Produkte gefunden.</p>
                  <button onClick={resetFilters} className="btn-outline text-sm">
                    Filter zurücksetzen
                  </button>
                </div>
              ) : (
                <div
                  ref={tilesRef}
                  className={[
                    viewParam === "list" ? "flex flex-col gap-3" : "grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6",
                    "transition-opacity duration-150",
                    isPending ? "opacity-60 pointer-events-none" : "",
                  ].join(" ")}
                >
                  {filtered.map((card) => (
                    <div key={card.slug} className="katalog-tile">
                      <ProductCard card={{ ...card, variant: viewParam === "list" ? "list" : "grid" }} />
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
              <span className="text-sm font-semibold text-slate-900">Filtern & Sortieren</span>
              <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <KatalogFilterSidebar
                {...sidebarProps}
                sort={sortParam}
                onSortChange={handleSort}
                view={viewParam}
                onViewChange={handleView}
                onFilterApplied={() => setDrawerOpen(false)}
              />
            </div>
          </div>
        </>
      )}

      <Footer />
    </>
  );
}
