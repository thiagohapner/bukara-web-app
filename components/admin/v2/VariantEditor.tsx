"use client";

import { useState } from "react";
import Link from "next/link";
import { formatEur } from "@/lib/pricing";
import {
  materialScoreLabel,
  type SkuFull,
  type SpecSection,
  type VariantEditorData,
} from "@/lib/v2/admin/types";

const TABS = ["Maße", "Preis & Bestand", "Bilder", "Spezifikationen", "Maschinen"] as const;
type Tab = (typeof TABS)[number];

const SPEC_SECTION_LABEL: Record<SpecSection, string> = {
  technische_details: "Technische Details",
  anwendung: "Anwendung",
  maschinen: "Maschinen",
};

// Dimension columns → German label + unit, in display order.
const DIMENSIONS: { key: keyof SkuFull; label: string; unit?: string }[] = [
  { key: "diameter_mm", label: "Durchmesser (D)", unit: "mm" },
  { key: "nl_mm", label: "Nutzlänge (NL)", unit: "mm" },
  { key: "nl_1", label: "Nutzlänge NL1", unit: "mm" },
  { key: "gl_mm", label: "Gesamtlänge (GL)", unit: "mm" },
  { key: "shank_mm", label: "Schaft (S)", unit: "mm" },
  { key: "shank_length_mm", label: "Schaftlänge", unit: "mm" },
  { key: "h_mm", label: "Höhe (H)", unit: "mm" },
  { key: "bore_mm", label: "Bohrung", unit: "mm" },
  { key: "corner_radius_mm", label: "Eckenradius", unit: "mm" },
  { key: "kerf_mm", label: "Schnittbreite", unit: "mm" },
  { key: "plate_mm", label: "Plattenstärke", unit: "mm" },
  { key: "teeth", label: "Zähne (Z)" },
  { key: "tooth_form", label: "Zahnform" },
  { key: "spin_direction", label: "Drehrichtung" },
  { key: "coating_or_type", label: "Beschichtung / Typ" },
];

function ReadField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-500 mb-1">{label}</div>
      <div className="min-h-[38px] flex items-center px-3 py-2 rounded-sm border border-slate-200 bg-slate-50 text-sm text-slate-800">
        {value ?? <span className="text-slate-400">—</span>}
      </div>
    </div>
  );
}

function BoolBadge({ value }: { value: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        value ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {value ? "Ja" : "Nein"}
    </span>
  );
}

