"use client";

import { useState, useEffect } from "react";
import type { V2Category } from "@/lib/v2/types";

type MaterialCount = { name: string; count: number };

interface Props {
  allCategories: V2Category[];
  materialCounts: MaterialCount[];
  applicationTags: string[];
  selectedMaterials: string[];
  selectedAnwendungen: string[];
  currentKategorie: string;
  currentSub: string;
  minScore: number;
  priceMin: number | null;
  priceMax: number | null;
  absoluteMinPrice: number;
  absoluteMaxPrice: number;
  diamMin: number | null;
  diamMax: number | null;
  absoluteMinDiam: number;
  absoluteMaxDiam: number;
  shankMin: number | null;
  shankMax: number | null;
  absoluteMinShank: number;
  absoluteMaxShank: number;
  onFilterApplied?: () => void;
  sort?: string;
  onSortChange?: (v: string) => void;
  view?: string;
  onViewChange?: (v: string) => void;
  onSelectCategory: (parentSlug: string, subSlug: string) => void;
  onToggleMaterial: (name: string) => void;
  onToggleAnwendung: (tag: string) => void;
  onSetMinScore: (score: number) => void;
  onCommitPrice: (min: number, max: number) => void;
  onCommitDiam: (min: number, max: number) => void;
  onCommitShank: (min: number, max: number) => void;
  onResetAnwendung: () => void;
}

