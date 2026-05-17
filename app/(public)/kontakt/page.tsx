"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { MapPinIcon, PhoneIcon, EnvelopeIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

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

    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          data: {
            name: form.name,
            company: form.company,
            email: form.email,
            phone: form.phone,
            subject: form.subject,
            message: form.message,
          },
        }),
      });
    } catch (err) {
      console.error("[email] contact:", err);
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
                  <InfoRow icon={<MapPinIcon className="w-5 h-5" />}>
                    Siemensstraße 24<br />72280 Dornstetten
                  </InfoRow>
                  <InfoRow icon={<PhoneIcon className="w-5 h-5" />}>
                    <a
                      href="tel:+4974439661-0"
                      className="hover:text-slate-900 transition-colors"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      +49 7443 / 9661-0
                    </a>
                  </InfoRow>
                  <InfoRow icon={<EnvelopeIcon className="w-5 h-5" />}>
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
                    <ArrowRightIcon className="w-4 h-4" strokeWidth={2.5} />
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
                      <ArrowRightIcon className="w-4 h-4" strokeWidth={2.5} />
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
