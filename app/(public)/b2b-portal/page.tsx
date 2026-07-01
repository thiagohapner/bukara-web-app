"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { DS_INPUT, DS_LABEL } from "@/lib/ds";
import { ExternalLink, ArrowRight } from "lucide-react";

type B2BForm = {
  name: string;
  company: string;
  umsatzsteuer_id: string;
  email: string;
  phone: string;
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className={DS_LABEL}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function B2BPortalPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<B2BForm>({
    name: "", company: "", umsatzsteuer_id: "", email: "", phone: "",
  });

  function field(key: keyof B2BForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.company || !form.umsatzsteuer_id || !form.email) {
      setSubmitError("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from("contact_inquiries").insert({
      name: form.name,
      company: form.company,
      email: form.email,
      phone: form.phone || null,
      subject: "B2B Portal Zugang",
      message: `Umsatzsteuer-ID: ${form.umsatzsteuer_id}`,
    });

    if (error) {
      setSubmitError("Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.");
      setSubmitting(false);
      return;
    }

    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "b2b",
          data: {
            name: form.name,
            company: form.company,
            umsatzsteuer_id: form.umsatzsteuer_id,
            email: form.email,
            phone: form.phone,
          },
        }),
      });
    } catch (err) {
      console.error("[email] b2b:", err);
    }

    router.push("/danke?type=b2b");
  }

  return (
    <>
      <main className="min-h-screen bg-white py-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-sm text-slate-400 mb-8">
            <Link href="/" className="hover:text-slate-600 transition-colors">Start</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700">B2B Portal</span>
          </nav>

          {/* Page header */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 leading-tight">
            B2B Portal
          </h1>
          <p className="text-slate-500 text-base leading-relaxed mb-10">
            Exklusiver Zugang zu unserem B2B-Bestellportal mit Sonderkonditionen, Mengenrabatten und direkter Bestellabwicklung für Geschäftskunden.
          </p>

          {/* Existing customer login */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-0.5">Bereits registriert?</p>
              <p className="text-sm text-slate-500">Melden Sie sich direkt in Ihrem B2B-Konto an.</p>
            </div>
            <a
              href="https://b2b.bukara.de/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brand inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              style={{ textDecoration: "none" }}
            >
              Login
              <ExternalLink className="w-4 h-4" strokeWidth={2.2} />
            </a>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
              Noch keinen Zugang?
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Access request form */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Zugang anfordern</h2>
            <p className="text-sm text-slate-500 mb-6">
              Füllen Sie das Formular aus — wir melden uns mit Ihren Zugangsdaten.
            </p>

            {submitError && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {submitError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="Ansprechpartner" required>
                <input
                  className={DS_INPUT}
                  placeholder="Vor- und Nachname"
                  value={form.name}
                  onChange={field("name")}
                  required
                />
              </Field>

              <Field label="Firma / Unternehmen" required>
                <input
                  className={DS_INPUT}
                  placeholder="Ihr Unternehmen"
                  value={form.company}
                  onChange={field("company")}
                  required
                />
              </Field>

              <Field label="Umsatzsteuer-ID" required>
                <input
                  className={DS_INPUT}
                  placeholder="z. B. DE123456789"
                  value={form.umsatzsteuer_id}
                  onChange={field("umsatzsteuer_id")}
                  required
                />
              </Field>

              <Field label="E-Mail-Adresse" required>
                <input
                  type="email"
                  className={DS_INPUT}
                  placeholder="ihre@email.de"
                  value={form.email}
                  onChange={field("email")}
                  required
                />
              </Field>

              <Field label="Telefon">
                <input
                  type="tel"
                  className={DS_INPUT}
                  placeholder="Optional"
                  value={form.phone}
                  onChange={field("phone")}
                />
              </Field>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-brand w-full sm:w-auto inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? "Wird gesendet…" : "Zugang anfordern"}
                  {!submitting && <ArrowRight className="w-4 h-4" strokeWidth={2.2} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
