"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

type MaterialCount = { name: string; count: number };

interface Props {
  allCategories: Category[];
  materialCounts: MaterialCount[];
  selectedMaterials: string[];
  priceMin: number | null;
  priceMax: number | null;
  absoluteMinPrice: number;
  absoluteMaxPrice: number;
  angebotOnly: boolean;
  onFilterApplied?: () => void;
}

function PriceRangeSlider({
  min, max, valueMin, valueMax, onChange, onCommit,
}: {
  min: number; max: number;
  valueMin: number; valueMax: number;
  onChange: (min: number, max: number) => void;
  onCommit: (min: number, max: number) => void;
}) {
  const range = max - min || 1;
  const leftPct = ((valueMin - min) / range) * 100;
  const rightPct = ((max - valueMax) / range) * 100;

  return (
    <div className="relative h-5 mx-1">
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-neutral-200 rounded-full" />
      <div
        className="absolute top-1/2 -translate-y-1/2 h-1 bg-slate-900 rounded-full"
        style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
      />
      <input
        type="range" min={min} max={max} value={valueMin}
        onChange={e => {
          const v = Math.min(Number(e.target.value), valueMax - 1);
          onChange(v, valueMax);
        }}
        onMouseUp={() => onCommit(valueMin, valueMax)}
        onTouchEnd={() => onCommit(valueMin, valueMax)}
        className="absolute w-full h-full opacity-0 cursor-pointer"
        style={{ zIndex: valueMin > max - 10 ? 5 : 3 }}
      />
      <input
        type="range" min={min} max={max} value={valueMax}
        onChange={e => {
          const v = Math.max(Number(e.target.value), valueMin + 1);
          onChange(valueMin, v);
        }}
        onMouseUp={() => onCommit(valueMin, valueMax)}
        onTouchEnd={() => onCommit(valueMin, valueMax)}
        className="absolute w-full h-full opacity-0 cursor-pointer"
        style={{ zIndex: 4 }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-900 border-2 border-white rounded-full shadow-sm pointer-events-none"
        style={{ left: `calc(${leftPct}% - 8px)` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-900 border-2 border-white rounded-full shadow-sm pointer-events-none"
        style={{ right: `calc(${rightPct}% - 8px)` }}
      />
    </div>
  );
}

export default function FilterSidebar({
  allCategories, materialCounts, selectedMaterials,
  priceMin, priceMax, absoluteMinPrice, absoluteMaxPrice,
  angebotOnly, onFilterApplied,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const currentKategorie = params.get("kategorie") ?? "";
  const currentSub = params.get("sub") ?? "";

  const topLevel = allCategories.filter((c) => c.parent_id === null);
  const subMap: Record<string, Category[]> = {};
  for (const c of allCategories.filter((c) => c.parent_id !== null)) {
    if (!subMap[c.parent_id!]) subMap[c.parent_id!] = [];
    subMap[c.parent_id!].push(c);
  }

  const initialExpanded = (() => {
    if (currentSub) {
      const sub = allCategories.find((c) => c.slug === currentSub);
      return sub?.parent_id ?? null;
    }
    if (currentKategorie) {
      const parent = topLevel.find((c) => c.slug === currentKategorie);
      return parent?.id ?? null;
    }
    return null;
  })();

  const [expandedId, setExpandedId] = useState<string | null>(initialExpanded);
  const [localPriceMin, setLocalPriceMin] = useState(priceMin ?? absoluteMinPrice);
  const [localPriceMax, setLocalPriceMax] = useState(priceMax ?? absoluteMaxPrice);

  useEffect(() => {
    const sub = allCategories.find((c) => c.slug === currentSub);
    if (sub?.parent_id) { setExpandedId(sub.parent_id); return; }
    const parent = topLevel.find((c) => c.slug === currentKategorie);
    if (parent) setExpandedId(parent.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKategorie, currentSub]);

  useEffect(() => {
    setLocalPriceMin(priceMin ?? absoluteMinPrice);
    setLocalPriceMax(priceMax ?? absoluteMaxPrice);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceMin, priceMax, absoluteMinPrice, absoluteMaxPrice]);

  function buildUrl(newParams: Record<string, string | null>) {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(newParams)) {
      if (v === null) p.delete(k);
      else p.set(k, v);
    }
    return `/produkte?${p.toString()}`;
  }

  function selectParent(cat: Category) {
    setExpandedId(expandedId === cat.id ? null : cat.id);
  }

  function selectSub(parent: Category, sub: Category) {
    router.push(buildUrl({ kategorie: parent.slug, sub: sub.slug }));
    onFilterApplied?.();
  }

  function toggleMaterial(name: string) {
    const next = selectedMaterials.includes(name)
      ? selectedMaterials.filter((m) => m !== name)
      : [...selectedMaterials, name];
    router.push(buildUrl({ material: next.length > 0 ? next.join(",") : null }));
    onFilterApplied?.();
  }

  function commitPrice(min: number, max: number) {
    const p = new URLSearchParams(params.toString());
    if (min > absoluteMinPrice) p.set("priceMin", String(min)); else p.delete("priceMin");
    if (max < absoluteMaxPrice) p.set("priceMax", String(max)); else p.delete("priceMax");
    router.push(`/produkte?${p.toString()}`);
    onFilterApplied?.();
  }

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide mb-3">{children}</p>
  );

  return (
    <div>
      {/* Headline */}
      <p className="text-base font-semibold text-slate-900 mb-4">Kategorien & Filter</p>

      {/* KATEGORIEN — matches ProductAccordion exactly */}
      <div className="border-t border-neutral-100">
        {topLevel.map((parent) => {
          const subs = subMap[parent.id] ?? [];
          const isExpanded = expandedId === parent.id;

          return (
            <div key={parent.id} className="border-b border-neutral-100">
              <button
                type="button"
                onClick={() => selectParent(parent)}
                className="w-full flex items-center justify-between py-4 text-left cursor-pointer"
              >
                <span className="text-base text-slate-900">{parent.name}</span>
                <span className="text-xl leading-none text-slate-900 select-none w-5 text-center">
                  {isExpanded ? "−" : "+"}
                </span>
              </button>

              <div
                style={{
                  display: "grid",
                  gridTemplateRows: isExpanded ? "1fr" : "0fr",
                  transition: "grid-template-rows 250ms ease-in-out",
                }}
              >
                <div style={{ overflow: "hidden" }}>
                  <div className="pb-2">
                    {subs.map((sub) => {
                      const isSubActive = currentSub === sub.slug;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => selectSub(parent, sub)}
                          className={`w-full text-left py-2 text-sm cursor-pointer transition-colors ${
                            isSubActive
                              ? "font-semibold text-slate-900 border-l-2 border-slate-900 pl-[18px]"
                              : "text-neutral-500 hover:text-slate-800 pl-5"
                          }`}
                        >
                          {sub.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PREIS */}
      {absoluteMaxPrice > absoluteMinPrice && (
        <div className="border-b border-neutral-100 py-4">
          <SectionLabel>Preis: {localPriceMin} € – {localPriceMax} €</SectionLabel>
          <PriceRangeSlider
            min={absoluteMinPrice}
            max={absoluteMaxPrice}
            valueMin={localPriceMin}
            valueMax={localPriceMax}
            onChange={(min, max) => { setLocalPriceMin(min); setLocalPriceMax(max); }}
            onCommit={commitPrice}
          />
        </div>
      )}

      {/* IM ANGEBOT */}
      <div className="border-b border-neutral-100 py-4">
        <label className="flex items-center gap-2.5 text-base text-slate-900 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={angebotOnly}
            onChange={(e) => {
              router.push(buildUrl({ angebot: e.target.checked ? "1" : null }));
              onFilterApplied?.();
            }}
            className="rounded flex-shrink-0"
            style={{ accentColor: "var(--color-ink)" }}
          />
          Im Angebot
        </label>
      </div>

      {/* GEEIGNET FÜR */}
      <div className="py-4">
        <SectionLabel>Geeignet für</SectionLabel>
        <div className="flex flex-col gap-2.5">
          {materialCounts.map(({ name, count }) => (
            <label key={name} className="flex items-center gap-2 text-base text-slate-900 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedMaterials.includes(name)}
                onChange={() => toggleMaterial(name)}
                className="rounded flex-shrink-0"
                style={{ accentColor: "var(--color-ink)" }}
              />
              <span className={selectedMaterials.includes(name) ? "font-medium" : ""}>{name}</span>
              <span className="text-sm text-neutral-400 ml-auto">({count})</span>
            </label>
          ))}
          {materialCounts.length === 0 && (
            <p className="text-sm text-neutral-400">Keine Materialien verfügbar</p>
          )}
        </div>
      </div>
    </div>
  );
}
