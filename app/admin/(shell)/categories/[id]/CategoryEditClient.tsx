"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import CustomSelect from "@/components/CustomSelect";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/&/g, "und")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

type CategoryData = {
  id?: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
};

const EMPTY: CategoryData = {
  name: "", slug: "", parent_id: null, sort_order: 0, is_active: true,
};

const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

export default function CategoryEditClient({
  categoryId,
  initialData,
  topLevelCategories,
}: {
  categoryId: string | null;
  initialData: CategoryData | null;
  topLevelCategories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<CategoryData>(initialData ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof CategoryData>(key: K, value: CategoryData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: toSlug(name) }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      if (categoryId) {
        const { error: e } = await supabase.from("categories").update({
          name: form.name,
          slug: form.slug,
          parent_id: form.parent_id || null,
          sort_order: form.sort_order,
          is_active: form.is_active,
        }).eq("id", categoryId);
        if (e) throw e;
        router.refresh();
      } else {
        const { error: e } = await supabase.from("categories").insert({
          name: form.name,
          slug: form.slug,
          parent_id: form.parent_id || null,
          sort_order: form.sort_order,
          is_active: form.is_active,
        });
        if (e) throw e;
        router.push("/admin/categories");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <a href="/admin/categories" className="text-sm text-slate-400 hover:text-slate-600">← Kategorien</a>
          <h1 className="text-2xl font-semibold text-slate-800 mt-1">
            {categoryId ? form.name || "Kategorie bearbeiten" : "Neue Kategorie"}
          </h1>
        </div>
        <button onClick={save} disabled={saving} className="btn-orange px-5 py-2 text-sm disabled:opacity-60">
          {saving ? "Speichern..." : "Speichern"}
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input
              className={inp}
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="z.B. Highspeedfräser"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
            <input
              className={inp}
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="highspeedfraeser"
            />
            <p className="text-xs text-slate-400 mt-1">Wird automatisch aus dem Namen generiert. Nicht ändern wenn Produkte zugewiesen sind.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Übergeordnete Kategorie</label>
            <CustomSelect
              value={form.parent_id ?? ""}
              onChange={(v) => set("parent_id", v || null)}
              options={[
                { value: "", label: "Keine (Hauptkategorie)" },
                ...topLevelCategories
                  .filter((c) => c.id !== categoryId)
                  .map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reihenfolge</label>
            <input
              type="number"
              className={inp}
              value={form.sort_order}
              onChange={(e) => set("sort_order", Number(e.target.value))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="rounded"
            />
            Aktiv
          </label>
        </div>
      </div>
    </div>
  );
}
