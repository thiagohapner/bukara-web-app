import { createClient } from "@/lib/supabase/server";
import KontoShell from "@/components/konto/KontoShell";

// Account overview. Orders, password and sign-out live in the left-rail menu
// (KontoShell); this page shows the stored profile data. Access is enforced by
// middleware (/konto/*).
export default async function KontoPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .schema("v2")
    .from("customer_profiles")
    .select("contact_name, company_name, vat_number, phone, email")
    .maybeSingle();

  const email = profile?.email ?? userData.user?.email ?? "";
  const hasCompany = !!profile?.company_name?.trim();

  return (
    <KontoShell title="Übersicht">
      <div className="rounded-sm border border-slate-200 divide-y divide-slate-100 bg-white/70">
        <Row label="Ansprechpartner" value={profile?.contact_name} />
        <Row label="Firma" value={profile?.company_name} />
        <Row label="USt-IdNr." value={profile?.vat_number} />
        <Row label="Telefon" value={profile?.phone} />
        <Row label="E-Mail" value={email} />
      </div>

      {!hasCompany && (
        <p className="mt-4 text-sm text-slate-500 leading-relaxed">
          Ihre Firmendaten ergänzen wir automatisch bei Ihrer ersten Bestellung.
        </p>
      )}
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
