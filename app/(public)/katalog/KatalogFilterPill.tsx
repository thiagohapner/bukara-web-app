"use client";

import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

/** A filter pill button with an absolute popover panel; closes on outside-click / Escape. */
export default function KatalogFilterPill({
  label,
  active = false,
  badge,
  open,
  onToggle,
  onClose,
  align = "left",
  children,
}: {
  label: React.ReactNode;
  active?: boolean;
  badge?: number;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  align?: "left" | "right";
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-pill border text-sm font-medium transition-colors ${
          active
            ? "border-teal-500 bg-teal-50 text-teal-700"
            : open
              ? "border-slate-400 bg-white text-slate-900"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
        }`}
      >
        <span>{label}</span>
        {badge ? (
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-teal-600 text-white text-[11px] font-bold">
            {badge}
          </span>
        ) : null}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className={`absolute top-full mt-2 z-30 w-72 bg-white border border-slate-200 rounded-lg shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
