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
