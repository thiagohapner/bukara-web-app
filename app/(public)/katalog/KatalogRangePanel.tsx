"use client";

import { useState } from "react";
import RangeSlider from "./KatalogRangeSlider";

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

  return (
    <div className="p-4">
      <p className="text-sm font-medium text-slate-900 mb-3">
        {min} – {max} {unit}
      </p>
      <RangeSlider
        min={absMin}
        max={absMax}
        valueMin={min}
        valueMax={max}
        onChange={(lo, hi) => { setMin(lo); setMax(hi); }}
        onCommit={() => {}}
      />
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
