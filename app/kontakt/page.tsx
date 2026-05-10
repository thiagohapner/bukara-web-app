"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

function inputClass(extra = "") {
  return `w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A597]/20 focus:border-[#00A597] transition-colors ${extra}`;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 mt-8 first:mt-0">
      {children}
    </p>
  );
}

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-[#00A597] flex-shrink-0">{icon}</span>
      <span className="text-slate-600 text-sm leading-relaxed">{children}</span>
    </div>
  );
}

const MapPinIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PhoneIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MailIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

type ContactForm = {
  name: string;
  company: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const SUBJECT_OPTIONS = [
  "Allgemeine Anfrage",
  "Schärfservice",
  "Sonderwerkzeuge",
  "B2B Portal",
  "Sonstiges",
];

export default function KontaktPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<ContactForm>({
    name: "", company: "", email: "", phone: "", subject: "", message: "",
  });

  function field(key: keyof ContactForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from("contact_inquiries").insert({
      name: form.name,
      company: form.company || null,
      email: form.email,
      phone: form.phone || null,
      subject: form.subject,
      message: form.message,
    });

    if (error) {
      setSubmitError("Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.");
      setSubmitting(false);
      return;
    }

    router.push("/danke");
  }

  return (
    <>
      <main className="min-h-screen bg-white">

        {/* Breadcrumb */}
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Kontakt</span>
          </nav>
        </div>

        {/* Two-column layout */}
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-8 pb-16">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

            {/* Left — heading + image + company info */}
            <div className="w-full lg:w-[40%] flex-shrink-0">
              <div className="lg:sticky lg:top-[88px]">

                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-2">
                  Kontakt
                </h1>
                <p className="text-slate-500 text-base leading-relaxed mb-8">
                  Wir beraten Sie gerne – per E-Mail, Telefon oder persönlich.
                </p>

                {/* Image */}
                <div className="relative w-full rounded-2xl overflow-hidden mb-8" style={{ aspectRatio: "16/9" }}>
                  <Image
                    src="/main_image_small.png"
                    alt="Bukara Werkzeuge"
                    fill
                    className="object-cover"
                  />
                </div>

                <p className="text-base font-extrabold text-slate-900 mb-0.5">Bukara GmbH</p>
                <p className="text-xs text-slate-400 mb-6">Präzisionswerkzeuge & Service</p>

                <div className="flex flex-col gap-4 mb-8">
                  <InfoRow icon={MapPinIcon}>
                    Siemensstraße 24<br />72280 Dornstetten
                  </InfoRow>
                  <InfoRow icon={PhoneIcon}>
                    <a
                      href="tel:+4974439661-0"
                      className="hover:text-slate-900 transition-colors"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      +49 7443 / 9661-0
                    </a>
                  </InfoRow>
                  <InfoRow icon={MailIcon}>
                    <a
                      href="mailto:info@bukara.de"
                      className="hover:text-slate-900 transition-colors"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      info@bukara.de
                    </a>
                  </InfoRow>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <Link
                    href="/ueber-uns"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00A597] hover:text-[#007A70] transition-colors"
                    style={{ textDecoration: "none" }}
                  >
                    Mehr über uns
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>

              </div>
            </div>

            {/* Right — Contact form */}
            <div className="flex-1 w-full">
              <form onSubmit={handleSubmit} className="flex flex-col gap-0">

                <SectionLabel>Ihre Angaben</SectionLabel>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Vor- und Nachname <span className="text-[#00A597]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={field("name")}
                      placeholder="Max Mustermann"
                      className={inputClass()}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Firma
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={field("company")}
                      placeholder="Muster GmbH"
                      className={inputClass()}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      E-Mail <span className="text-[#00A597]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={field("email")}
                      placeholder="max@mustermann.de"
                      className={inputClass()}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={field("phone")}
                      placeholder="+49 123 456789"
                      className={inputClass()}
                    />
                  </div>
                </div>

                <SectionLabel>Ihre Anfrage</SectionLabel>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Betreff <span className="text-[#00A597]">*</span>
                  </label>
                  <select
                    required
                    value={form.subject}
                    onChange={field("subject")}
                    className={inputClass("appearance-none cursor-pointer")}
                  >
                    <option value="" disabled>Bitte wählen…</option>
                    {SUBJECT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-8">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Nachricht <span className="text-[#00A597]">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={field("message")}
                    placeholder="Wie können wir Ihnen helfen?"
                    className={inputClass("resize-none")}
                  />
                </div>

                {submitError && (
                  <p className="text-sm text-red-600 mb-4">{submitError}</p>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-orange inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Wird gesendet…" : "Nachricht senden"}
                    {!submitting && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    )}
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
