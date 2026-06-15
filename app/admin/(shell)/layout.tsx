import Link from "next/link";
import AdminSignOut from "./AdminSignOut";

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200">
          <span className="font-semibold text-slate-800 text-sm">BuKaRa Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <Link
            href="/admin/dashboard"
            className="flex items-center px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Produkte
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Kategorien
          </Link>
          <Link
            href="/admin/deals"
            className="flex items-center px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Angebote
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Bestellungen
          </Link>

          <div className="px-3 pt-5 pb-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">V2 Katalog</span>
          </div>
          <Link
            href="/admin/v2/variants"
            className="flex items-center px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Varianten
          </Link>
          {/* Slice-2 entries — inert until the write layer lands. */}
          {["Produkte", "Nicht zugeordnet", "Kategorien", "Aktionen", "Stammdaten", "Händler"].map(
            (label) => (
              <span
                key={label}
                aria-disabled="true"
                className="flex items-center px-3 py-2 rounded-md text-slate-300 cursor-not-allowed select-none"
                title="In Kürze verfügbar"
              >
                {label}
              </span>
            ),
          )}
        </nav>
        <div className="px-4 py-4 border-t border-slate-200">
          <AdminSignOut />
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
