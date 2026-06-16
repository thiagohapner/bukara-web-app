import { getDimensionRows } from "@/lib/v2/dimensions";

/** Dimensions table for the selected SKU (used as accordion content). Hides NULL/empty fields. */
export default function KatalogAbmessungenTable({ sku }: { sku: Record<string, unknown> | null }) {
  if (!sku) return null;
  const rows = getDimensionRows(sku);
  if (rows.length === 0) return null;

  return (
    <table className="w-full text-base border border-slate-100 rounded-lg overflow-hidden">
      <tbody>
        {rows.map(({ label, value }) => (
          <tr key={label} className="border-b border-slate-50 last:border-0">
            <td className="py-2.5 px-3 text-slate-400">{label}</td>
            <td className="py-2.5 px-3 text-right text-slate-900">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
