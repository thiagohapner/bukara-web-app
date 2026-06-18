"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { normalizeVoucherCode, voucherStatus, VOUCHER_STATUS_LABEL } from "@/lib/vouchers";
import type { ProductOption } from "../options";

export type VoucherRecord = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  scope: "order" | "product" | "product_series";
  scope_target_id: string | null;
  min_order_value: number | null;
  max_redemptions: number | null;
  max_redemptions_per_customer: number | null;
  valid_from: string;
  valid_until: string;
  stackable_with_deals: boolean;
  active: boolean;
};

type FormState = {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: string;
  scope: "order" | "product" | "product_series";
  scope_target_id: string;
  min_order_value: string;
  max_redemptions: string;
  max_redemptions_per_customer: string;
  valid_from: string;
  valid_until: string;
  stackable_with_deals: boolean;
  active: boolean;
};

const inp = "w-full border border-slate-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

function pad(n: number) { return String(n).padStart(2, "0"); }
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(v: string): string | null {
  return v ? new Date(v).toISOString() : null;
}

function initialState(r: VoucherRecord | null): FormState {
  if (!r) {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return {
      code: "", description: "",
      discount_type: "percentage", discount_value: "10",
      scope: "order", scope_target_id: "",
      min_order_value: "", max_redemptions: "", max_redemptions_per_customer: "",
      valid_from: toLocalInput(now.toISOString()),
      valid_until: toLocalInput(in30.toISOString()),
      stackable_with_deals: false, active: true,
    };
  }
  return {
    code: r.code,
    description: r.description ?? "",
    discount_type: r.discount_type,
    discount_value: String(r.discount_value),
    scope: r.scope,
    scope_target_id: r.scope_target_id ?? "",
    min_order_value: r.min_order_value != null ? String(r.min_order_value) : "",
    max_redemptions: r.max_redemptions != null ? String(r.max_redemptions) : "",
    max_redemptions_per_customer: r.max_redemptions_per_customer != null ? String(r.max_redemptions_per_customer) : "",
    valid_from: toLocalInput(r.valid_from),
    valid_until: toLocalInput(r.valid_until),
    stackable_with_deals: r.stackable_with_deals,
    active: r.active,
  };
}

