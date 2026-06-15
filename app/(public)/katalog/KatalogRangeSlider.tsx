"use client";

/** Dual-handle range slider used by both the mobile sidebar and the desktop filter panels. */
export default function KatalogRangeSlider({
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
