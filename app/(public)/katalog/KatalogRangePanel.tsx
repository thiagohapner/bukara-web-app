"use client";

import { useState } from "react";
import RangeSlider from "./KatalogRangeSlider";

function clamp(value: number, lo: number, hi: number) {
  return Math.min(Math.max(value, lo), hi);
}

/** Range filter panel (Preis / Durchmesser / Schaftdurchmesser) with deferred apply. */
export default function KatalogRangePanel({
  absMin, absMax, appliedMin, appliedMax, unit, count, onApply,
}: {
  absMin: number; absMax: number;
  appliedMin: number | null; appliedMax: number | null;
  unit: string;
  count: (min: number, max: number) => number;
  onApply: (min: number, max: number) => void;
}) {
  const [min, setMin] = useState(appliedMin ?? absMin);
  const [max, setMax] = useState(appliedMax ?? absMax);

  function commitMin(raw: number) {
    const v = clamp(raw, absMin, max - 1);
    setMin(v);
    onApply(v, max);
  }

  function commitMax(raw: number) {
    const v = clamp(raw, min + 1, absMax);
    setMax(v);
    onApply(min, v);
  }

  return (
    <div className="p-4">
      <RangeSlider
        min={absMin}
        max={absMax}
        valueMin={min}
        valueMax={max}
        onChange={(lo, hi) => { setMin(lo); setMax(hi); }}
        onCommit={() => {}}
      />
      <div className="flex items-center gap-2 mt-3">
        <input
          type="number"
          value={min}
          min={absMin}
          max={max - 1}
          step={0.5}
          onChange={e => setMin(Number(e.target.value))}
          onBlur={e => commitMin(Number(e.target.value))}
          onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}
          className="w-20 border border-slate-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:border-slate-400"
        />
        <span className="text-slate-400 text-sm">–</span>
        <input
          type="number"
          value={max}
          min={min + 1}
          max={absMax}
          step={0.5}
          onChange={e => setMax(Number(e.target.value))}
          onBlur={e => commitMax(Number(e.target.value))}
          onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}
          className="w-20 border border-slate-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:border-slate-400"
        />
        <span className="text-slate-400 text-sm">{unit}</span>
      </div>
      <button
        type="button"
        onClick={() => onApply(min, max)}
        className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white rounded-md py-2.5 text-sm font-semibold transition-colors"
      >
        {count(min, max)} Produkte anzeigen
      </button>
    </div>
  );
}
