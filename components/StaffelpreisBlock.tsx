"use client";

import { formatEur } from "@/lib/pricing";
import { parseStaffelSpecs, type StaffelSpec, type StaffelTier } from "@/lib/pricing/staffel";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// "Menge" cell when a Verpackungseinheit (carton size) is known: shows the carton
// range and the piece range, e.g. "1–5 Kartons (10–50 Stück)" / "ab 11 Kartons (ab 110 Stück)".
function kartonLabel(t: StaffelTier, pu: number): string {
  const kMin = Math.ceil(t.minQty / pu);
  if (t.maxQty == null) return `ab ${kMin} Kartons (ab ${t.minQty} Stück)`;
  const kMax = Math.floor(t.maxQty / pu);
  return `${kMin}–${kMax} Kartons (${t.minQty}–${t.maxQty} Stück)`;
}

// "Menge (Stück)" cell when there is no Verpackungseinheit.
function stueckLabel(t: StaffelTier): string {
  return t.maxQty == null ? `ab ${t.minQty}` : `${t.minQty}–${t.maxQty}`;
}

/**
 * Renders the real Staffelpreise for a SKU, parsed from its v2.sku_specs rows.
 * Renders nothing unless at least two tiers parse. Every number traces to a spec
 * row or to an explicit derivation (carton count, price per carton). The row whose
 * piece range contains the current quantity is highlighted, reactively.
 */
export default function StaffelpreisBlock({ specs, quantity }: { specs: StaffelSpec[]; quantity: number }) {
  const data = parseStaffelSpecs(specs);
  if (!data || data.tiers.length < 2) return null;

  const { packagingUnit, tiers } = data;
  const pu = packagingUnit && packagingUnit > 0 ? packagingUnit : null;
  const highestMax = tiers[tiers.length - 1].maxQty;
  const cellMuted = "py-2 px-3 text-neutral-500";
  const cellActive = "py-2 px-3 text-slate-900 font-medium";

  return (
    <div className="mb-6">
      <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1">Staffelpreise</p>
      {pu && (
        <p className="text-[11px] text-neutral-400 mb-2">Netto pro Stück, Verpackungseinheit: {pu} Stück</p>
      )}
      <table className="w-full text-sm border border-neutral-100 rounded-lg overflow-hidden">
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-neutral-400 border-b border-neutral-100">
            <th className="py-2 px-3 text-left font-medium">{pu ? "Menge" : "Menge (Stück)"}</th>
            <th className="py-2 px-3 text-right font-medium">Preis / Stück</th>
            {pu && <th className="py-2 px-3 text-right font-medium">Preis / Karton</th>}
          </tr>
        </thead>
        <tbody>
          {tiers.map((t, i) => {
            const active = quantity >= t.minQty && (t.maxQty == null || quantity <= t.maxQty);
            const cell = active ? cellActive : cellMuted;
            return (
              <tr key={i} className={active ? "bg-brand-25" : ""}>
                <td className={`${cell} text-left`}>{pu ? kartonLabel(t, pu) : stueckLabel(t)}</td>
                <td className={`${cell} text-right`}>{formatEur(t.unitPrice)}</td>
                {pu && <td className={`${cell} text-right`}>{formatEur(round2(t.unitPrice * pu))}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
      {pu && (
        <p className="text-[11px] text-neutral-400 mt-2">
          Bestellung in ganzen Kartons à {pu} Stück.
          {highestMax != null ? ` Ab ${Math.floor(highestMax / pu) + 1} Kartons: Preis auf Anfrage.` : ""}
        </p>
      )}
    </div>
  );
}
