"use client";

import { useState } from "react";

/** Generic multi-select checkbox panel (Anwendung) with deferred apply. */
export default function KatalogMultiSelectPanel({
  options, applied, count, onApply,
}: {
  options: string[];
  applied: string[];
  count: (selected: string[]) => number;
  onApply: (selected: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(applied);

  function toggle(opt: string) {
    setSelected((prev) => (prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]));
  }

  return (
    <div className="p-4">
      <div className="flex flex-col gap-1 max-h-72 overflow-y-auto -mx-1 px-1">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-slate-50 cursor-pointer select-none text-sm text-slate-800"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
              className="rounded flex-shrink-0"
              style={{ accentColor: "var(--navy)" }}
            />
            <span className={selected.includes(opt) ? "font-medium" : ""}>{opt}</span>
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onApply(selected)}
        className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white rounded-md py-2.5 text-sm font-semibold transition-colors"
      >
        {count(selected)} Produkte anzeigen
      </button>
    </div>
  );
}
