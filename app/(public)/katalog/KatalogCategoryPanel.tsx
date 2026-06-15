"use client";

import { useState } from "react";
import type { V2Category } from "@/lib/v2/types";

/** Parent→sub category tree, single-select, with deferred apply. */
export default function KatalogCategoryPanel({
  categories, appliedKategorie, appliedSub, count, onApply,
}: {
  categories: V2Category[];
  appliedKategorie: string;
  appliedSub: string;
  count: (kategorie: string, sub: string) => number;
  onApply: (kategorie: string, sub: string) => void;
}) {
  const topLevel = categories.filter((c) => c.parent_id === null);
  const subMap: Record<string, V2Category[]> = {};
  for (const c of categories.filter((c) => c.parent_id !== null)) {
    if (!subMap[c.parent_id!]) subMap[c.parent_id!] = [];
    subMap[c.parent_id!].push(c);
  }

  const [kategorie, setKategorie] = useState(appliedKategorie);
  const [sub, setSub] = useState(appliedSub);

  const rowCls = (selected: boolean) =>
    `w-full text-left px-2 py-2 rounded-md text-sm cursor-pointer transition-colors ${
      selected ? "bg-slate-100 font-medium text-slate-900" : "text-slate-700 hover:bg-slate-50"
    }`;

  return (
    <div className="p-4">
      <div className="flex flex-col gap-0.5 max-h-72 overflow-y-auto -mx-1 px-1">
        <button type="button" className={rowCls(!kategorie && !sub)} onClick={() => { setKategorie(""); setSub(""); }}>
          Alle Kategorien
        </button>
        {topLevel.map((parent) => {
          const subs = subMap[parent.id] ?? [];
          return (
            <div key={parent.id}>
              <button
                type="button"
                className={rowCls(kategorie === parent.slug && !sub)}
                onClick={() => { setKategorie(parent.slug); setSub(""); }}
              >
                {parent.name}
              </button>
              {subs.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${rowCls(sub === s.slug)} pl-6`}
                  onClick={() => { setKategorie(parent.slug); setSub(s.slug); }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onApply(kategorie, sub)}
        className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white rounded-md py-2.5 text-sm font-semibold transition-colors"
      >
        {count(kategorie, sub)} Produkte anzeigen
      </button>
    </div>
  );
}
