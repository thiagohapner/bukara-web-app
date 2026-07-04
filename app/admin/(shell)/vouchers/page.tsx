import Link from "next/link";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";
import { formatVoucherDiscount, voucherStatus, VOUCHER_STATUS_LABEL, type VoucherStatus } from "@/lib/vouchers";

export const dynamic = "force-dynamic";

const SCOPE_LABEL: Record<string, string> = {
  order: "Gesamter Warenkorb",
  product: "Produkt",
  product_series: "Serie",
};

const BADGE: Record<VoucherStatus, string> = {
  active: "bg-green-50 text-green-700",
  scheduled: "bg-blue-50 text-blue-700",
  expired: "bg-slate-100 text-slate-500",
  disabled: "bg-slate-100 text-slate-500",
  used_up: "bg-amber-50 text-amber-700",
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function VouchersPage() {
  const { data: vouchers } = await supabaseAdmin
    .from("vouchers")
    .select("id, code, discount_type, discount_value, scope, valid_from, valid_until, max_redemptions, active")
    .order("created_at", { ascending: false });

  const { data: redemptions } = await supabaseAdmin
    .from("voucher_redemptions")
    .select("voucher_id");

  const counts = new Map<string, number>();
  for (const r of redemptions ?? []) {
    counts.set(r.voucher_id, (counts.get(r.voucher_id) ?? 0) + 1);
  }

  const rows = vouchers ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Gutscheine</h1>
        <Link href="/admin/vouchers/new" className="btn-brand px-4 py-2 text-sm">
          + Neuer Gutschein
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="px-4 py-3 font-medium text-slate-600">Code</th>
              <th className="px-4 py-3 font-medium text-slate-600">Rabatt</th>
              <th className="px-4 py-3 font-medium text-slate-600">Bereich</th>
              <th className="px-4 py-3 font-medium text-slate-600">Gültig bis</th>
              <th className="px-4 py-3 font-medium text-slate-600">Einlösungen</th>
              <th className="px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => {
              const used = counts.get(v.id) ?? 0;
              const status = voucherStatus(v, used);
              return (
                <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-medium text-slate-800">{v.code}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatVoucherDiscount(v.discount_type, v.discount_value)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{SCOPE_LABEL[v.scope] ?? v.scope}</td>
                  <td className="px-4 py-3 text-slate-500">{fmtDate(v.valid_until)}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {used}{v.max_redemptions != null ? ` / ${v.max_redemptions}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${BADGE[status]}`}>
                      {VOUCHER_STATUS_LABEL[status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/vouchers/${v.id}`} className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                      Bearbeiten
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="text-center text-slate-400 py-12 text-sm">Noch keine Gutscheine</p>
        )}
      </div>
    </div>
  );
}
