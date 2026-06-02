"use client";

import { useState } from "react";

export interface SkuRow {
  id?: string;
  artikel_nr: string;
  lieferanten_nr: string | null;
  variant_label: string;
  price: number;
  campaign_price: number | null;
  stock_quantity: number;
  sort_order: number;
  is_active: boolean;
  _deleted?: boolean;
}

interface Props {
  skus: SkuRow[];
  onChange: (skus: SkuRow[]) => void;
}

function emptysku(sort_order: number): SkuRow {
  return { artikel_nr: "", lieferanten_nr: null, variant_label: "", price: 0, campaign_price: null, stock_quantity: 999, sort_order, is_active: true };
}

export default function SkuEditor({ skus, onChange }: Props) {
  const visible = skus.filter((s) => !s._deleted);

  const update = (index: number, field: keyof SkuRow, value: unknown) => {
    const next = skus.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    onChange(next);
  };

  const add = () => onChange([...skus, emptysku(skus.length)]);

  const remove = (index: number) => {
    const sku = skus[index];
    if (sku.id) {
      onChange(skus.map((s, i) => (i === index ? { ...s, _deleted: true } : s)));
    } else {
      onChange(skus.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-4">
      {visible.map((sku, vi) => {
        const realIndex = skus.indexOf(sku);
        return (
          <div key={vi} className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">SKU {vi + 1}</span>
              <button type="button" onClick={() => remove(realIndex)} className="text-xs text-red-500 hover:text-red-700">
                Entfernen
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Artikel-Nr. *" value={sku.artikel_nr} onChange={(v) => update(realIndex, "artikel_nr", v)} />
              <Field label="Variante (optional)" value={sku.variant_label} onChange={(v) => update(realIndex, "variant_label", v)} />
              <div className="col-span-2">
                <Field label="Lieferanten-Bestellnummer" value={sku.lieferanten_nr ?? ""} onChange={(v) => update(realIndex, "lieferanten_nr", v || null)} />
              </div>
              <NumField label="Preis (€) *" value={sku.price} onChange={(v) => update(realIndex, "price", v)} />
              <NumField label="Kampagnenpreis (€)" value={sku.campaign_price ?? ""} onChange={(v) => update(realIndex, "campaign_price", v === "" ? null : v)} nullable />
              <NumField label="Lagerbestand" value={sku.stock_quantity} onChange={(v) => update(realIndex, "stock_quantity", v)} />
              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id={`sku-active-${vi}`}
                  checked={sku.is_active}
                  onChange={(e) => update(realIndex, "is_active", e.target.checked)}
                  className="rounded"
                />
                <label htmlFor={`sku-active-${vi}`} className="text-sm text-slate-700">Aktiv</label>
              </div>
            </div>
          </div>
        );
      })}
      <button type="button" onClick={add} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
        + SKU hinzufügen
      </button>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-sm px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>
  );
}

function NumField({ label, value, onChange, nullable = false }: { label: string; value: number | string; onChange: (v: number | string) => void; nullable?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => {
          const raw = e.target.value;
          if (nullable && raw === "") { onChange(""); return; }
          onChange(Number(raw));
        }}
        className="w-full border border-slate-200 rounded-sm px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>
  );
}
