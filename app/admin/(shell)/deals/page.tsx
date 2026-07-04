import Link from "next/link";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";

export default async function DealsPage() {
  const { data: deals } = await supabaseAdmin
    .from("offers")
    .select("id, slug, title, subtitle, is_active, sort_order")
    .order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Angebote</h1>
        <Link href="/admin/deals/new" className="btn-brand px-4 py-2 text-sm">
          + Neues Angebot
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="px-4 py-3 font-medium text-slate-600">Titel</th>
              <th className="px-4 py-3 font-medium text-slate-600">Slug</th>
              <th className="px-4 py-3 font-medium text-slate-600">Aktiv</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(deals ?? []).map((d) => (
              <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{d.title}</td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{d.slug}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${d.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {d.is_active ? "Ja" : "Nein"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/deals/${d.id}`} className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                    Bearbeiten
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(deals ?? []).length === 0 && (
          <p className="text-center text-slate-400 py-12 text-sm">Noch keine Angebote</p>
        )}
      </div>
    </div>
  );
}
