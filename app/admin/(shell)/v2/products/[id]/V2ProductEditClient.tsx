"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DS_INPUT_ADMIN, DS_LABEL } from "@/lib/ds";
import { upsertProduct } from "./actions";
import type { V2Category } from "@/lib/v2/types";

const TABS = ["Details", "Kategorien & Anwendungen", "Materialien", "SKUs"] as const;
type Tab = typeof TABS[number];

interface MaterialRow {
  id?: string;
  material_name: string;
  score: number;
  suitability: string;
  sort_order: number;
  _deleted?: boolean;
}

interface SkuSummary {
  id: string;
  identnummer: string;
  variant_label: string | null;
  diameter_mm: number | null;
  price_eur: number;
  campaign_price: number | null;
  is_active: boolean;
  sort_order: number;
}

interface ProductForm {
  id: string;
  slug: string;
  base_name: string;
  display_name: string;
  tagline: string;
  short_description: string;
  long_description: string;
  series: string;
  product_type: string;
  badge: string;
  gallery_bg: string;
  default_image_url: string;
  sort_order: number;
  is_active: boolean;
  has_public_page: boolean;
}

export interface InitialData {
  product: Record<string, unknown> | null;
  categoryIds: string[];
  applicationTags: string[];
  materials: MaterialRow[];
  skus: SkuSummary[];
  allCategories: V2Category[];
  materialTypeNames: string[];
}

const SCORE_LABELS: Record<number, string> = {
  0: "Nicht geeignet",
  1: "Geeignet",
  2: "Gut geeignet",
  3: "Sehr gut geeignet",
};

function buildForm(p: Record<string, unknown> | null): ProductForm {
  const d = p ?? {};
  return {
    id: String(d.id ?? ""),
    slug: String(d.slug ?? ""),
    base_name: String(d.base_name ?? ""),
    display_name: String(d.display_name ?? d.base_name ?? ""),
    tagline: String(d.tagline ?? ""),
    short_description: String(d.short_description ?? ""),
    long_description: String(d.long_description ?? ""),
    series: String(d.series ?? ""),
    product_type: String(d.product_type ?? ""),
    badge: String(d.badge ?? ""),
    gallery_bg: String(d.gallery_bg ?? "#e6eff5"),
    default_image_url: String(d.default_image_url ?? ""),
    sort_order: Number(d.sort_order ?? 0),
    is_active: d.is_active !== false,
    has_public_page: Boolean(d.has_public_page),
  };
}

