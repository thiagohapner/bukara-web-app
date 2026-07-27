import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import KontoShell from "@/components/konto/KontoShell";

// Minimal account overview (Phase 1). Orders, inquiries and data editing
// follow in Phase 2. Access is enforced by middleware (/konto/*).
export default async function KontoPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .schema("v2")
    .from("customer_profiles")
    .select("contact_name, company_name, email")
    .maybeSingle();

  const email = profile?.email ?? userData.user?.email ?? "";

  return (
    <KontoShell title="Mein Konto">
      <div className="rounded-sm border border-slate-200 divide-y divide-slate-100">
        <Row label="Ansprechpartner" value={profile?.contact_name} />
        <Row label="Firma" value={profile?.company_name} />
        <Row label="E-Mail" value={email} />
      </div>

      <div className="mt-6">
        <Link
          href="/konto/bestellungen"
          className="flex items-center justify-between rounded-sm border border-slate-200 px-4 py-4 hover:bg-brand-25/50 hover:border-brand-600 transition-colors"
          style={{ textDecoration: "none" }}
        >
          <span className="text-sm font-medium text-slate-900">Meine Bestellungen</span>
          <span className="text-slate-400" aria-hidden>→</span>
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href="/konto/passwort"
          className="inline-flex items-center rounded-sm border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-brand-25 hover:border-brand-600 transition-colors"
          style={{ textDecoration: "none" }}
        >
          Passwort ändern
        </Link>

        <form action="/auth/abmelden" method="post">
          <button
            type="submit"
            className="inline-flex items-center rounded-sm px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Abmelden
          </button>
        </form>
      </div>
    </KontoShell>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-4 py-3.5">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide sm:w-40 flex-shrink-0">
        {label}
      </span>
      <span className="text-sm text-slate-800">{value || "—"}</span>
    </div>
  );
}
