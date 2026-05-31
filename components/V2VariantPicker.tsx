"use client";

import CustomSelect from "@/components/CustomSelect";
import { formatEur } from "@/lib/pricing";
import type { V2Sku } from "@/lib/v2/types";

interface Props {
  skus: V2Sku[];
  selectedSkuId: string;
  onSelect: (sku: V2Sku) => void;
}

function skuLabel(sku: V2Sku): string {
  const parts: string[] = [];
  if (sku.diameter_mm !== null) parts.push(`⌀ ${sku.diameter_mm} mm`);
  if (sku.variant_label) parts.push(sku.variant_label);
  if (sku.coating_or_type) parts.push(sku.coating_or_type);
  if (sku.spin_direction) parts.push(sku.spin_direction === "rechts" ? "Rechtsdrall" : "Linksdrall");
  return parts.length > 0 ? parts.join(" · ") : sku.identnummer;
}

export default function V2VariantPicker({ skus, selectedSkuId, onSelect }: Props) {
  const sorted = [...skus].sort((a, b) => {
    if (a.diameter_mm !== null && b.diameter_mm !== null) return a.diameter_mm - b.diameter_mm;
    return a.sort_order - b.sort_order;
  });

  if (sorted.length <= 1) return null;

  if (sorted.length > 12) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Variante wählen</p>
        <CustomSelect
          value={selectedSkuId}
          onChange={(id) => {
            const sku = sorted.find((s) => s.id === id);
            if (sku) onSelect(sku);
          }}
          options={sorted.map((s) => ({
            value: s.id,
            label: `${skuLabel(s)} — ${formatEur(s.campaign_price ?? s.price_eur)}`,
          }))}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">Variante wählen</p>
      <div className="flex flex-wrap gap-2">
        {sorted.map((sku) => {
          const isSelected = sku.id === selectedSkuId;
          return (
            <button
              key={sku.id}
              type="button"
              onClick={() => onSelect(sku)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                isSelected
                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {skuLabel(sku)}
            </button>
          );
        })}
      </div>
      {selectedSkuId && (
        <p className="text-xs text-slate-400 pt-1">
          Art.-Nr.: {sorted.find((s) => s.id === selectedSkuId)?.identnummer}
        </p>
      )}
    </div>
  );
}
