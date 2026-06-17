"use client";

import { useRouter } from "next/navigation";
import CustomSelect from "@/components/CustomSelect";
import { formatEur } from "@/lib/pricing";
import type { V2GroupVariant } from "@/lib/v2/types";

interface Props {
  variants: V2GroupVariant[];
  selectedSkuId: string;
  onSelectSameProduct: (skuId: string) => void;
}

function variantLabel(v: V2GroupVariant): string {
  const parts: string[] = [];
  if (v.diameter_mm !== null) parts.push(`⌀ ${v.diameter_mm} mm`);
  if (v.variant_label) parts.push(v.variant_label);
  if (v.coating_or_type) parts.push(v.coating_or_type);
  if (v.spin_direction) parts.push(v.spin_direction === "rechts" ? "Rechtsdrall" : "Linksdrall");
  return parts.length > 0 ? parts.join(" · ") : v.identnummer;
}

// Stable order across products: diameter asc (nulls last), then merchant_sku,
// then variant_label, then identnummer. Per-product sort_order is not meaningful
// once the list spans multiple products.
function compareVariants(a: V2GroupVariant, b: V2GroupVariant): number {
  const ad = a.diameter_mm;
  const bd = b.diameter_mm;
  if (ad !== null && bd !== null && ad !== bd) return ad - bd;
  if (ad === null && bd !== null) return 1;
  if (ad !== null && bd === null) return -1;
  const aKey = a.merchant_sku ?? a.variant_label ?? a.identnummer;
  const bKey = b.merchant_sku ?? b.variant_label ?? b.identnummer;
  return aKey.localeCompare(bKey, "de");
}

export default function V2SeriesVariantPicker({ variants, selectedSkuId, onSelectSameProduct }: Props) {
  const router = useRouter();

  if (variants.length <= 1) return null;

  const sorted = [...variants].sort(compareVariants);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">Variante wählen</p>
      <CustomSelect
        value={selectedSkuId}
        onChange={(id) => {
          const variant = sorted.find((v) => v.skuId === id);
          if (!variant) return;
          if (variant.isCurrentProduct) {
            onSelectSameProduct(variant.skuId);
          } else {
            router.push(`/katalog/${variant.productSlug}?sku=${variant.skuId}`);
          }
        }}
        options={sorted.map((v) => ({
          value: v.skuId,
          label: `${variantLabel(v)} — ${formatEur(v.campaign_price ?? v.price_eur)}`,
        }))}
      />
    </div>
  );
}
