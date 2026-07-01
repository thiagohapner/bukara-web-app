import { Fragment } from "react";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";

export const dynamic = "force-dynamic";

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
};

export default async function CategoriesPage() {
  const { data } = await supabaseAdmin
    .from("categories")
    .select("id, name, slug, parent_id, sort_order, is_active")
    .order("sort_order");

  const categories = (data ?? []) as Category[];
  const topLevel = categories.filter((c) => c.parent_id === null);
  const subMap: Record<string, Category[]> = {};
  for (const c of categories.filter((c) => c.parent_id !== null)) {
    if (!subMap[c.parent_id!]) subMap[c.parent_id!] = [];
    subMap[c.parent_id!].push(c);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Kategorien</h1>
        <Link href="/admin/categories/new" className="btn-brand px-4 py-2 text-sm">
          + Neue Kategorie
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="px-4 py-3 font-medium text-slate-600">Slug</th>
              <th className="px-4 py-3 font-medium text-slate-600">Ebene</th>
              <th className="px-4 py-3 font-medium text-slate-600">Reihenfolge</th>
              <th className="px-4 py-3 font-medium text-slate-600">Aktiv</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {topLevel.map((parent) => (
              <Fragment key={parent.id}>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">{parent.name}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{parent.slug}</td>
                  <td className="px-4 py-3 text-slate-500">Hauptkategorie</td>
                  <td className="px-4 py-3 text-slate-500">{parent.sort_order}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${parent.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {parent.is_active ? "Ja" : "Nein"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/categories/${parent.id}`} className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                      Bearbeiten
                    </Link>
                  </td>
                </tr>
                {(subMap[parent.id] ?? []).map((sub) => (
                  <tr key={sub.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700 pl-10">↳ {sub.name}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{sub.slug}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">Unterkategorie</td>
                    <td className="px-4 py-3 text-slate-500">{sub.sort_order}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sub.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {sub.is_active ? "Ja" : "Nein"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/categories/${sub.id}`} className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                        Bearbeiten
                      </Link>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <p className="text-center text-slate-400 py-12 text-sm">Noch keine Kategorien</p>
        )}
      </div>
    </div>
  );
}
