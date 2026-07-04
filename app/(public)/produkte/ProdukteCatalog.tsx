"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SlidersHorizontal, X } from "lucide-react";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import DealsPromo from "@/components/DealsPromo";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";
import CustomSelect from "@/components/CustomSelect";
import FilterSidebar from "./FilterSidebar";
import { DS_INPUT } from "@/lib/ds";

gsap.registerPlugin(ScrollTrigger);

type Category = { id: string; name: string; slug: string; parent_id: string | null };
type ProductMaterial = { product_id: string; material_name: string; suitability: string };
type ProductCategoryRow = { product_id: string; category_id: string };

type EnrichedCard = ProductCardData & {
  id: string;
  categoryIds: string[];
  materials: ProductMaterial[];
  fromOriginalPrice?: number;
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

export default function ProdukteCatalog() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tilesRef = useRef<HTMLDivElement>(null);
  const isFirstSearchRender = useRef(true);

  const [allCards, setAllCards] = useState<EnrichedCard[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // URL params
  const kategorieParam = searchParams.get("kategorie") ?? "";
  const subParam = searchParams.get("sub") ?? "";
  const materialParam = searchParams.get("material") ?? "";
  const sortParam = searchParams.get("sort") ?? "";
  const searchQuery = searchParams.get("q") ?? "";
  const priceMinParam = searchParams.get("priceMin");
  const priceMaxParam = searchParams.get("priceMax");
  const angebotParam = searchParams.get("angebot");
  const priceMin = priceMinParam ? Number(priceMinParam) : null;
  const priceMax = priceMaxParam ? Number(priceMaxParam) : null;
  const angebotOnly = angebotParam === "1";
  const selectedMaterials = materialParam ? materialParam.split(",").filter(Boolean) : [];

  // Local search bar state (debounced to URL)
  const [localSearch, setLocalSearch] = useState(searchQuery);
  useEffect(() => { setLocalSearch(searchQuery); }, [searchQuery]);
  useEffect(() => {
    if (isFirstSearchRender.current) { isFirstSearchRender.current = false; return; }
    const t = setTimeout(() => {
      const p = new URLSearchParams(searchParams.toString());
      if (localSearch) p.set("q", localSearch); else p.delete("q");
      router.push(`/produkte?${p.toString()}`);
    }, 350);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  // ── Data load ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: products } = await supabase
        .from("products")
        .select("id, slug, name, badge, gallery_bg, has_variants")
        .eq("has_public_page", true)
        .eq("is_active", true)
        .order("sort_order");

      if (!products || products.length === 0) { setLoaded(true); return; }

      const ids = products.map((p: { id: string }) => p.id);

      const [
        { data: images },
        { data: skus },
        { data: productCategories },
        { data: productMaterials },
        { data: categories },
      ] = await Promise.all([
        supabase.from("product_images").select("product_id, image_url").in("product_id", ids).order("sort_order"),
        supabase.from("skus").select("product_id, price, campaign_price").in("product_id", ids).eq("is_active", true),
        supabase.from("product_categories").select("product_id, category_id").in("product_id", ids),
        supabase.from("product_materials").select("product_id, material_name, suitability").in("product_id", ids),
        supabase.from("categories").select("id, name, slug, parent_id").eq("is_active", true).order("sort_order"),
      ]);

      const firstImage: Record<string, string> = {};
      for (const img of (images ?? []) as Array<{ product_id: string; image_url: string }>) {
        if (!firstImage[img.product_id]) firstImage[img.product_id] = img.image_url;
      }

      const minPrices: Record<string, { campaign: number; original: number }> = {};
      for (const sku of (skus ?? []) as Array<{ product_id: string; price: number; campaign_price: number | null }>) {
        const c = sku.campaign_price ?? sku.price;
        const o = sku.price;
        if (!minPrices[sku.product_id] || c < minPrices[sku.product_id].campaign) {
          minPrices[sku.product_id] = { campaign: c, original: o };
        }
      }

      const catMap: Record<string, string[]> = {};
      for (const pc of (productCategories ?? []) as ProductCategoryRow[]) {
        if (!catMap[pc.product_id]) catMap[pc.product_id] = [];
        catMap[pc.product_id].push(pc.category_id);
      }

      const matMap: Record<string, ProductMaterial[]> = {};
      for (const pm of (productMaterials ?? []) as ProductMaterial[]) {
        if (!matMap[pm.product_id]) matMap[pm.product_id] = [];
        matMap[pm.product_id].push(pm);
      }

      const cards: EnrichedCard[] = products.map((p: {
        id: string; slug: string; name: string; badge: string | null;
        gallery_bg: string | null; has_variants: boolean | null;
      }) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        badge: p.badge ?? undefined,
        image: firstImage[p.id],
        galleryBg: p.gallery_bg ?? "#e6eff5",
        hasVariants: p.has_variants ?? false,
        fromCampaignPrice: minPrices[p.id]?.campaign,
        fromOriginalPrice: minPrices[p.id]?.original,
        categoryIds: catMap[p.id] ?? [],
        materials: matMap[p.id] ?? [],
      }));

      setAllCards(cards);
      setAllCategories((categories ?? []) as Category[]);
      setLoaded(true);
    }
    load();
  }, []);

  // ── Absolute price bounds ─────────────────────────────────────────────────
  const absoluteMinPrice = allCards.length > 0
    ? Math.floor(Math.min(...allCards.map((c) => c.fromCampaignPrice ?? 0)))
    : 0;
  const absoluteMaxPrice = allCards.length > 0
    ? Math.ceil(Math.max(...allCards.map((c) => c.fromCampaignPrice ?? 0)))
    : 999;

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

    if (selectedMaterials.length > 0) {
      result = result.filter((c) =>
        selectedMaterials.some((m) =>
          c.materials.some((pm) => pm.material_name === m && pm.suitability !== "nicht geeignet")
        )
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }

    if (priceMin !== null) result = result.filter((c) => (c.fromCampaignPrice ?? 0) >= priceMin);
    if (priceMax !== null) result = result.filter((c) => (c.fromCampaignPrice ?? 0) <= priceMax);

    if (angebotOnly) {
      result = result.filter(
        (c) => c.fromCampaignPrice !== undefined && c.fromOriginalPrice !== undefined && c.fromCampaignPrice < c.fromOriginalPrice
      );
    }

    if (sortParam === "preis-asc") result.sort((a, b) => (a.fromCampaignPrice ?? 0) - (b.fromCampaignPrice ?? 0));
    else if (sortParam === "preis-desc") result.sort((a, b) => (b.fromCampaignPrice ?? 0) - (a.fromCampaignPrice ?? 0));
    else if (sortParam === "name-az") result.sort((a, b) => a.name.localeCompare(b.name, "de"));

    return result;
  })();

  // ── Material counts (category-filtered, before material filter) ───────────
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
        if (pm.suitability !== "nicht geeignet" && !seen.has(pm.material_name)) {
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
      const tiles = gsap.utils.toArray<HTMLElement>(".product-tile");
      gsap.from(tiles, {
        opacity: 0, y: 20, duration: 0.5, stagger: 0.07, ease: "power3.out",
        scrollTrigger: { trigger: tilesRef.current, start: "top 90%" },
      });
    });
    return () => ctx.revert();
  }, [loaded, filtered.length]);

  function pushParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    router.push(`/produkte?${p.toString()}`);
  }

  function resetFilters() {
    router.push("/produkte");
  }

  function resetPriceFilter() {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("priceMin");
    p.delete("priceMax");
    router.push(`/produkte?${p.toString()}`);
  }

  const hasActiveFilters = !!(kategorieParam || subParam || materialParam || searchQuery || priceMinParam || priceMaxParam || angebotParam);
  const activeFilterCount =
    (kategorieParam && !subParam ? 1 : 0) +
    (subParam ? 1 : 0) +
    selectedMaterials.length +
    (searchQuery ? 1 : 0) +
    (priceMinParam || priceMaxParam ? 1 : 0) +
    (angebotOnly ? 1 : 0);

  const sidebarProps = {
    allCategories,
    materialCounts,
    selectedMaterials,
    priceMin,
    priceMax,
    absoluteMinPrice,
    absoluteMaxPrice,
    angebotOnly,
  };

  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Produkte</span>
          </nav>
        </div>

        {/* Deals promo */}
        <section className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-10">
          <DealsPromo variant="full" />
        </section>

        {/* Two-column layout */}
        <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10 pb-20">
          <div className="flex gap-10 items-start">

            {/* Sidebar — desktop only */}
            <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-20">
              <FilterSidebar {...sidebarProps} />
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

              {/* Search + Sort bar */}
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
                    <FilterChip
                      label={`"${searchQuery}"`}
                      onRemove={() => pushParam("q", "")}
                    />
                  )}
                  {(priceMinParam || priceMaxParam) && (
                    <FilterChip
                      label={`${priceMin ?? absoluteMinPrice}–${priceMax ?? absoluteMaxPrice} €`}
                      onRemove={resetPriceFilter}
                    />
                  )}
                  {angebotOnly && (
                    <FilterChip
                      label="Im Angebot"
                      onRemove={() => pushParam("angebot", "")}
                    />
                  )}
                </div>
              )}

              {/* Product grid */}
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
                    <div key={card.slug} className="product-tile h-full">
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
              <FilterSidebar {...sidebarProps} onFilterApplied={() => setDrawerOpen(false)} />
            </div>
          </div>
        </>
      )}

      <Footer />
    </>
  );
}
