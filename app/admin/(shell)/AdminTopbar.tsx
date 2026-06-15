import { Bell, HelpCircle, Search } from "lucide-react";
import AdminSignOut from "./AdminSignOut";

/**
 * Global admin topbar. The search is a plain GET form (works without JS) that
 * routes into the variants catalog. Bell/help are static for now.
 */
export default function AdminTopbar() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-8 py-3 bg-white/90 backdrop-blur border-b border-slate-200">
      <form action="/admin/v2/variants" className="relative w-full max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="search"
          name="q"
          placeholder="Katalog durchsuchen…"
          className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
        />
      </form>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Hilfe"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Benachrichtigungen"
        >
          <Bell className="w-5 h-5" />
        </button>
        <AdminSignOut />
      </div>
    </header>
  );
}
