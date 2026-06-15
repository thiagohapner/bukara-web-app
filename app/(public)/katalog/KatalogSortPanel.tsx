"use client";

const SORT_OPTIONS = [
  { value: "", label: "Beliebtheit" },
  { value: "preis-asc", label: "Preis aufsteigend" },
  { value: "preis-desc", label: "Preis absteigend" },
  { value: "name-az", label: "Name A–Z" },
];

export { SORT_OPTIONS };

/** Sort options; applies immediately on selection (no count button). */
export default function KatalogSortPanel({
  value, onApply,
}: {
  value: string;
  onApply: (value: string) => void;
}) {
  return (
    <div className="p-2">
      {SORT_OPTIONS.map(({ value: v, label }) => (
        <button
          key={v}
          type="button"
          onClick={() => onApply(v)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
            value === v ? "bg-slate-100 font-medium text-slate-900" : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
