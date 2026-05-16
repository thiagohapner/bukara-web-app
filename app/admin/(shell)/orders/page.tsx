import Link from "next/link";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";

const STATUS_LABELS: Record<string, string> = {
  new: "Neu", confirmed: "Bestätigt", invoiced: "Fakturiert", shipped: "Versendet",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  invoiced: "bg-purple-50 text-purple-700",
  shipped: "bg-green-50 text-green-700",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  let query = supabaseAdmin
    .from("orders")
    .select("id, firmenname, email, total_gross, status, submitted_at")
    .order("submitted_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: orders } = await query;

  const fmt = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

  const fmtEur = (n: number) =>
    n?.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) ?? "—";

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Bestellungen</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        {[undefined, "new", "confirmed", "invoiced", "shipped"].map((s) => (
          <a
            key={s ?? "all"}
            href={s ? `/admin/orders?status=${s}` : "/admin/orders"}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              status === s || (!status && !s)
                ? "bg-teal-500 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s ? STATUS_LABELS[s] : "Alle"}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="px-4 py-3 font-medium text-slate-600">Datum</th>
              <th className="px-4 py-3 font-medium text-slate-600">Firma</th>
              <th className="px-4 py-3 font-medium text-slate-600">E-Mail</th>
              <th className="px-4 py-3 font-medium text-slate-600">Gesamt</th>
              <th className="px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500">{fmt(o.submitted_at)}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{o.firmenname}</td>
                <td className="px-4 py-3 text-slate-500">{o.email}</td>
                <td className="px-4 py-3 text-slate-700">{fmtEur(o.total_gross)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[o.status] ?? "bg-slate-100 text-slate-500"}`}>
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/orders/${o.id}`} className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(orders ?? []).length === 0 && (
          <p className="text-center text-slate-400 py-12 text-sm">Keine Bestellungen</p>
        )}
      </div>
    </div>
  );
}
