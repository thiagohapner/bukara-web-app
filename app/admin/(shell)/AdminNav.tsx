"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  ShoppingCart,
  Boxes,
  Inbox,
  Megaphone,
  Database,
  Store,
  type LucideIcon,
} from "lucide-react";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produkte", icon: Package },
  { href: "/admin/categories", label: "Kategorien", icon: FolderTree },
  { href: "/admin/deals", label: "Angebote", icon: Tag },
  { href: "/admin/orders", label: "Bestellungen", icon: ShoppingCart },
];

// Slice-2 entries — inert until the write layer lands.
const V2_INERT: { label: string; icon: LucideIcon }[] = [
  { label: "Produkte", icon: Package },
  { label: "Nicht zugeordnet", icon: Inbox },
  { label: "Kategorien", icon: FolderTree },
  { label: "Aktionen", icon: Megaphone },
  { label: "Stammdaten", icon: Database },
  { label: "Händler", icon: Store },
];

export default function AdminNav() {
  const pathname = usePathname();

  const linkCls = (active: boolean) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
      active
        ? "bg-slate-100 text-slate-900 font-medium"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5 text-sm overflow-y-auto">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} className={linkCls(active)}>
            <Icon className={`w-4 h-4 ${active ? "text-slate-700" : "text-slate-400"}`} />
            {label}
          </Link>
        );
      })}

      <div className="px-3 pt-5 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          V2 Katalog
        </span>
      </div>
      <Link
        href="/admin/v2/variants"
        className={linkCls(pathname.startsWith("/admin/v2/variants"))}
      >
        <Boxes
          className={`w-4 h-4 ${
            pathname.startsWith("/admin/v2/variants") ? "text-slate-700" : "text-slate-400"
          }`}
        />
        Varianten
      </Link>
      {V2_INERT.map(({ label, icon: Icon }) => (
        <span
          key={label}
          aria-disabled="true"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 cursor-not-allowed select-none"
          title="In Kürze verfügbar"
        >
          <Icon className="w-4 h-4" />
          {label}
        </span>
      ))}
    </nav>
  );
}
