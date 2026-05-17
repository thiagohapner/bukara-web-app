"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import CustomSelect from "@/components/CustomSelect";
import { useCart } from "@/components/CartContext";
import { type BukaraSku } from "@/lib/data";
import { formatEur } from "@/lib/pricing";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export interface AccessoryItem {
  id: string;
  accessory_product_id: string;
  sort_order: number;
  slug: string;
  name: string;
  images: string[];
  skus: BukaraSku[];
}

function AccessoryRow({ accessory }: { accessory: AccessoryItem }) {
  const { addItem, openDrawer } = useCart();
  const [selectedSkuId, setSelectedSkuId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addedState, setAddedState] = useState<"idle" | "added">("idle");

  useEffect(() => {
    if (accessory.skus.length > 0 && !selectedSkuId) {
      setSelectedSkuId(accessory.skus[0].id);
    }
  }, [accessory.skus, selectedSkuId]);

  const selectedSku = accessory.skus.find((s) => s.id === selectedSkuId) ?? accessory.skus[0] ?? null;
  const unitPrice = selectedSku?.campaign_price ?? selectedSku?.price ?? 0;
  const originalPrice = selectedSku?.price ?? 0;

  async function handleAdd() {
    if (!selectedSku) return;
    await addItem(selectedSku.id, quantity, unitPrice);
    setAddedState("added");
    openDrawer();
    setTimeout(() => setAddedState("idle"), 1500);
  }

  return (
    <div className="flex gap-3 items-start">
      {/* Thumbnail */}
      <div className="w-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 relative aspect-[3/4]">
        {accessory.images[0] && (
          <Image
            src={accessory.images[0]}
            alt={accessory.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Line 1: Name */}
        <Link
          href={`/produkte/${accessory.slug}`}
          className="text-sm font-semibold text-slate-900 hover:text-[#00A597] transition-colors leading-snug"
          style={{ textDecoration: "none" }}
        >
          {accessory.name}
        </Link>

        {/* Variant selector */}
        {accessory.skus.length > 1 && (
          <CustomSelect
            value={selectedSkuId}
            onChange={setSelectedSkuId}
            options={accessory.skus.map((s) => ({
              value: s.id,
              label: `${s.variant_label} · ${formatEur(s.campaign_price ?? s.price)}`,
            }))}
          />
        )}

        {/* Line 2: Price + discount */}
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-[#9B242A]">{formatEur(unitPrice)}</span>
          {originalPrice > unitPrice && (
            <>
              <span className="text-xs text-slate-400 line-through">{formatEur(originalPrice)}</span>
              <span className="text-xs font-semibold text-[#9B242A]">
                -{Math.round((1 - unitPrice / originalPrice) * 100)}%
              </span>
            </>
          )}
        </div>

        {/* Line 3: Qty + CTA */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-800 rounded-full select-none h-10">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-2.5 h-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
            >
              <ChevronLeftIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
            <span className="min-w-[1.25rem] text-center text-sm font-semibold text-slate-900 px-1">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="px-2.5 h-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
            >
              <ChevronRightIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedSku}
            className="btn-black flex-1 justify-center"
            style={{ fontSize: "0.875rem", padding: "0.55rem 1rem" }}
          >
            {addedState === "added" ? "✓ Hinzugefügt" : "In den Warenkorb"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductAccessories({ accessories }: { accessories: AccessoryItem[] }) {
  if (accessories.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="text-base font-bold text-slate-900 mb-2">Passend dazu</p>
      <div className="border border-slate-800 rounded-2xl p-4">
        {accessories.map((acc, idx) => (
          <div key={acc.id}>
            {idx > 0 && <div className="border-t border-slate-100 mt-4 mb-4" />}
            <AccessoryRow accessory={acc} />
          </div>
        ))}
      </div>
    </div>
  );
}
