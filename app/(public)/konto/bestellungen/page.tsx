import Link from "next/link";
import KontoShell from "@/components/konto/KontoShell";
import {
  getMyOrders,
  orderRef,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_CLASSES,
} from "@/lib/konto/orders";

export const dynamic = "force-dynamic";

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

const fmtEur = (n: number) =>
  (n ?? 0).toLocaleString("de-DE", { style: "currency", currency: "EUR" });

export default async function BestellungenPage() {
  const orders = await getMyOrders();

  return (
    <KontoShell title="Meine Bestellungen" backHref="/konto" backLabel="Konto">
      {orders.length === 0 ? (
        <div className="rounded-sm border border-slate-200 bg-slate-50/60 px-5 py-10 text-center">
          <p className="text-sm text-slate-600">Sie haben noch keine Bestellungen aufgegeben.</p>
          <Link
            href="/katalog"
            className="mt-4 inline-flex items-center rounded-sm border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-brand-25 hover:border-brand-600 transition-colors"
            style={{ textDecoration: "none" }}
          >
            Zum Katalog
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-100 rounded-sm border border-slate-200">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/konto/bestellungen/${o.id}`}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-4 hover:bg-brand-25/50 transition-colors"
                style={{ textDecoration: "none" }}
              >
                <div className="sm:w-32 flex-shrink-0">
                  <span className="font-mono text-sm font-semibold text-slate-900">
                    #{orderRef(o.id)}
                  </span>
                </div>
                <div className="sm:w-28 flex-shrink-0 text-sm text-slate-500">
                  {fmtDate(o.submitted_at)}
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      ORDER_STATUS_CLASSES[o.status] ?? "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {ORDER_STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </div>
                <div className="sm:ml-auto text-sm font-semibold text-slate-900">
                  {fmtEur(o.total_gross)}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </KontoShell>
  );
}
