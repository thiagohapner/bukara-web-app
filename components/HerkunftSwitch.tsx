"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useHerkunft } from "./HerkunftContext";
import type { Herkunft } from "@/lib/pricing";

const LABELS: Record<Herkunft, string> = {
  de: "Deutschland",
  ausland: "Ausland",
};

/**
 * Herkunfts-Schalter im Header: steuert MwSt.-Ausweis und Versandkosten
 * shopweit (Produktseiten, Warenkorb, Checkout). Wahl wird lokal gemerkt.
 */
export default function HerkunftSwitch({ className = "" }: { className?: string }) {
  const { herkunft, setHerkunft } = useHerkunft();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1 hover:underline hover:text-brand-500 transition-[color] duration-[240ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)]"
        style={{ color: "inherit" }}
      >
        <Globe className="w-3.5 h-3.5" strokeWidth={2.5} />
        Lieferung: {LABELS[herkunft]}
        <ChevronDown className="w-3 h-3 flex-shrink-0 transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-50 top-full left-0 mt-2 w-56 bg-white border border-neutral-100 rounded-lg shadow-lg overflow-hidden"
        >
          {(Object.keys(LABELS) as Herkunft[]).map((key) => (
            <button
              key={key}
              type="button"
              role="option"
              aria-selected={herkunft === key}
              onClick={() => { setHerkunft(key); setOpen(false); }}
              className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left text-[13px] font-normal text-slate-900 hover:bg-brand-25 transition-colors"
            >
              {LABELS[key]}
              {herkunft === key && <Check className="w-3.5 h-3.5" style={{ color: "#01A497" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
