"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound, Package, Lock, LogOut } from "lucide-react";

// Left-rail account menu — replaces the request forms' step nav on the account
// screens. Highlights the current section and offers sign-out.
const ITEMS = [
  { href: "/konto", label: "Übersicht", Icon: UserRound, exact: true },
  { href: "/konto/bestellungen", label: "Meine Bestellungen", Icon: Package, exact: false },
  { href: "/konto/passwort", label: "Passwort ändern", Icon: Lock, exact: false },
];

export default function AccountNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="flex flex-col gap-0.5">
      {ITEMS.map(({ href, label, Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-brand-25 text-brand-700 font-medium"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
            style={{ textDecoration: "none" }}
          >
            <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.9} />
            {label}
          </Link>
        );
      })}

      <form action="/auth/abmelden" method="post" className="mt-1">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.9} />
          Abmelden
        </button>
      </form>
    </nav>
  );
}
