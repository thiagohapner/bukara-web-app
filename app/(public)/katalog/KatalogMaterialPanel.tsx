"use client";

import { useState } from "react";

const SCORE_OPTIONS = [
  { value: 1, label: "Geeignet" },
  { value: 2, label: "Gut geeignet" },
  { value: 3, label: "Sehr gut geeignet" },
];

/** Material multi-select + Mindesteignung radios, with deferred apply. */
export default function KatalogMaterialPanel({
  options, appliedMaterials, appliedMinScore, count, onApply,
}: {
  options: { name: string; count: number }[];
  appliedMaterials: string[];
  appliedMinScore: number;
  count: (materials: string[], minScore: number) => number;
  onApply: (materials: string[], minScore: number) => void;
}) {
  const [materials, setMaterials] = useState<string[]>(appliedMaterials);
  const [minScore, setMinScore] = useState(appliedMinScore);

  function toggle(name: string) {
    setMaterials((prev) => (prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]));
  }

  return (
    <div className="p-4">
      <div className="flex flex-col gap-1 max-h-60 overflow-y-auto -mx-1 px-1">
        {options.map(({ name, count: c }) => (
          <label
            key={name}
            className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-slate-50 cursor-pointer select-none text-sm text-slate-800"
          >
            <input
              type="checkbox"
              checked={materials.includes(name)}
              onChange={() => toggle(name)}
              className="rounded flex-shrink-0"
              style={{ accentColor: "#0F172A" }}
            />
            <span className={materials.includes(name) ? "font-medium" : ""}>{name}</span>
            <span className="text-xs text-slate-400 ml-auto">({c})</span>
          </label>
        ))}
      </div>

      {materials.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-2">Mindesteignung</p>
          <div className="flex flex-col gap-1.5">
            {SCORE_OPTIONS.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer select-none">
                <input
                  type="radio"
                  name="material-minscore"
                  checked={minScore === value}
                  onChange={() => setMinScore(value)}
                  style={{ accentColor: "#0F172A" }}
                />
                <span className={minScore === value ? "font-medium" : ""}>{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => onApply(materials, minScore)}
        className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white rounded-md py-2.5 text-sm font-semibold transition-colors"
      >
        {count(materials, minScore)} Produkte anzeigen
      </button>
    </div>
  );
}
