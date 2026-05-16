import Link from "next/link";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";

export default async function ProductsPage() {
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("id, slug, name, is_active, has_public_page, badge, sort_order")
    .order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Produkte</h1>
        <Link href="/admin/products/new" className="btn-orange px-4 py-2 text-sm">
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
              <th className="px-4 py-3 font-medium text-slate-600">Aktiv</th>
              <th className="px-4 py-3 font-medium text-slate-600">Öffentlich</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.slug}</td>
                <td className="px-4 py-3 text-slate-500">{p.badge ?? "—"}</td>
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
                  <Link href={`/admin/products/${p.id}`} className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                    Bearbeiten
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(products ?? []).length === 0 && (
          <p className="text-center text-slate-400 py-12 text-sm">Noch keine Produkte</p>
        )}
      </div>
    </div>
  );
}
