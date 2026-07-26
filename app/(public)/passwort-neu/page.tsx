import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AuthShell from "@/components/auth/AuthShell";
import NeuForm from "./NeuForm";

// Reachable only with a valid session established by the recovery link
// (/auth/bestaetigen with type=recovery). Without it, show a neutral hint.
export default async function PasswortNeuPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return (
      <AuthShell title="Neues Passwort">
        <div className="rounded-sm border border-amber-200 bg-amber-50 p-5 text-sm text-slate-700 leading-relaxed">
          Dieser Link ist ungültig oder abgelaufen. Bitte fordern Sie das Zurücksetzen erneut an.
        </div>
        <p className="mt-6 text-sm text-slate-500">
          <Link href="/passwort-vergessen" className="font-semibold text-brand-600 hover:text-brand-700">
            Passwort erneut anfordern
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Neues Passwort" subtitle="Vergeben Sie ein neues Passwort für Ihr Konto.">
      <NeuForm />
    </AuthShell>
  );
}