export default function VoucherEditClient({
  voucherId,
  initial,
  redemptionCount,
  products,
  seriesList,
}: {
  voucherId: string | null;
  initial: VoucherRecord | null;
  redemptionCount: number;
  products: ProductOption[];
  seriesList: string[];
}) {
  const router = useRouter();
  const [f, setF] = useState<FormState>(() => initialState(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canDelete = redemptionCount === 0;
  const valueUnit = f.discount_type === "percentage" ? "%" : "€";

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setF((s) => ({ ...s, [key]: value }));
  }

  async function persist(overrides?: Partial<FormState>) {
    const data = { ...f, ...overrides };
    setSaving(true);
    setError(null);
    setNotice(null);

    const body = {
      ...(voucherId ? { id: voucherId } : {}),
      code: normalizeVoucherCode(data.code),
      description: data.description,
      discount_type: data.discount_type,
      discount_value: Number(data.discount_value),
      scope: data.scope,
      scope_target_id: data.scope === "order" ? null : data.scope_target_id,
      min_order_value: data.min_order_value === "" ? null : Number(data.min_order_value),
      max_redemptions: data.max_redemptions === "" ? null : Number(data.max_redemptions),
      max_redemptions_per_customer: data.max_redemptions_per_customer === "" ? null : Number(data.max_redemptions_per_customer),
      valid_from: fromLocalInput(data.valid_from),
      valid_until: fromLocalInput(data.valid_until),
      stackable_with_deals: data.stackable_with_deals,
      active: data.active,
    };

    try {
      const res = await fetch("/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Fehler beim Speichern"); return; }

      if (overrides) setF(data); // reflect quick-toggle in the UI

      if (!voucherId) {
        router.push(`/admin/vouchers/${json.id}`);
      } else {
        setNotice("Gespeichert.");
        router.refresh();
      }
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!voucherId) return;
    if (!confirm("Diesen Gutschein endgültig löschen?")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/vouchers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: voucherId }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Fehler beim Löschen"); return; }
      router.push("/admin/vouchers");
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  }

  const status = initial
    ? voucherStatus(
        { active: f.active, valid_from: fromLocalInput(f.valid_from) ?? new Date().toISOString(), valid_until: fromLocalInput(f.valid_until) ?? new Date().toISOString(), max_redemptions: f.max_redemptions === "" ? null : Number(f.max_redemptions) },
        redemptionCount,
      )
    : null;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/vouchers" className="text-sm text-slate-400 hover:text-slate-600">← Gutscheine</Link>
          <h1 className="text-2xl font-semibold text-slate-800 mt-1">
            {voucherId ? (f.code || "Gutschein bearbeiten") : "Neuer Gutschein"}
          </h1>
          {status && (
            <p className="text-xs text-slate-500 mt-1">
              Status: <span className="font-medium">{VOUCHER_STATUS_LABEL[status]}</span>
              {" · "}{redemptionCount} Einlösung{redemptionCount === 1 ? "" : "en"}
            </p>
          )}
        </div>
        <button onClick={() => persist()} disabled={saving} className="btn-orange px-5 py-2 text-sm disabled:opacity-60">
          {saving ? "Speichern..." : "Speichern"}
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
      {notice && <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">{notice}</p>}

      <div className="bg-white rounded-xl border border-slate-200 p-6 grid grid-cols-1 gap-4">
        <Row label="Code *">
          <input
            className={`${inp} font-mono uppercase`}
            value={f.code}
            onChange={(e) => set("code", e.target.value.toUpperCase())}
            placeholder="z. B. WILLKOMMEN10"
          />
        </Row>

        <Row label="Beschreibung (intern)">
          <input className={inp} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Optionale Notiz" />
        </Row>

        <div className="grid grid-cols-2 gap-4">
          <Row label="Rabattart *">
            <select className={inp} value={f.discount_type} onChange={(e) => set("discount_type", e.target.value as FormState["discount_type"])}>
              <option value="percentage">Prozent (%)</option>
              <option value="fixed_amount">Fester Betrag (€)</option>
            </select>
          </Row>
          <Row label={`Rabattwert * (${valueUnit})`}>
            <input type="number" step="0.01" min="0" className={inp} value={f.discount_value} onChange={(e) => set("discount_value", e.target.value)} />
          </Row>
        </div>

        <Row label="Geltungsbereich *">
          <select
            className={inp}
            value={f.scope}
            onChange={(e) => { const scope = e.target.value as FormState["scope"]; setF((s) => ({ ...s, scope, scope_target_id: "" })); }}
          >
            <option value="order">Gesamter Warenkorb</option>
            <option value="product">Einzelnes Produkt</option>
            <option value="product_series">Produktserie</option>
          </select>
        </Row>

        {f.scope === "product" && (
          <Row label="Produkt *">
            <select className={inp} value={f.scope_target_id} onChange={(e) => set("scope_target_id", e.target.value)}>
              <option value="">– bitte wählen –</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Row>
        )}

        {f.scope === "product_series" && (
          <Row label="Serie *">
            <select className={inp} value={f.scope_target_id} onChange={(e) => set("scope_target_id", e.target.value)}>
              <option value="">– bitte wählen –</option>
              {seriesList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Row>
        )}

        <Row label="Mindestbestellwert (€, optional)">
          <input type="number" step="0.01" min="0" className={inp} value={f.min_order_value} onChange={(e) => set("min_order_value", e.target.value)} placeholder="kein Mindestwert" />
        </Row>

        <div className="grid grid-cols-2 gap-4">
          <Row label="Max. Einlösungen gesamt (optional)">
            <input type="number" min="0" className={inp} value={f.max_redemptions} onChange={(e) => set("max_redemptions", e.target.value)} placeholder="unbegrenzt" />
          </Row>
          <Row label="Max. pro Kunde (optional)">
            <input type="number" min="0" className={inp} value={f.max_redemptions_per_customer} onChange={(e) => set("max_redemptions_per_customer", e.target.value)} placeholder="unbegrenzt" />
          </Row>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Row label="Gültig ab">
            <input type="datetime-local" className={inp} value={f.valid_from} onChange={(e) => set("valid_from", e.target.value)} />
          </Row>
          <Row label="Gültig bis *">
            <input type="datetime-local" className={inp} value={f.valid_until} onChange={(e) => set("valid_until", e.target.value)} />
          </Row>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input type="checkbox" checked={f.stackable_with_deals} onChange={(e) => set("stackable_with_deals", e.target.checked)} className="rounded" />
          Mit Aktionsangeboten kombinierbar
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="rounded" />
          Aktiv
        </label>
      </div>

      {voucherId && (
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => persist({ active: !f.active })}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {f.active ? "Deaktivieren" : "Aktivieren"}
          </button>

          {canDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Löschen
            </button>
          ) : (
            <span className="text-xs text-slate-400">
              Bereits eingelöst – Löschen nicht möglich. Bitte deaktivieren.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
