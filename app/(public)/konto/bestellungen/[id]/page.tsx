import { notFound } from "next/navigation";
import KontoShell from "@/components/konto/KontoShell";
import {
  getMyOrder,
  orderRef,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_CLASSES,
} from "@/lib/konto/orders";

export const dynamic = "force-dynamic";

const fmtDateTime = (s: string) =>
  new Date(s).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const fmtEur = (n: number) =>
  (n ?? 0).toLocaleString("de-DE", { style: "currency", currency: "EUR" });

export default async function BestellungDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getMyOrder(id);
  if (!order) notFound();

  return (
    <KontoShell
      title={`Bestellung #${orderRef(order.id)}`}
      backHref="/konto/bestellungen"
      backLabel="Meine Bestellungen"
    >
      <div className="flex flex-wrap items-center gap-3 -mt-4 mb-8">
        <span className="text-sm text-slate-500">{fmtDateTime(order.submitted_at)}</span>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            ORDER_STATUS_CLASSES[order.status] ?? "bg-slate-100 text-slate-500"
          }`}
        >
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      {/* Line items */}
      <div className="rounded-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left bg-slate-50/60">
              <th className="px-4 py-3 font-medium text-slate-500">Produkt</th>
              <th className="px-4 py-3 font-medium text-slate-500 text-right">Menge</th>
              <th className="px-4 py-3 font-medium text-slate-500 text-right hidden sm:table-cell">
                Einzelpreis
              </th>
              <th className="px-4 py-3 font-medium text-slate-500 text-right">Gesamt</th>
            </tr>
          </thead>
          <tbody>
            {order.items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  Keine Positionsdaten verfügbar.
                </td>
              </tr>
            ) : (
              order.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      {item.variant_label ? <span>{item.variant_label}</span> : null}
                      {item.variant_label && item.artikel_nr ? " · " : null}
                      {item.artikel_nr ? <span className="font-mono">{item.artikel_nr}</span> : null}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-slate-700 hidden sm:table-cell">
                    {fmtEur(item.unit_price)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800">
                    {fmtEur(item.line_total)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-4 ml-auto max-w-xs rounded-sm border border-slate-200 p-4 text-sm space-y-1.5">
        {order.voucher_discount != null && order.voucher_discount > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Gutschein{order.voucher_code ? ` (${order.voucher_code})` : ""}</span>
            <span>−{fmtEur(order.voucher_discount)}</span>
          </div>
        )}
        {order.total_net != null && (
          <div className="flex justify-between text-slate-600">
            <span>Netto</span>
            <span>{fmtEur(order.total_net)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-slate-900 text-base pt-2 border-t border-slate-100">
          <span>Brutto</span>
          <span>{fmtEur(order.total_gross)}</span>
        </div>
      </div>

      {/* Order data summary */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard title="Rechnungsdaten">
          {order.firmenname && <p className="font-medium text-slate-800">{order.firmenname}</p>}
          {order.ust_idnr && <p className="text-sm text-slate-500">USt-IdNr: {order.ust_idnr}</p>}
          {order.ansprechpartner && <p className="text-sm text-slate-600 mt-1">{order.ansprechpartner}</p>}
          {order.email && <p className="text-sm text-slate-500">{order.email}</p>}
          {order.telefon && <p className="text-sm text-slate-500">{order.telefon}</p>}
        </InfoCard>
        {order.nachricht && (
          <InfoCard title="Ihre Nachricht">
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{order.nachricht}</p>
          </InfoCard>
        )}
      </div>
    </KontoShell>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-slate-200 p-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{title}</h3>
      {children}
    </div>
  );
}