export default function VariantEditor({ data }: { data: VariantEditorData }) {
  const [tab, setTab] = useState<Tab>("Maße");
  const { sku, family, familySkus, categories, applications, materials, images, specs, machines } =
    data;

  const dims = DIMENSIONS.filter((d) => {
    const v = sku[d.key];
    return v !== null && v !== undefined && v !== "";
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/admin/v2/variants" className="hover:text-teal-700">
              Varianten
            </Link>
            <span>/</span>
            <span className="font-mono text-slate-500">{sku.bukara_article_number}</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 mt-1">
            {family ? family.display_name ?? family.base_name : sku.variant_label ?? "Variante"}
          </h1>
        </div>
        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-medium">
          Schreibgeschützt
        </span>
      </div>

      {!family && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Diese Variante ist noch keiner Produktfamilie zugeordnet
          (<span className="font-mono">product_id</span> ist leer).
        </div>
      )}

      {/* Family zone */}
      {family && (
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          <h2 className="text-sm font-semibold text-slate-700">Produktfamilie</h2>
          <div className="flex gap-5">
            <div className="shrink-0">
              {family.default_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={family.default_image_url}
                  alt=""
                  className="w-28 h-28 rounded-lg object-cover border border-slate-100"
                />
              ) : (
                <div className="w-28 h-28 rounded-lg bg-slate-100 border border-slate-100" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <ReadField label="Basisname" value={family.base_name} />
              <ReadField label="Anzeigename" value={family.display_name} />
              <ReadField label="Slug" value={<span className="font-mono text-xs">{family.slug}</span>} />
              <ReadField label="Serie" value={family.series} />
              <ReadField label="Produkttyp" value={family.product_type} />
              <ReadField label="Badge" value={family.badge} />
              <div className="col-span-2">
                <ReadField label="Tagline" value={family.tagline} />
              </div>
              <div className="col-span-2">
                <ReadField label="Beschreibung" value={family.description} />
              </div>
              <ReadField label="Aktiv" value={<BoolBadge value={family.is_active} />} />
              <ReadField
                label="Öffentliche Seite"
                value={<BoolBadge value={family.has_public_page} />}
              />
            </div>
          </div>

          {/* Taxonomy */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1.5">Kategorien</div>
              <div className="flex flex-wrap gap-1.5">
                {categories.length ? (
                  categories.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded-pill bg-slate-100 text-slate-600 text-xs"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm">—</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1.5">Anwendungen</div>
              <div className="flex flex-wrap gap-1.5">
                {applications.length ? (
                  applications.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-pill bg-teal-50 text-teal-700 text-xs"
                    >
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Materials matrix */}
          {materials.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1.5">Materialeignung</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                {materials.map((m) => (
                  <div
                    key={m.material_name}
                    className="flex items-center justify-between px-3 py-1.5 rounded-sm border border-slate-100 bg-slate-50 text-sm"
                  >
                    <span className="text-slate-700">{m.material_name}</span>
                    <span
                      className={`text-xs font-medium ${
                        m.score >= 2
                          ? "text-green-700"
                          : m.score === 1
                            ? "text-amber-700"
                            : "text-slate-400"
                      }`}
                    >
                      {materialScoreLabel(m.score)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Variants sub-table */}
      {family && familySkus.length > 0 && (
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">
              Varianten dieser Familie ({familySkus.length})
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left bg-slate-50/60">
                <th className="px-4 py-2 font-medium text-slate-500">Bukara-Nr.</th>
                <th className="px-4 py-2 font-medium text-slate-500">Variante</th>
                <th className="px-4 py-2 font-medium text-slate-500">Ø</th>
                <th className="px-4 py-2 font-medium text-slate-500">Preis</th>
                <th className="px-4 py-2 font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {familySkus.map((s) => {
                const focused = s.id === sku.id;
                return (
                  <tr
                    key={s.id}
                    className={`border-b border-slate-50 ${
                      focused ? "bg-teal-50/60" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-4 py-2 font-mono text-xs">
                      {focused ? (
                        <span className="text-teal-700 font-semibold">
                          {s.bukara_article_number}
                        </span>
                      ) : (
                        <Link
                          href={`/admin/v2/variants/${s.id}`}
                          className="text-slate-700 hover:text-teal-700"
                        >
                          {s.bukara_article_number}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-600 max-w-[260px] truncate" title={s.variant_label ?? undefined}>
                      {s.variant_label ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-slate-500">
                      {s.diameter_mm != null ? `${s.diameter_mm} mm` : "—"}
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {s.price_eur != null ? formatEur(s.price_eur) : "—"}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          s.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {s.is_active ? "Aktiv" : "Inaktiv"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {/* Variant detail tabs */}
      <section className="bg-white rounded-xl border border-slate-200">
        <div className="flex border-b border-slate-100 px-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t
                  ? "border-teal-500 text-teal-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "Maße" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {dims.length ? (
                dims.map((d) => (
                  <ReadField
                    key={String(d.key)}
                    label={d.label}
                    value={`${sku[d.key]}${d.unit ? ` ${d.unit}` : ""}`}
                  />
                ))
              ) : (
                <p className="text-sm text-slate-400">Keine Maße erfasst.</p>
              )}
            </div>
          )}

          {tab === "Preis & Bestand" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ReadField
                label="Preis"
                value={sku.price_eur != null ? formatEur(sku.price_eur) : null}
              />
              <ReadField
                label="Aktionspreis"
                value={sku.campaign_price != null ? formatEur(sku.campaign_price) : null}
              />
              <ReadField label="Staffelpreis" value={<BoolBadge value={sku.has_staffelpreis} />} />
              <ReadField label="Bestand" value={sku.stock_quantity} />
            </div>
          )}

          {tab === "Bilder" && (
            <div className="flex flex-wrap gap-3">
              {images.length ? (
                images.map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt=""
                    className="w-32 h-32 rounded-lg object-cover border border-slate-100"
                  />
                ))
              ) : (
                <p className="text-sm text-slate-400">Keine Bilder hinterlegt.</p>
              )}
            </div>
          )}

          {tab === "Spezifikationen" && (
            <div className="space-y-5">
              {specs.length === 0 && (
                <p className="text-sm text-slate-400">Keine Spezifikationen erfasst.</p>
              )}
              {(["technische_details", "anwendung", "maschinen"] as SpecSection[]).map((section) => {
                const items = specs.filter((s) => s.spec_section === section);
                if (items.length === 0) return null;
                return (
                  <div key={section}>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                      {SPEC_SECTION_LABEL[section]}
                    </div>
                    <dl className="divide-y divide-slate-50 border border-slate-100 rounded-lg overflow-hidden">
                      {items.map((s) => (
                        <div key={s.id} className="flex px-4 py-2 text-sm">
                          <dt className="w-1/3 text-slate-500">{s.spec_key}</dt>
                          <dd className="flex-1 text-slate-800">{s.spec_value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "Maschinen" && (
            <div>
              {machines.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {machines.map((m) => (
                    <span
                      key={m.machine_id}
                      className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-700"
                    >
                      <span className="font-medium">{m.brand ?? "—"}</span>
                      {m.model ? <span className="text-slate-500"> · {m.model}</span> : null}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Keine kompatiblen Maschinen hinterlegt.</p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
