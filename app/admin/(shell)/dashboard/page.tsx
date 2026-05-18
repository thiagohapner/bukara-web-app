import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";

export const dynamic = "force-dynamic";

async function getStats() {
  const [products, deals, orders] = await Promise.all([
    supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("offers").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("orders").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  return {
    products: products.count ?? 0,
    deals: deals.count ?? 0,
    newOrders: orders.count ?? 0,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Produkte" value={stats.products} href="/admin/products" />
        <StatCard label="Aktive Angebote" value={stats.deals} href="/admin/deals" />
        <StatCard label="Neue Bestellungen" value={stats.newOrders} href="/admin/orders" accent={stats.newOrders > 0} />
      </div>
    </div>
  );
}

function StatCard({ label, value, href, accent = false }: { label: string; value: number; href: string; accent?: boolean }) {
  return (
    <a
      href={href}
      className={`block bg-white rounded-xl border p-6 hover:shadow-sm transition-shadow ${
        accent ? "border-teal-300" : "border-slate-200"
      }`}
    >
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent ? "text-teal-600" : "text-slate-800"}`}>{value}</p>
    </a>
  );
}
