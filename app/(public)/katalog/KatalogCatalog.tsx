"use client";

import { useState, useEffect, useRef, useTransition, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, Search, SlidersHorizontal } from "lucide-react";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import ProductCard from "@/components/ProductCard";
import KatalogFilterSidebar from "./KatalogFilterSidebar";
import KatalogFilterBar from "./KatalogFilterBar";
import { DS_INPUT } from "@/lib/ds";
import type { V2Category } from "@/lib/v2/types";
import {
  filterCards,
  materialCountsFor,
  countCards,
  type EnrichedCard,
  type KatalogFilterState,
} from "@/lib/katalog/filter";

gsap.registerPlugin(ScrollTrigger);

export type { EnrichedCard };

// Catalog renders one page of SKU cards at a time. The full server-side query
// (filter + sort + LIMIT in Postgres) is a follow-up; for now the filtered set
// is sliced in memory.
const PAGE_SIZE = 120;

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
  /** Base path for URL sync. Defaults to "/katalog". /sortiment pages pass their clean path. */
  basePath?: string;
  /**
   * Fixes the category and hides its pill/chips (used by /sortiment/[slug], where
   * the category is determined by the URL). kategorie/sub are kept out of the query
   * string so the base path stays clean (e.g. /sortiment/bohrer?material=hw).
   */
  lockedCategory?: { kategorie: string; sub: string };
  /** Replaces the default "Home / Katalog" breadcrumb (breadcrumb + H1 + intro). */
  header?: React.ReactNode;
}

