"use client";

import { useHerkunft } from "./HerkunftContext";

/**
 * MwSt.-Hinweis unter dem Produktpreis — reagiert auf den Herkunfts-Schalter
 * im Header. Die endgültige Berechnung (inkl. Reverse-Charge-Prüfung anhand
 * der USt-IdNr.) erfolgt im Warenkorb/Checkout via `cartTotals`.
 */
export default function VatHint({ className = "text-[11px] text-neutral-400" }: { className?: string }) {
  const { herkunft } = useHerkunft();
  return (
    <p className={className}>
      {herkunft === "ausland"
        ? "zzgl. MwSt. (entfällt im Ausland bei gültiger USt-IdNr.)"
        : "zzgl. 19% MwSt."}
    </p>
  );
}
