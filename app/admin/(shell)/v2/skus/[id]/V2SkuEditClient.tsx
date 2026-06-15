"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUploadManager from "@/components/admin/ImageUploadManager";
import { DS_INPUT_ADMIN, DS_LABEL } from "@/lib/ds";
import { updateSku } from "./actions";
import type { V2Sku, V2SkuSpec, V2SkuImage } from "@/lib/v2/types";

const TABS = ["Details", "Specs", "Bilder"] as const;
type Tab = typeof TABS[number];

interface SpecRow extends V2SkuSpec { _deleted?: boolean }
interface ImageRow { id: string; image_url: string; sort_order: number }
interface ProductOption { id: string; display_name: string | null; base_name: string | null }

const SPEC_SECTIONS = [
  { value: "technische_details", label: "Technische Details" },
  { value: "anwendung", label: "Anwendung" },
  { value: "maschinen", label: "Maschinen" },
] as const;

interface InitialData {
  sku: V2Sku;
  specs: V2SkuSpec[];
  images: V2SkuImage[];
  allProducts: ProductOption[];
}

export default function V2SkuEditClient({
  skuId,
  initialData,
}: {
  skuId: string;
  initialData: InitialData;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Details");
  const [sku] = useState<V2Sku>(initialData.sku);
  const [form, setForm] = useState<Partial<V2Sku>>(initialData.sku);
  const [specs, setSpecs] = useState<SpecRow[]>(initialData.specs as SpecRow[]);
  const [images, setImages] = useState<ImageRow[]>(
    initialData.images.map((img) => ({ id: img.id, image_url: img.image_url, sort_order: img.sort_order }))
  );
  const [allProducts] = useState<ProductOption[]>(initialData.allProducts);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function field(key: keyof V2Sku, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateSpec(index: number, key: keyof SpecRow, value: string | number) {
    setSpecs((prev) => prev.map((s, i) => i === index ? { ...s, [key]: value } : s));
  }

  function addSpec() {
    const newSpec: SpecRow = {
      id: `new-${Date.now()}`,
      sku_id: skuId,
      spec_key: "",
      spec_value: "",
      spec_section: "technische_details",
      sort_order: specs.filter((s) => !s._deleted).length,
    };
    setSpecs((prev) => [...prev, newSpec]);
  }

  function deleteSpec(index: number) {
    setSpecs((prev) => prev.map((s, i) => i === index ? { ...s, _deleted: true } : s));
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const result = await updateSku(
      skuId,
      {
        product_id: form.product_id ?? null,
        merchant_sku: form.merchant_sku ?? null,
        variant_label: form.variant_label ?? null,
        diameter_mm: form.diameter_mm ?? null,
        nl_mm: form.nl_mm ?? null,
        nl_1: form.nl_1 ?? null,
        gl_mm: form.gl_mm ?? null,
        shank_mm: form.shank_mm ?? null,
        shank_length_mm: form.shank_length_mm ?? null,
        teeth: form.teeth ?? null,
        spin_direction: form.spin_direction ?? null,
        coating_or_type: form.coating_or_type ?? null,
        price_eur: form.price_eur != null ? Number(form.price_eur) : null,
        campaign_price: form.campaign_price != null ? Number(form.campaign_price) : null,
        stock_quantity: Number(form.stock_quantity ?? 0),
        is_active: Boolean(form.is_active),
        sort_order: Number(form.sort_order ?? 0),
      },
      specs.map((s) => ({
        id: s.id,
        spec_key: s.spec_key,
        spec_value: s.spec_value,
        spec_section: s.spec_section,
        sort_order: s.sort_order,
        _deleted: s._deleted,
      }))
    );

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      router.refresh();
    }
    setSaving(false);
  }

  const visibleSpecs = specs.filter((s) => !s._deleted);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          {sku.product_id ? (
            <Link href={`/admin/v2/products/${sku.product_id}`} className="text-sm text-teal-600 hover:text-teal-700">
              ← Zurück zum Produkt
            </Link>
          ) : (
            <Link href="/admin/v2/products" className="text-sm text-teal-600 hover:text-teal-700">
              ← v2 Produkte
            </Link>
          )}
          <h1 className="text-2xl font-semibold text-slate-800 mt-1">
            SKU: {sku.identnummer}
          </h1>
          {sku.bukara_article_number && (
            <p className="text-sm text-slate-400">Bukara-Nr.: {sku.bukara_article_number}</p>
          )}
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="btn-orange px-5 py-2 text-sm"
        >
          {saving ? "Speichert…" : "Speichern"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">Gespeichert</div>
      )}

      <div className="flex border-b border-slate-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? "border-teal-500 text-teal-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Details" && (
        <div className="max-w-xl space-y-4">
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <label className={DS_LABEL}>Identnummer (read-only)</label>
              <p className="font-mono text-sm text-slate-700">{sku.identnummer}</p>
            </div>
            <div>
              <label className={DS_LABEL}>Bukara-Art.-Nr. (read-only)</label>
              <p className="font-mono text-sm text-slate-700">{sku.bukara_article_number}</p>
            </div>
          </div>

          <div>
            <label className={DS_LABEL}>Produkt (Familie)</label>
            <select
              className={DS_INPUT_ADMIN}
              value={form.product_id ?? ""}
              onChange={(e) => field("product_id", e.target.value || null)}
            >
              <option value="">— Kein Produkt (nicht zugeordnet) —</option>
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name ?? p.base_name ?? p.id}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={DS_LABEL}>Händler-SKU</label>
              <input className={DS_INPUT_ADMIN} value={form.merchant_sku ?? ""} onChange={(e) => field("merchant_sku", e.target.value || null)} />
            </div>
            <div>
              <label className={DS_LABEL}>Variantenbezeichnung</label>
              <input className={DS_INPUT_ADMIN} value={form.variant_label ?? ""} onChange={(e) => field("variant_label", e.target.value || null)} placeholder="z.B. Standard" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={DS_LABEL}>Ø (mm)</label>
              <input type="number" step="0.01" className={DS_INPUT_ADMIN} value={form.diameter_mm ?? ""} onChange={(e) => field("diameter_mm", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <label className={DS_LABEL}>NL (mm)</label>
              <input type="number" step="0.01" className={DS_INPUT_ADMIN} value={form.nl_mm ?? ""} onChange={(e) => field("nl_mm", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <label className={DS_LABEL}>NL1 (mm)</label>
              <input type="number" step="0.01" className={DS_INPUT_ADMIN} value={form.nl_1 ?? ""} onChange={(e) => field("nl_1", e.target.value ? Number(e.target.value) : null)} placeholder="sek. Nutzlänge" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={DS_LABEL}>GL (mm)</label>
              <input type="number" step="0.01" className={DS_INPUT_ADMIN} value={form.gl_mm ?? ""} onChange={(e) => field("gl_mm", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <label className={DS_LABEL}>Schaft (mm)</label>
              <input type="number" step="0.01" className={DS_INPUT_ADMIN} value={form.shank_mm ?? ""} onChange={(e) => field("shank_mm", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <label className={DS_LABEL}>Schaftlänge (mm)</label>
              <input type="number" step="0.01" className={DS_INPUT_ADMIN} value={form.shank_length_mm ?? ""} onChange={(e) => field("shank_length_mm", e.target.value ? Number(e.target.value) : null)} placeholder="z.B. S10x27 → 27" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={DS_LABEL}>Zähne</label>
              <input type="number" className={DS_INPUT_ADMIN} value={form.teeth ?? ""} onChange={(e) => field("teeth", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <label className={DS_LABEL}>Drall</label>
              <select className={DS_INPUT_ADMIN} value={form.spin_direction ?? ""} onChange={(e) => field("spin_direction", e.target.value || null)}>
                <option value="">—</option>
                <option value="rechts">Rechts</option>
                <option value="links">Links</option>
              </select>
            </div>
          </div>

          <div>
            <label className={DS_LABEL}>Beschichtung / Typ</label>
            <input className={DS_INPUT_ADMIN} value={form.coating_or_type ?? ""} onChange={(e) => field("coating_or_type", e.target.value || null)} placeholder="z.B. TiAlN" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={DS_LABEL}>Preis (€)</label>
              <input type="number" step="0.01" className={DS_INPUT_ADMIN} value={form.price_eur ?? ""} onChange={(e) => field("price_eur", e.target.value ? Number(e.target.value) : null)} placeholder="leer = kein Preis" />
            </div>
            <div>
              <label className={DS_LABEL}>Aktionspreis (€)</label>
              <input type="number" step="0.01" className={DS_INPUT_ADMIN} value={form.campaign_price ?? ""} onChange={(e) => field("campaign_price", e.target.value ? Number(e.target.value) : null)} placeholder="leer = kein Angebot" />
            </div>
            <div>
              <label className={DS_LABEL}>Lagerbestand</label>
              <input type="number" className={DS_INPUT_ADMIN} value={form.stock_quantity ?? 0} onChange={(e) => field("stock_quantity", Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={DS_LABEL}>Reihenfolge</label>
              <input type="number" className={DS_INPUT_ADMIN} value={form.sort_order ?? 0} onChange={(e) => field("sort_order", Number(e.target.value))} />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={Boolean(form.is_active)} onChange={(e) => field("is_active", e.target.checked)} style={{ accentColor: "#0F172A" }} />
                Aktiv
              </label>
            </div>
          </div>
        </div>
      )}

      {tab === "Specs" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-700">Technische Spezifikationen</p>
            <button type="button" onClick={addSpec} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              + Hinzufügen
            </button>
          </div>

          {visibleSpecs.length === 0 && (
            <p className="text-sm text-slate-400 py-4">Noch keine Specs</p>
          )}

          <div className="space-y-2">
            {specs.map((spec, i) => {
              if (spec._deleted) return null;
              return (
                <div key={spec.id} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <select
                    className={DS_INPUT_ADMIN + " w-44 shrink-0"}
                    value={spec.spec_section}
                    onChange={(e) => updateSpec(i, "spec_section", e.target.value)}
                  >
                    {SPEC_SECTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <input
                    className={DS_INPUT_ADMIN + " flex-1"}
                    value={spec.spec_key}
                    onChange={(e) => updateSpec(i, "spec_key", e.target.value)}
                    placeholder="Schlüssel (z.B. Durchmesser)"
                  />
                  <input
                    className={DS_INPUT_ADMIN + " flex-1"}
                    value={spec.spec_value}
                    onChange={(e) => updateSpec(i, "spec_value", e.target.value)}
                    placeholder="Wert"
                  />
                  <button
                    type="button"
                    onClick={() => deleteSpec(i)}
                    className="text-slate-400 hover:text-red-500 text-lg leading-none px-1 transition-colors"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "Bilder" && (
        <div className="max-w-xl">
          <ImageUploadManager
            entityType="v2-sku"
            entityId={skuId}
            images={images}
            onChange={setImages}
            maxImages={10}
          />
        </div>
      )}
    </div>
  );
}