export default function KatalogCatalog({
  initialCards,
  allCategories,
  allApplicationTags,
  basePath = "/katalog",
  lockedCategory,
  header,
}: Props) {
  const sp = useSearchParams();
  const router = useRouter();
  const tilesRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  const [allCards] = useState<EnrichedCard[]>(initialCards);

  // Local filter state — initialized from URL once (supports deep links / refresh).
  // When a category is locked, it is fixed and never read from / written to the URL.
  const [kategorieParam, setKategorieParam] = useState(
    lockedCategory ? lockedCategory.kategorie : sp.get("kategorie") ?? "",
  );
  const [subParam, setSubParam] = useState(
    lockedCategory ? lockedCategory.sub : sp.get("sub") ?? "",
  );
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
  const [shankMin, setShankMin] = useState<number | null>(
    sp.get("shankMin") ? Number(sp.get("shankMin")) : null
  );
  const [shankMax, setShankMax] = useState<number | null>(
    sp.get("shankMax") ? Number(sp.get("shankMax")) : null
  );

  const [localSearch, setLocalSearch] = useState(searchQuery);

  // ── URL builder ───────────────────────────────────────────────────────────
  function makeUrl(overrides: {
    kategorie?: string; sub?: string; materials?: string[]; anwendungen?: string[];
    minScore?: number; sort?: string; view?: string; q?: string;
    priceMin?: number | null; priceMax?: number | null;
    diamMin?: number | null; diamMax?: number | null;
    shankMin?: number | null; shankMax?: number | null;
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
      shankMin: overrides.shankMin !== undefined ? overrides.shankMin : shankMin,
      shankMax: overrides.shankMax !== undefined ? overrides.shankMax : shankMax,
    };
    const p = new URLSearchParams();
    // Locked category lives in the path, not the query string — keep base path clean.
    if (!lockedCategory && s.kategorie) p.set("kategorie", s.kategorie);
    if (!lockedCategory && s.sub) p.set("sub", s.sub);
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
    if (s.shankMin !== null) p.set("shankMin", String(s.shankMin));
    if (s.shankMax !== null) p.set("shankMax", String(s.shankMax));
    const qs = p.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  // ── Absolute bounds (invariant for the loaded card set) ────────────────────
  const {
    absoluteMinPrice, absoluteMaxPrice,
    absoluteMinDiam, absoluteMaxDiam,
    absoluteMinShank, absoluteMaxShank,
  } = useMemo(() => {
    const prices = allCards.map((c) => c.fromCampaignPrice ?? 0);
    const diams = allCards.flatMap((c) =>
      c.minDiam !== null && c.maxDiam !== null ? [c.minDiam, c.maxDiam] : []);
    const shanks = allCards.flatMap((c) =>
      c.minShank !== null && c.maxShank !== null ? [c.minShank, c.maxShank] : []);
    return {
      absoluteMinPrice: prices.length > 0 ? Math.floor(Math.min(...prices)) : 0,
      absoluteMaxPrice: prices.length > 0 ? Math.ceil(Math.max(...prices)) : 999,
      absoluteMinDiam: diams.length > 0 ? Math.floor(Math.min(...diams)) : 0,
      absoluteMaxDiam: diams.length > 0 ? Math.ceil(Math.max(...diams)) : 100,
      absoluteMinShank: shanks.length > 0 ? Math.floor(Math.min(...shanks)) : 0,
      absoluteMaxShank: shanks.length > 0 ? Math.ceil(Math.max(...shanks)) : 50,
    };
  }, [allCards]);

  // ── Filtering (logic lives in lib/katalog/filter) ──────────────────────────
  const filterState: KatalogFilterState = {
    kategorie: kategorieParam,
    sub: subParam,
    materials: selectedMaterials,
    anwendungen: selectedAnwendungen,
    minScore,
    search: searchQuery,
    priceMin, priceMax, diamMin, diamMax, shankMin, shankMax,
    sort: sortParam,
  };
  const filtered = useMemo(
    () => filterCards(allCards, filterState, allCategories),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allCards, allCategories, kategorieParam, subParam, selectedMaterials, selectedAnwendungen, minScore, searchQuery, priceMin, priceMax, diamMin, diamMax, shankMin, shankMax, sortParam],
  );

  // ── Pagination ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  // Any filter change collapses the result set — return to the first page. Done
  // during render (not in an effect) so the new page renders in the same pass.
  const filterSig = [
    kategorieParam, subParam, selectedMaterials.join(","), selectedAnwendungen.join(","),
    minScore, searchQuery, priceMin, priceMax, diamMin, diamMax, shankMin, shankMax, sortParam,
  ].join("|");
  const [prevFilterSig, setPrevFilterSig] = useState(filterSig);
  if (prevFilterSig !== filterSig) {
    setPrevFilterSig(filterSig);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageCards = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  function goToPage(n: number) {
    setPage(Math.min(Math.max(1, n), totalPages));
    tilesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Live count for a hypothetical (pending) selection — used by the filter-bar panels.
  const countFor = useCallback(
    (patch: Partial<KatalogFilterState>) =>
      countCards(allCards, { ...filterState, ...patch }, allCategories),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allCards, allCategories, kategorieParam, subParam, selectedMaterials, selectedAnwendungen, minScore, searchQuery, priceMin, priceMax, diamMin, diamMax, shankMin, shankMax, sortParam],
  );

  const materialCounts = useMemo(
    () => materialCountsFor(allCards, kategorieParam, subParam, allCategories),
    [allCards, kategorieParam, subParam, allCategories],
  );

  // ── GSAP animation ────────────────────────────────────────────────────────
  useEffect(() => {
    if (allCards.length === 0) return;
    const ctx = gsap.context(() => {
      const tiles = gsap.utils.toArray<HTMLElement>(".katalog-tile");
      // Cap total stagger time so large result sets (100s of tiles) still
      // appear promptly instead of animating in over ~40s.
      gsap.from(tiles, {
        opacity: 0, y: 20, duration: 0.5, stagger: { each: 0.04, amount: 0.6 }, ease: "power3.out",
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

  function handleCommitShank(min: number, max: number) {
    const newMin = min > absoluteMinShank ? min : null;
    const newMax = max < absoluteMaxShank ? max : null;
    setShankMin(newMin);
    setShankMax(newMax);
    startTransition(() => router.replace(makeUrl({ shankMin: newMin, shankMax: newMax })));
  }

  // Deferred set-all apply handlers used by the desktop filter-bar panels.
  function applyAnwendungen(tags: string[]) {
    setSelectedAnwendungen(tags);
    startTransition(() => router.replace(makeUrl({ anwendungen: tags })));
  }

  function applyMaterials(materials: string[], score: number) {
    setSelectedMaterials(materials);
    setMinScore(score);
    startTransition(() => router.replace(makeUrl({ materials, minScore: score })));
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
    // Keep the locked category fixed; only clear the secondary filters.
    setKategorieParam(lockedCategory ? lockedCategory.kategorie : "");
    setSubParam(lockedCategory ? lockedCategory.sub : "");
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
    setShankMin(null);
    setShankMax(null);
    startTransition(() => router.replace(basePath));
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

  function resetShankFilter() {
    setShankMin(null);
    setShankMax(null);
    startTransition(() => router.replace(makeUrl({ shankMin: null, shankMax: null })));
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

  // A locked category is fixed by the URL — it doesn't count as an active filter or chip.
  const catKategorieActive = !lockedCategory && !!kategorieParam;
  const catSubActive = !lockedCategory && !!subParam;
  const hasActiveFilters = !!(catKategorieActive || catSubActive || selectedMaterials.length || selectedAnwendungen.length || searchQuery || priceMin !== null || priceMax !== null || diamMin !== null || diamMax !== null || shankMin !== null || shankMax !== null);
  const activeFilterCount =
    (catKategorieActive && !catSubActive ? 1 : 0) +
    (catSubActive ? 1 : 0) +
    selectedMaterials.length +
    selectedAnwendungen.length +
    (searchQuery ? 1 : 0) +
    (priceMin !== null || priceMax !== null ? 1 : 0) +
    (diamMin !== null || diamMax !== null ? 1 : 0) +
    (shankMin !== null || shankMax !== null ? 1 : 0);

  const sidebarProps = {
    allCategories,
    hideCategory: !!lockedCategory,
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
    shankMin,
    shankMax,
    absoluteMinShank,
    absoluteMaxShank,
    onSelectCategory: handleSelectCategory,
    onToggleMaterial: handleToggleMaterial,
    onToggleAnwendung: handleToggleAnwendung,
    onSetMinScore: handleSetMinScore,
    onCommitPrice: handleCommitPrice,
    onCommitDiam: handleCommitDiam,
    onCommitShank: handleCommitShank,
    onResetAnwendung: handleResetAnwendung,
  };

  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Page header — custom (breadcrumb + H1 + intro) on /sortiment, else default breadcrumb */}
        {header ?? (
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-1">
            <nav className="flex items-center gap-1.5 text-xs text-slate-400">
              <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Home</Link>
              <span>/</span>
              <span className="text-slate-700 font-medium">Katalog</span>
            </nav>
          </div>
        )}

        {/* Two-column layout */}
        <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10 pb-20">
          <div>
            <div className="w-full min-w-0">
              {/* Filter bar — desktop */}
              <div className="hidden lg:block mb-3">
                <KatalogFilterBar
                  state={filterState}
                  allCategories={allCategories}
                  materialCounts={materialCounts}
                  applicationTags={allApplicationTags}
                  bounds={{
                    price: [absoluteMinPrice, absoluteMaxPrice],
                    diam: [absoluteMinDiam, absoluteMaxDiam],
                    shank: [absoluteMinShank, absoluteMaxShank],
                  }}
                  searchValue={localSearch}
                  onSearchInput={setLocalSearch}
                  onSearchSubmit={() => commitSearch(localSearch)}
                  countFor={countFor}
                  onApplyKategorie={handleSelectCategory}
                  onApplyAnwendungen={applyAnwendungen}
                  onApplyMaterials={applyMaterials}
                  onApplyDiam={handleCommitDiam}
                  onApplyPrice={handleCommitPrice}
                  onApplySort={handleSort}
                  hideCategory={!!lockedCategory}
                />
              </div>

              {/* Filter & search — mobile */}
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

              {/* Result count + desktop view toggle */}
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm text-slate-500">
                  {`${filtered.length} Produkt${filtered.length !== 1 ? "e" : ""}`}
                  {totalPages > 1 && ` · Seite ${currentPage} von ${totalPages}`}
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
                  {catKategorieActive && !catSubActive && (
                    <FilterChip
                      label={allCategories.find((c) => c.slug === kategorieParam)?.name ?? kategorieParam}
                      onRemove={removeKategorie}
                    />
                  )}
                  {catSubActive && (
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
                      label={`Ø ${diamMin ?? absoluteMinDiam}–${diamMax ?? absoluteMaxDiam} mm`}
                      onRemove={resetDiamFilter}
                    />
                  )}
                  {(shankMin !== null || shankMax !== null) && (
                    <FilterChip
                      label={`Schaft ${shankMin ?? absoluteMinShank}–${shankMax ?? absoluteMaxShank} mm`}
                      onRemove={resetShankFilter}
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
                <>
                  <div
                    ref={tilesRef}
                    className={[
                      viewParam === "list" ? "flex flex-col gap-3" : "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6",
                      "transition-opacity duration-150",
                      isPending ? "opacity-60 pointer-events-none" : "",
                    ].join(" ")}
                  >
                    {pageCards.map((card) => (
                      <div key={card.slug} className="katalog-tile">
                        <ProductCard card={{ ...card, variant: viewParam === "list" ? "list" : "grid" }} />
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Seiten">
                      <button
                        type="button"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="btn-outline text-sm disabled:opacity-40 disabled:pointer-events-none"
                      >
                        Zurück
                      </button>
                      <span className="text-sm text-slate-500 tabular-nums">
                        Seite {currentPage} von {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="btn-outline text-sm disabled:opacity-40 disabled:pointer-events-none"
                      >
                        Weiter
                      </button>
                    </nav>
                  )}
                </>
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

      <BackToTop />

      <Footer />
    </>
  );
}