export default function V2ProductEditClient({
  productId,
  initialData,
}: {
  productId: string | null;
  initialData: InitialData;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Details");
  const [form, setForm] = useState<ProductForm>(() => buildForm(initialData.product));
  const [categoryIds, setCategoryIds] = useState<string[]>(initialData.categoryIds);
  const [applicationTags, setApplicationTags] = useState<string[]>(initialData.applicationTags);
  const [newTag, setNewTag] = useState("");
  const [materials, setMaterials] = useState<MaterialRow[]>(initialData.materials);
  const [skus] = useState<SkuSummary[]>(initialData.skus);
  const [allCategories] = useState<V2Category[]>(initialData.allCategories);
  const [materialTypes] = useState<string[]>(initialData.materialTypeNames);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function field(key: keyof ProductForm, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCategory(id: string) {
    setCategoryIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function addTag() {
    const t = newTag.trim();
    if (t && !applicationTags.includes(t)) {
      setApplicationTags((prev) => [...prev, t]);
    }
    setNewTag("");
  }

  function removeTag(tag: string) {
    setApplicationTags((prev) => prev.filter((t) => t !== tag));
  }

  function updateMaterial(index: number, key: keyof MaterialRow, value: string | number) {
    setMaterials((prev) => prev.map((m, i) => i === index ? { ...m, [key]: value } : m));
  }

  function addMaterial() {
    setMaterials((prev) => [...prev, {
      material_name: materialTypes[0] ?? "",
      score: 1,
      suitability: SCORE_LABELS[1],
      sort_order: prev.filter((m) => !m._deleted).length,
    }]);
  }

  function deleteMaterial(index: number) {
    setMaterials((prev) => prev.map((m, i) => i === index ? { ...m, _deleted: true } : m));
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const result = await upsertProduct(
      productId,
      {
        slug: form.slug,
        base_name: form.base_name,
        display_name: form.display_name,
        tagline: form.tagline,
        short_description: form.short_description,
        long_description: form.long_description,
        series: form.series,
        product_type: form.product_type,
        badge: form.badge,
        gallery_bg: form.gallery_bg,
        default_image_url: form.default_image_url,
        sort_order: form.sort_order,
        is_active: form.is_active,
        has_public_page: form.has_public_page,
      },
      categoryIds,
      applicationTags,
      materials
    );

    if ("error" in result) {
      setError(result.error);
    } else {
      setSuccess(true);
      if (!productId) {
        router.push(`/admin/v2/products/${result.id}`);
      } else {
        router.refresh();
      }
    }
    setSaving(false);
  }

  // Category tree
  const topLevel = allCategories.filter((c) => c.parent_id === null);
  const subMap: Record<string, V2Category[]> = {};
  for (const c of allCategories.filter((c) => c.parent_id !== null)) {
    if (!subMap[c.parent_id!]) subMap[c.parent_id!] = [];
    subMap[c.parent_id!].push(c);
  }

  const visibleMaterials = materials.filter((m) => !m._deleted);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/v2/products" className="text-sm text-teal-600 hover:text-teal-700">
            ← v2 Produkte
          </Link>
          <h1 className="text-2xl font-semibold text-slate-800 mt-1">
            {productId ? (form.display_name || form.base_name || "Produkt bearbeiten") : "Neues Produkt"}
          </h1>
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

      {/* Tabs */}
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
            {t === "SKUs" && skus.length > 0 ? `SKUs (${skus.length})` : t}
          </button>
        ))}
      </div>

      {tab === "Details" && (
        <div className="max-w-xl space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={DS_LABEL}>Slug</label>
              <input className={DS_INPUT_ADMIN} value={form.slug} onChange={(e) => field("slug", e.target.value)} placeholder="z.B. x99-fraeser" />
            </div>
            <div>
              <label className={DS_LABEL}>Reihenfolge</label>
              <input type="number" className={DS_INPUT_ADMIN} value={form.sort_order} onChange={(e) => field("sort_order", Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className={DS_LABEL}>Basisname (intern)</label>
            <input className={DS_INPUT_ADMIN} value={form.base_name} onChange={(e) => field("base_name", e.target.value)} placeholder="Kurzname" />
          </div>
          <div>
            <label className={DS_LABEL}>Anzeigename</label>
            <input className={DS_INPUT_ADMIN} value={form.display_name} onChange={(e) => field("display_name", e.target.value)} placeholder="Vollständiger Produktname" />
          </div>
          <div>
            <label className={DS_LABEL}>Tagline</label>
            <input className={DS_INPUT_ADMIN} value={form.tagline} onChange={(e) => field("tagline", e.target.value)} placeholder="Kurzbeschreibung / Untertitel" />
          </div>
          <div>
            <label className={DS_LABEL}>Kurzbeschreibung</label>
            <textarea className={DS_INPUT_ADMIN} rows={3} value={form.short_description} onChange={(e) => field("short_description", e.target.value)} />
          </div>
          <div>
            <label className={DS_LABEL}>Langbeschreibung</label>
            <textarea className={DS_INPUT_ADMIN} rows={6} value={form.long_description} onChange={(e) => field("long_description", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={DS_LABEL}>Serie</label>
              <input className={DS_INPUT_ADMIN} value={form.series} onChange={(e) => field("series", e.target.value)} />
            </div>
            <div>
              <label className={DS_LABEL}>Produkttyp</label>
              <input className={DS_INPUT_ADMIN} value={form.product_type} onChange={(e) => field("product_type", e.target.value)} placeholder="z.B. Fräser" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={DS_LABEL}>Badge</label>
              <input className={DS_INPUT_ADMIN} value={form.badge} onChange={(e) => field("badge", e.target.value)} placeholder="z.B. NEU" />
            </div>
            <div>
              <label className={DS_LABEL}>Galerie-Hintergrund</label>
              <input className={DS_INPUT_ADMIN} value={form.gallery_bg} onChange={(e) => field("gallery_bg", e.target.value)} placeholder="#e6eff5" />
            </div>
          </div>
          <div>
            <label className={DS_LABEL}>Standard-Bild-URL</label>
            <input className={DS_INPUT_ADMIN} value={form.default_image_url} onChange={(e) => field("default_image_url", e.target.value)} placeholder="https://…" />
            {form.default_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.default_image_url} alt="" className="mt-2 w-24 h-24 object-contain rounded border border-slate-200" />
            )}
          </div>
          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => field("is_active", e.target.checked)} style={{ accentColor: "#0F172A" }} />
              Aktiv
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.has_public_page} onChange={(e) => field("has_public_page", e.target.checked)} style={{ accentColor: "#0F172A" }} />
              Öffentliche Seite
            </label>
          </div>
        </div>
      )}

      {tab === "Kategorien & Anwendungen" && (
        <div className="max-w-xl space-y-8">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">Kategorien</p>
            <div className="space-y-3">
              {topLevel.map((parent) => {
                const subs = subMap[parent.id] ?? [];
                const allItems = subs.length > 0 ? subs : [parent];
                return (
                  <div key={parent.id}>
                    {subs.length > 0 && (
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">{parent.name}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {allItems.map((cat) => {
                        const selected = categoryIds.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                              selected
                                ? "border-teal-500 bg-teal-50 text-teal-700 font-medium"
                                : "border-slate-200 text-slate-600 hover:border-slate-400"
                            }`}
                          >
                            {subs.length === 0 ? parent.name : cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">Anwendungs-Tags</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {applicationTags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-slate-400 hover:text-slate-600 leading-none text-base">×</button>
                </span>
              ))}
              {applicationTags.length === 0 && <span className="text-sm text-slate-400">Keine Tags</span>}
            </div>
            <div className="flex gap-2">
              <input
                className={DS_INPUT_ADMIN + " flex-1"}
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="z.B. Fraesen"
              />
              <button type="button" onClick={addTag} className="px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700">
                + Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "Materialien" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-700">Materialeignung</p>
            <button type="button" onClick={addMaterial} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              + Hinzufügen
            </button>
          </div>

          {visibleMaterials.length === 0 && (
            <p className="text-sm text-slate-400 py-4">Noch keine Materialien</p>
          )}

          <div className="space-y-3">
            {materials.map((mat, i) => {
              if (mat._deleted) return null;
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <select
                    className={DS_INPUT_ADMIN + " flex-1"}
                    value={mat.material_name}
                    onChange={(e) => updateMaterial(i, "material_name", e.target.value)}
                  >
                    {materialTypes.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                    {!materialTypes.includes(mat.material_name) && mat.material_name && (
                      <option value={mat.material_name}>{mat.material_name}</option>
                    )}
                  </select>
                  <select
                    className={DS_INPUT_ADMIN + " w-44"}
                    value={mat.score}
                    onChange={(e) => updateMaterial(i, "score", Number(e.target.value))}
                  >
                    {[0, 1, 2, 3].map((s) => (
                      <option key={s} value={s}>{s} – {SCORE_LABELS[s]}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => deleteMaterial(i)}
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

      {tab === "SKUs" && (
        <div>
          {skus.length === 0 && (
            <p className="text-sm text-slate-400 py-4">Noch keine SKUs für dieses Produkt.</p>
          )}

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-4 py-3 font-medium text-slate-600">Identnummer</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Variante</th>
                  <th className="px-4 py-3 font-medium text-slate-600">ø (mm)</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Preis</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Aktiv</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {skus.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{s.identnummer}</td>
                    <td className="px-4 py-3 text-slate-600">{s.variant_label ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{s.diameter_mm ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {s.campaign_price != null && s.campaign_price < s.price_eur ? (
                        <span className="text-red-600 font-medium">{s.campaign_price.toFixed(2)} €</span>
                      ) : (
                        <span>{s.price_eur.toFixed(2)} €</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${s.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {s.is_active ? "Ja" : "Nein"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a href={`/admin/v2/skus/${s.id}`} className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                        Bearbeiten →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
