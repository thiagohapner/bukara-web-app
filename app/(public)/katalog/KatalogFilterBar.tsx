"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { DS_INPUT } from "@/lib/ds";
import type { V2Category } from "@/lib/v2/types";
import type { KatalogFilterState } from "@/lib/katalog/filter";
import KatalogFilterPill from "./KatalogFilterPill";
import KatalogRangePanel from "./KatalogRangePanel";
import KatalogMultiSelectPanel from "./KatalogMultiSelectPanel";
import KatalogMaterialPanel from "./KatalogMaterialPanel";
import KatalogCategoryPanel from "./KatalogCategoryPanel";
import KatalogSortPanel, { SORT_OPTIONS } from "./KatalogSortPanel";

interface Bounds {
  price: [number, number];
  diam: [number, number];
  shank: [number, number];
}

interface Props {
  state: KatalogFilterState;
  allCategories: V2Category[];
  materialCounts: { name: string; count: number }[];
  applicationTags: string[];
  bounds: Bounds;
  searchValue: string;
  onSearchInput: (v: string) => void;
  onSearchSubmit: () => void;
  countFor: (patch: Partial<KatalogFilterState>) => number;
  onApplyKategorie: (kategorie: string, sub: string) => void;
  onApplyAnwendungen: (tags: string[]) => void;
  onApplyMaterials: (materials: string[], minScore: number) => void;
  onApplyDiam: (min: number, max: number) => void;
  onApplyPrice: (min: number, max: number) => void;
  onApplySort: (value: string) => void;
  /** Hide the Kategorie pill (e.g. on /sortiment pages where category is fixed by the URL). */
  hideCategory?: boolean;
}

export default function KatalogFilterBar({
  state, allCategories, materialCounts, applicationTags, bounds,
  searchValue, onSearchInput, onSearchSubmit, countFor,
  onApplyKategorie, onApplyAnwendungen, onApplyMaterials,
  onApplyDiam, onApplyPrice, onApplySort, hideCategory = false,
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));
  const close = () => setOpenId(null);
  const applyAnd = <T extends unknown[]>(fn: (...a: T) => void) => (...a: T) => { fn(...a); close(); };

  const priceActive = state.priceMin !== null || state.priceMax !== null;
  const diamActive = state.diamMin !== null || state.diamMax !== null;
  const katActive = !!(state.kategorie || state.sub);
  const sortLabel = SORT_OPTIONS.find((o) => o.value === state.sort)?.label ?? "Beliebtheit";

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {/* Search */}
      <form
        onSubmit={(e) => { e.preventDefault(); onSearchSubmit(); }}
        className="relative w-full sm:w-60 flex-shrink-0 sm:mr-6"
      >
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchInput(e.target.value)}
          placeholder="Suchen…"
          className={`${DS_INPUT} !pl-9 !py-2.5`}
        />
      </form>

      {!hideCategory && (
        <KatalogFilterPill label="Kategorie" active={katActive} open={openId === "kategorie"} onToggle={() => toggle("kategorie")} onClose={close}>
          <KatalogCategoryPanel
            categories={allCategories}
            appliedKategorie={state.kategorie} appliedSub={state.sub}
            count={(kat, sub) => countFor({ kategorie: kat, sub })}
            onApply={applyAnd(onApplyKategorie)}
          />
        </KatalogFilterPill>
      )}

      <KatalogFilterPill label="Durchmesser" active={diamActive} open={openId === "durchmesser"} onToggle={() => toggle("durchmesser")} onClose={close}>
        <KatalogRangePanel
          absMin={bounds.diam[0]} absMax={bounds.diam[1]}
          appliedMin={state.diamMin} appliedMax={state.diamMax} unit="mm"
          count={(min, max) => countFor({ diamMin: min, diamMax: max })}
          onApply={applyAnd(onApplyDiam)}
        />
      </KatalogFilterPill>

      <KatalogFilterPill label="Anwendung" active={state.anwendungen.length > 0} badge={state.anwendungen.length || undefined} open={openId === "anwendung"} onToggle={() => toggle("anwendung")} onClose={close}>
        <KatalogMultiSelectPanel
          options={applicationTags} applied={state.anwendungen}
          count={(sel) => countFor({ anwendungen: sel })}
          onApply={applyAnd(onApplyAnwendungen)}
        />
      </KatalogFilterPill>

      <KatalogFilterPill label="Material" active={state.materials.length > 0} badge={state.materials.length || undefined} open={openId === "material"} onToggle={() => toggle("material")} onClose={close}>
        <KatalogMaterialPanel
          options={materialCounts} appliedMaterials={state.materials} appliedMinScore={state.minScore}
          count={(materials, minScore) => countFor({ materials, minScore })}
          onApply={applyAnd(onApplyMaterials)}
        />
      </KatalogFilterPill>

      <KatalogFilterPill label="Preis" active={priceActive} open={openId === "preis"} onToggle={() => toggle("preis")} onClose={close}>
        <KatalogRangePanel
          absMin={bounds.price[0]} absMax={bounds.price[1]}
          appliedMin={state.priceMin} appliedMax={state.priceMax} unit="€"
          count={(min, max) => countFor({ priceMin: min, priceMax: max })}
          onApply={applyAnd(onApplyPrice)}
        />
      </KatalogFilterPill>

      {/* Sort — far right */}
      <div className="ml-auto">
        <KatalogFilterPill
          label={<>Sortieren nach <span className="font-semibold">{sortLabel}</span></>}
          open={openId === "sort"} onToggle={() => toggle("sort")} onClose={close} align="right"
        >
          <KatalogSortPanel value={state.sort} onApply={applyAnd(onApplySort)} />
        </KatalogFilterPill>
      </div>
    </div>
  );
}
