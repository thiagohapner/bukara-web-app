"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRound, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Account entry point in the header — an icon (left of the cart) rather than a
// written link. On hover (desktop) a popover shows the login status and account
// shortcuts; on mobile a tap navigates to /konto (middleware redirects to
// /anmelden when signed out). The popover is intentionally roomy so future
// quick-access items (Bestellungen, Anfragen, Daten) can slot in.
export default function AccountMenu() {
  // undefined = auth state not yet resolved on the client.
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadProfileName() {
      const { data } = await supabase
        .schema("v2")
        .from("customer_profiles")
        .select("contact_name")
        .maybeSingle();
      if (active) setName(data?.contact_name ?? null);
    }

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setEmail(data.user?.email ?? null);
      if (data.user) loadProfileName();
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setEmail(session?.user?.email ?? null);
      if (session?.user) loadProfileName();
      else setName(null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isAuthed = !!email;
  // Icon always points at /konto: signed-in users land there, signed-out users
  // are redirected to /anmelden?redirectTo=/konto by the middleware. This keeps
  // the icon's target stable regardless of the (async) client auth state.
  const label = isAuthed ? "Mein Konto" : "Anmelden";

  return (
    <div className="relative group flex-shrink-0">
      <Link
        href="/konto"
        aria-label={label}
        className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-25 transition-colors duration-[240ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
        style={{ textDecoration: "none" }}
      >
        <UserRound className="w-5 h-5 text-neutral-600" strokeWidth={1.7} />
        {isAuthed && (
          <span
            aria-hidden
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-brand-500 ring-2 ring-white flex items-center justify-center"
          >
            <Check className="w-2 h-2 text-white" strokeWidth={3.5} />
          </span>
        )}
      </Link>

      {/* Hover / focus popover (desktop only). The pt-2 wrapper bridges the gap
          between icon and card so the hover isn't lost in transit. */}
      <div className="hidden lg:block absolute right-0 top-full pt-2 w-64 z-50 opacity-0 invisible translate-y-1 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0">
        <div className="rounded-sm border border-neutral-100 bg-white shadow-lg shadow-slate-900/[0.08] p-4">
          {isAuthed ? (
            <>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Angemeldet als
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900 truncate">
                {name || email}
              </p>
              {name && (
                <p className="text-xs text-slate-400 truncate">{email}</p>
              )}

              <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-col">
                <PopoverLink href="/konto">Mein Konto</PopoverLink>
                <PopoverLink href="/konto/bestellungen">Meine Bestellungen</PopoverLink>
                <PopoverLink href="/konto/passwort">Passwort ändern</PopoverLink>
                <form action="/auth/abmelden" method="post" className="mt-1">
                  <button
                    type="submit"
                    className="w-full text-left py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Abmelden
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-900">Willkommen</p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Melden Sie sich an, um Ihre Bestellungen und Anfragen an einem
                Ort zu sehen.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href="/anmelden"
                  className="btn-brand py-2 text-center text-sm"
                  style={{ textDecoration: "none" }}
                >
                  Anmelden
                </Link>
                <Link
                  href="/registrieren"
                  className="inline-flex items-center justify-center rounded-sm border border-slate-800 py-2 text-sm font-medium text-slate-900 hover:bg-brand-25 hover:border-brand-600 transition-colors"
                  style={{ textDecoration: "none" }}
                >
                  Konto erstellen
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PopoverLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="py-2 text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors"
      style={{ textDecoration: "none" }}
    >
      {children}
    </Link>
  );
}
