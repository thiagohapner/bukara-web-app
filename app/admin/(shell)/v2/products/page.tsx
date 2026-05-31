import Link from "next/link";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function V2ProductsPage() {
  const { data: products } = await supabaseAdminV2
    .from("products")
    .select("id, slug, display_name, base_name, badge, is_active, has_public_page, sort_order")
    .order("sort_order");

  // SKU counts per product
  const { data: skuCounts } = await supabaseAdminV2
    .from("skus")
    .select("product_id")
    .not("product_id", "is", null);

  const countByProduct: Record<string, number> = {};
  for (const s of (skuCounts ?? []) as { product_id: string }[]) {
    countByProduct[s.product_id] = (countByProduct[s.product_id] ?? 0) + 1;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">v2 Produkte</h1>
          <p className="text-sm text-slate-400 mt-0.5">{(products ?? []).length} Produkte im v2-Katalog</p>
        </div>
        <Link href="/admin/v2/products/new" className="btn-orange px-4 py-2 text-sm">
          + Neues Produkt
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="px-4 py-3 font-medium text-slate-600">Slug</th>
              <th className="px-4 py-3 font-medium text-slate-600">Badge</th>
              <th className="px-4 py-3 font-medium text-slate-600">SKUs</th>
              <th className="px-4 py-3 font-medium text-slate-600">Aktiv</th>
              <th className="px-4 py-3 font-medium text-slate-600">Öffentlich</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{(p.display_name ?? p.base_name) || "—"}</td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.slug}</td>
                <td className="px-4 py-3 text-slate-500">{p.badge ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">{countByProduct[p.id] ?? 0}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {p.is_active ? "Ja" : "Nein"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.has_public_page ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
                    {p.has_public_page ? "Ja" : "Nein"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/v2/products/${p.id}`} className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                    Bearbeiten
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(products ?? []).length === 0 && (
          <p className="text-center text-slate-400 py-12 text-sm">Noch keine v2-Produkte</p>
        )}
      </div>
    </div>
  );
}
