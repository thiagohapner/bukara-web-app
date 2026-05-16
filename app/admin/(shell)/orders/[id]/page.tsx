import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";
import OrderStatusUpdater from "./OrderStatusUpdater";

const STATUS_LABELS: Record<string, string> = {
  new: "Neu", confirmed: "Bestätigt", invoiced: "Fakturiert", shipped: "Versendet",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const { data: cartItems } = await supabaseAdmin
    .from("cart_items")
    .select(`
      id,
      quantity,
      unit_price,
      sku:skus!cart_items_sku_id_fkey(artikel_nr, variant_label, product:products(name)),
      selected_sku:skus!cart_items_selected_sku_id_fkey(artikel_nr, variant_label)
    `)
    .eq("cart_id", order.cart_id);

  const fmt = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const fmtEur = (n: number) =>
    n?.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) ?? "—";

  return (
    <div className="max-w-3xl">
      <a href="/admin/orders" className="text-sm text-slate-400 hover:text-slate-600">← Bestellungen</a>
      <div className="flex items-start justify-between mt-2 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Bestellung</h1>
          <p className="text-sm text-slate-500 mt-1">{fmt(order.submitted_at)}</p>
        </div>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <InfoCard title="Kunde">
          <p className="font-medium">{order.firmenname}</p>
          {order.ust_idnr && <p className="text-slate-500 text-sm">USt-IdNr: {order.ust_idnr}</p>}
          <p className="text-sm mt-1">{order.ansprechpartner}</p>
          <p className="text-sm text-slate-500">{order.email}</p>
          {order.telefon && <p className="text-sm text-slate-500">{order.telefon}</p>}
        </InfoCard>
        {order.nachricht && (
          <InfoCard title="Nachricht">
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{order.nachricht}</p>
          </InfoCard>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="px-4 py-3 font-medium text-slate-600">Produkt</th>
              <th className="px-4 py-3 font-medium text-slate-600">Variante</th>
              <th className="px-4 py-3 font-medium text-slate-600 text-right">Menge</th>
              <th className="px-4 py-3 font-medium text-slate-600 text-right">Einzelpreis</th>
              <th className="px-4 py-3 font-medium text-slate-600 text-right">Gesamt</th>
            </tr>
          </thead>
          <tbody>
            {(cartItems ?? []).map((item) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const sku = item.sku as any;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const sel = item.selected_sku as any;
              const name = sku?.product?.name ?? "—";
              const varLabel = sel?.variant_label ?? sku?.variant_label ?? "";
              const artNr = sku?.artikel_nr ?? "";
              return (
                <tr key={item.id} className="border-b border-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{name}</p>
                    {artNr && <p className="text-xs text-slate-400 font-mono">{artNr}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{varLabel || "—"}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{fmtEur(item.unit_price)}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800">{fmtEur(item.unit_price * item.quantity)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm space-y-1 max-w-xs ml-auto">
        {order.total_net != null && (
          <div className="flex justify-between text-slate-600">
            <span>Netto</span><span>{fmtEur(order.total_net)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-slate-800 text-base pt-1 border-t border-slate-100 mt-2">
          <span>Brutto</span><span>{fmtEur(order.total_gross)}</span>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{title}</h3>
      {children}
    </div>
  );
}