function RangeSlider({
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
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full" />
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

export default function KatalogFilterSidebar({
  allCategories, materialCounts, applicationTags, selectedMaterials, selectedAnwendungen,
  currentKategorie, currentSub, minScore,
  priceMin, priceMax, absoluteMinPrice, absoluteMaxPrice,
  diamMin, diamMax, absoluteMinDiam, absoluteMaxDiam,
  shankMin, shankMax, absoluteMinShank, absoluteMaxShank,
  onFilterApplied, sort, onSortChange, view, onViewChange,
  onSelectCategory, onToggleMaterial, onToggleAnwendung, onSetMinScore,
  onCommitPrice, onCommitDiam, onCommitShank, onResetAnwendung,
}: Props) {
  const topLevel = allCategories.filter((c) => c.parent_id === null);
  const subMap: Record<string, V2Category[]> = {};
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
  const [localDiamMin, setLocalDiamMin] = useState(diamMin ?? absoluteMinDiam);
  const [localDiamMax, setLocalDiamMax] = useState(diamMax ?? absoluteMaxDiam);
  const [localShankMin, setLocalShankMin] = useState(shankMin ?? absoluteMinShank);
  const [localShankMax, setLocalShankMax] = useState(shankMax ?? absoluteMaxShank);

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

  useEffect(() => {
    setLocalDiamMin(diamMin ?? absoluteMinDiam);
    setLocalDiamMax(diamMax ?? absoluteMaxDiam);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diamMin, diamMax, absoluteMinDiam, absoluteMaxDiam]);

  useEffect(() => {
    setLocalShankMin(shankMin ?? absoluteMinShank);
    setLocalShankMax(shankMax ?? absoluteMaxShank);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shankMin, shankMax, absoluteMinShank, absoluteMaxShank]);

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-3">{children}</p>
  );

  return (
    <div>
      <p className="text-base font-semibold text-slate-900 mb-4">Kategorien & Filter</p>

      {/* SORTIEREN — shown only in mobile drawer */}
      {onSortChange && (
        <div className="border-b border-slate-100 pb-4 mb-0">
          <SectionLabel>Sortieren</SectionLabel>
          <div className="flex flex-col gap-2">
            {[
              { value: "", label: "Standard" },
              { value: "preis-asc", label: "Preis aufsteigend" },
              { value: "preis-desc", label: "Preis absteigend" },
              { value: "name-az", label: "Name A–Z" },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 text-base text-slate-900 cursor-pointer select-none">
                <input
                  type="radio"
                  name="sort"
                  checked={(sort ?? "") === value}
                  onChange={() => onSortChange(value)}
                  className="flex-shrink-0"
                  style={{ accentColor: "#0F172A" }}
                />
                <span className={(sort ?? "") === value ? "font-medium" : ""}>{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ANSICHT */}
      {onViewChange && (
        <div className="border-b border-slate-100 pb-4 mb-0">
          <SectionLabel>Ansicht</SectionLabel>
          <div className="flex flex-col gap-2">
            {[
              { value: "", label: "Raster" },
              { value: "list", label: "Liste" },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 text-base text-slate-900 cursor-pointer select-none">
                <input
                  type="radio"
                  name="view"
                  checked={(view ?? "") === value}
                  onChange={() => onViewChange(value)}
                  className="flex-shrink-0"
                  style={{ accentColor: "#0F172A" }}
                />
                <span className={(view ?? "") === value ? "font-medium" : ""}>{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* KATEGORIEN */}
      <div className="border-t border-slate-100">
        {topLevel.map((parent) => {
          const subs = subMap[parent.id] ?? [];
          const isExpanded = expandedId === parent.id;

          return (
            <div key={parent.id} className="border-b border-slate-100">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : parent.id)}
                className="w-full flex items-center justify-between py-4 text-left cursor-pointer"
              >
                <span className="text-base text-slate-900">{parent.name}</span>
                <span className="text-xl leading-none text-slate-900 select-none w-5 text-center">
                  {isExpanded ? "−" : "+"}
                </span>
              </button>

              <div style={{ display: "grid", gridTemplateRows: isExpanded ? "1fr" : "0fr", transition: "grid-template-rows 250ms ease-in-out" }}>
                <div style={{ overflow: "hidden" }}>
                  <div className="pb-2">
                    {subs.map((sub) => {
                      const isActive = currentSub === sub.slug;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => { onSelectCategory(parent.slug, sub.slug); onFilterApplied?.(); }}
                          className={`w-full text-left py-2 text-sm cursor-pointer transition-colors ${
                            isActive
                              ? "font-semibold text-slate-900 border-l-2 border-slate-900 pl-[18px]"
                              : "text-slate-500 hover:text-slate-800 pl-5"
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

      {/* ANWENDUNG */}
      {applicationTags.length > 0 && (
        <div className="border-b border-slate-100 py-4">
          <SectionLabel>Anwendung</SectionLabel>
          <div className="flex flex-col gap-2">
            {applicationTags.map((tag) => (
              <label key={tag} className="flex items-center gap-2 text-base text-slate-900 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedAnwendungen.includes(tag)}
                  onChange={() => { onToggleAnwendung(tag); onFilterApplied?.(); }}
                  className="rounded flex-shrink-0"
                  style={{ accentColor: "#0F172A" }}
                />
                <span className={selectedAnwendungen.includes(tag) ? "font-medium" : ""}>{tag}</span>
              </label>
            ))}
            {selectedAnwendungen.length > 0 && (
              <button
                type="button"
                onClick={() => { onResetAnwendung(); onFilterApplied?.(); }}
                className="text-xs text-slate-400 hover:text-slate-600 text-left mt-0.5"
              >
                Zurücksetzen
              </button>
            )}
          </div>
        </div>
      )}

      {/* DURCHMESSER */}
      {absoluteMaxDiam > absoluteMinDiam && (
        <div className="border-b border-slate-100 py-4">
          <SectionLabel>
            Durchmesser: {localDiamMin} – {localDiamMax} mm
          </SectionLabel>
          <RangeSlider
            min={absoluteMinDiam}
            max={absoluteMaxDiam}
            valueMin={localDiamMin}
            valueMax={localDiamMax}
            onChange={(min, max) => { setLocalDiamMin(min); setLocalDiamMax(max); }}
            onCommit={(min, max) => { onCommitDiam(min, max); onFilterApplied?.(); }}
          />
        </div>
      )}

      {/* SCHAFTDURCHMESSER */}
      {absoluteMaxShank > absoluteMinShank && (
        <div className="border-b border-slate-100 py-4">
          <SectionLabel>
            Schaftdurchmesser: {localShankMin} – {localShankMax} mm
          </SectionLabel>
          <RangeSlider
            min={absoluteMinShank}
            max={absoluteMaxShank}
            valueMin={localShankMin}
            valueMax={localShankMax}
            onChange={(min, max) => { setLocalShankMin(min); setLocalShankMax(max); }}
            onCommit={(min, max) => { onCommitShank(min, max); onFilterApplied?.(); }}
          />
        </div>
      )}

      {/* PREIS */}
      {absoluteMaxPrice > absoluteMinPrice && (
        <div className="border-b border-slate-100 py-4">
          <SectionLabel>Preis: {localPriceMin} € – {localPriceMax} €</SectionLabel>
          <RangeSlider
            min={absoluteMinPrice}
            max={absoluteMaxPrice}
            valueMin={localPriceMin}
            valueMax={localPriceMax}
            onChange={(min, max) => { setLocalPriceMin(min); setLocalPriceMax(max); }}
            onCommit={(min, max) => { onCommitPrice(min, max); onFilterApplied?.(); }}
          />
        </div>
      )}

      {/* GEEIGNET FÜR */}
      {materialCounts.length > 0 && (
        <div className="border-b border-slate-100 py-4">
          <SectionLabel>Geeignet für</SectionLabel>
          <div className="flex flex-col gap-2.5">
            {materialCounts.map(({ name, count }) => (
              <label key={name} className="flex items-center gap-2 text-base text-slate-900 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedMaterials.includes(name)}
                  onChange={() => { onToggleMaterial(name); onFilterApplied?.(); }}
                  className="rounded flex-shrink-0"
                  style={{ accentColor: "#0F172A" }}
                />
                <span className={selectedMaterials.includes(name) ? "font-medium" : ""}>{name}</span>
                <span className="text-sm text-slate-400 ml-auto">({count})</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* MINDESTEIGNUNG */}
      {selectedMaterials.length > 0 && (
        <div className="py-4">
          <SectionLabel>Mindesteignung</SectionLabel>
          <div className="flex flex-col gap-2">
            {[
              { value: 1, label: "Geeignet" },
              { value: 2, label: "Gut geeignet" },
              { value: 3, label: "Sehr gut geeignet" },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 text-base text-slate-900 cursor-pointer select-none">
                <input
                  type="radio"
                  name="minScore"
                  checked={minScore === value}
                  onChange={() => { onSetMinScore(value); onFilterApplied?.(); }}
                  className="flex-shrink-0"
                  style={{ accentColor: "#0F172A" }}
                />
                <span className={minScore === value ? "font-medium" : ""}>{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
