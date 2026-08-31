import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";

export const dynamic = "force-dynamic";

type ZeroResultRow = {
  material: string | null;
  application: string | null;
  min_diameter: number | null;
  max_diameter: number | null;
};

type RecentRow = {
  created_at: string;
  material: string | null;
  application: string | null;
  min_diameter: number | null;
  max_diameter: number | null;
  result_count: number;
};

function diameterLabel(row: { min_diameter: number | null; max_diameter: number | null }): string | null {
  if (row.min_diameter == null && row.max_diameter == null) return null;
  if (row.max_diameter == null) return `ab ${row.min_diameter} mm`;
  return `${row.min_diameter}–${row.max_diameter} mm`;
}

async function getData() {
  const [totalRes, zeroRes, recentRes] = await Promise.all([
    supabaseAdminV2.from("chat_queries").select("id", { count: "exact", head: true }),
    supabaseAdminV2
      .from("chat_queries")
      .select("material, application, min_diameter, max_diameter")
      .eq("result_count", 0)
      .order("created_at", { ascending: false })
      .limit(1000),
    supabaseAdminV2
      .from("chat_queries")
      .select("created_at, material, application, min_diameter, max_diameter, result_count")
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  const zeroRows = (zeroRes.data ?? []) as ZeroResultRow[];
  const gapCounts = new Map<string, { material: string | null; application: string | null; count: number }>();
  for (const row of zeroRows) {
    const key = `${row.material ?? "–"}::${row.application ?? "–"}`;
    const existing = gapCounts.get(key);
    if (existing) existing.count += 1;
    else gapCounts.set(key, { material: row.material, application: row.application, count: 1 });
  }
  const gaps = [...gapCounts.values()].sort((a, b) => b.count - a.count).slice(0, 15);

  return {
    total: totalRes.count ?? 0,
    zeroResultCount: zeroRows.length,
    gaps,
    recent: (recentRes.data ?? []) as RecentRow[],
    tableMissing: Boolean(totalRes.error),
  };
}

export default async function ChatQueriesPage() {
  const { total, zeroResultCount, gaps, recent, tableMissing } = await getData();

  if (tableMissing) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Chat-Anfragen</h1>
        <p className="text-sm text-neutral-500 mt-2">
          Noch keine Daten — die Tabelle <code>v2.chat_queries</code> wird erst befüllt, sobald Kund:innen den
          Werkzeug-Lotse-Chat auf der Website nutzen.
        </p>
      </div>
    );
  }

  const zeroRate = total > 0 ? Math.round((zeroResultCount / total) * 100) : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Chat-Anfragen</h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          Der Werkzeug-Lotse lernt nicht selbst — diese Liste ist der Feedback-Loop: Material-/Anwendungs-
          Kombinationen ohne Treffer zeigen, wo Produktdaten (Materialien, Anwendungs-Tags) nachgepflegt werden
          sollten.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Anfragen gesamt" value={total} />
        <StatCard label="Ohne Treffer" value={zeroResultCount} accent={zeroResultCount > 0} />
        <StatCard label="Trefferquote" value={`${100 - zeroRate}%`} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 mb-8">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Häufigste Lücken</h2>
          <p className="text-sm text-neutral-400 mt-0.5">Material + Anwendung, die am öftesten zu null Treffern führten</p>
        </div>
        {gaps.length === 0 ? (
          <p className="px-6 py-6 text-sm text-neutral-500">Bisher keine Anfragen ohne Treffer — sehr gut.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-400 text-xs uppercase tracking-wide">
                <th className="px-6 py-2 font-medium">Material</th>
                <th className="px-6 py-2 font-medium">Anwendung</th>
                <th className="px-6 py-2 font-medium text-right">Anfragen</th>
              </tr>
            </thead>
            <tbody>
              {gaps.map((g, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-6 py-2.5 text-slate-800">{g.material ?? "—"}</td>
                  <td className="px-6 py-2.5 text-slate-800">{g.application ?? "—"}</td>
                  <td className="px-6 py-2.5 text-right font-semibold text-slate-900">{g.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Letzte Anfragen</h2>
        </div>
        {recent.length === 0 ? (
          <p className="px-6 py-6 text-sm text-neutral-500">Noch keine Anfragen protokolliert.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-400 text-xs uppercase tracking-wide">
                <th className="px-6 py-2 font-medium">Zeit</th>
                <th className="px-6 py-2 font-medium">Material</th>
                <th className="px-6 py-2 font-medium">Anwendung</th>
                <th className="px-6 py-2 font-medium">Ø</th>
                <th className="px-6 py-2 font-medium text-right">Treffer</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-6 py-2.5 text-neutral-500">
                    {new Date(r.created_at).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="px-6 py-2.5 text-slate-800">{r.material ?? "—"}</td>
                  <td className="px-6 py-2.5 text-slate-800">{r.application ?? "—"}</td>
                  <td className="px-6 py-2.5 text-slate-800">{diameterLabel(r) ?? "—"}</td>
                  <td
                    className={`px-6 py-2.5 text-right font-semibold ${
                      r.result_count === 0 ? "text-red-600" : "text-slate-900"
                    }`}
                  >
                    {r.result_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = false }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className={`bg-white rounded-xl border p-6 ${accent ? "border-teal-300" : "border-slate-200"}`}>
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent ? "text-teal-600" : "text-slate-800"}`}>{value}</p>
    </div>
  );
}
