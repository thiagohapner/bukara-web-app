import { Layers } from "lucide-react";
import AdminTopbar from "./AdminTopbar";
import AdminNav from "./AdminNav";

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
            B
          </span>
          <span className="font-semibold text-slate-900 text-sm">BuKaRa Admin</span>
        </div>

        <AdminNav />

        <div className="px-4 py-3 border-t border-slate-200 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <Layers className="w-4 h-4 text-slate-500" />
          </span>
          <div className="leading-tight">
            <div className="text-xs font-medium text-slate-700">v2-Katalog</div>
            <div className="text-[11px] text-slate-400">BuKaRa GmbH</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
