"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Footer from "@/components/Footer";
import { SERVICES } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import ProductGallery from "@/components/ProductGallery";

const SERVICE_GALLERY: Record<string, { bg: string; label: string }> = {
  "schaerfservice":  { bg: "#e8f7f6", label: "SRV" },
  "sonderwerkzeug": { bg: "#f5ede8", label: "SWZ" },
};

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-[#00A597] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function inputClass(extra = "") {
  return `w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A597]/20 focus:border-[#00A597] transition-colors ${extra}`;
}

type SchaerfForm = {
  company: string;
  contact: string;
  email: string;
  pickupAddressDeviation: string;
  pickupDate: string;
  pickupTimes: string;
  pickupLocation: "Büro" | "Warenannahme" | "Sonstiges" | "";
  packageSize: string;
  packageWeight: string;
  carbideReplacement: "wirtschaftlich" | "rücksprache" | "nein" | "";
  engraving: "bukara" | "neutral" | "";
};

type SonderForm = {
  company: string;
  vat: string;
  contact: string;
  email: string;
  phone: string;
  message: string;
  material: string;
  dimensions: string;
  quantity: string;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 mt-8 first:mt-0">
      {children}
    </p>
  );
}

function SchaerfContent({ serviceSlug }: { serviceSlug: string }) {
  const router = useRouter();
  const service = SERVICES.find((s) => s.slug === serviceSlug)!;
  const gallery = SERVICE_GALLERY[serviceSlug] ?? { bg: "#e8f7f6", label: "SRV" };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<SchaerfForm>({
    company: "", contact: "", email: "",
    pickupAddressDeviation: "", pickupDate: "", pickupTimes: "", pickupLocation: "",
    packageSize: "", packageWeight: "",
    carbideReplacement: "", engraving: "",
  });

  function field(key: keyof SchaerfForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  const carbideLabels: Record<string, string> = {
    wirtschaftlich: "Ja, soweit wirtschaftlich",
    rücksprache: "Ja, aber nur nach Rücksprache",
    nein: "Nein, ist nicht erwünscht – bitte unbearbeitet zurückschicken",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    const { error } = await supabase.from("service_inquiries").insert({
      service_type: "schaerfen",
      company_name: form.company,
      contact_name: form.contact,
      email: form.email,
      pickup_address_deviation: form.pickupAddressDeviation || null,
      preferred_pickup_date: form.pickupDate || null,
      pickup_times: form.pickupTimes || null,
      pickup_location: form.pickupLocation || null,
      package_size: form.packageSize || null,
      package_weight: form.packageWeight || null,
      carbide_replacement: form.carbideReplacement ? carbideLabels[form.carbideReplacement] : null,
      engraving: form.engraving || null,
    });
    setSubmitting(false);
    if (error) {
      setSubmitError("Ihre Anfrage konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut.");
    } else {
      router.push("/danke");
    }
  }

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10 pb-20">
      <div className="flex flex-col lg:flex-row gap-10 items-start">

        <div className="w-full lg:w-[42%] flex-shrink-0 lg:sticky lg:top-[72px]">
          <ProductGallery
            images={service.images ?? []}
            placeholderBg={gallery.bg}
            placeholderLabel={gallery.label}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
            {service.name}
          </h1>
          <p className="text-slate-500 text-sm mb-4 leading-relaxed">{service.tagline}</p>
          <p className="text-slate-700 text-sm mb-6 leading-relaxed">{service.description}</p>

          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Leistungen
            </p>
            <ul className="flex flex-col gap-2">
              {service.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-slate-900">
                  <CheckIcon />
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="h-px bg-slate-100 mb-8" />

          <form onSubmit={handleSubmit} noValidate>
            <SectionLabel>Kontaktdaten</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Firma <span className="text-[#9B242A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.company}
                  onChange={field("company")}
                  className={inputClass()}
                  placeholder="Muster GmbH"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Kontaktperson <span className="text-[#9B242A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.contact}
                  onChange={field("contact")}
                  className={inputClass()}
                  placeholder="Max Mustermann"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  E-Mail <span className="text-[#9B242A]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={field("email")}
                  className={inputClass()}
                  placeholder="anfrage@firma.de"
                />
              </div>
            </div>

            <SectionLabel>Abholung</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Abweichende Abholadresse / Sonstige Bemerkungen
                </label>
                <textarea
                  rows={2}
                  value={form.pickupAddressDeviation}
                  onChange={field("pickupAddressDeviation")}
                  className={inputClass("resize-none")}
                  placeholder="Falls abweichend von Ihrer hinterlegten Adresse..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Gewünschtes Abholdatum <span className="text-[#9B242A]">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={form.pickupDate}
                  onChange={field("pickupDate")}
                  className={inputClass()}
                />
                <p className="text-[11px] text-slate-400 mt-1.5">Abholungen erfolgen in der Regel zwischen 07:00 und 16:00 Uhr</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Abholungszeiten <span className="text-[#9B242A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.pickupTimes}
                  onChange={field("pickupTimes")}
                  className={inputClass()}
                  placeholder="z. B. 08:00–12:00, 13:00–16:00"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">Falls Mittagspause, bitte angeben</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-2">
                  Gewünschter Abholungsort <span className="text-[#9B242A]">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {(["Büro", "Warenannahme", "Sonstiges"] as const).map((loc) => (
                    <label key={loc} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pickupLocation"
                        value={loc}
                        checked={form.pickupLocation === loc}
                        onChange={() => setForm((f) => ({ ...f, pickupLocation: loc }))}
                        className="accent-[#00A597] w-4 h-4"
                        required
                      />
                      <span className="text-sm text-slate-800">{loc}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <SectionLabel>Paket</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Paketgröße <span className="text-[#9B242A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.packageSize}
                  onChange={field("packageSize")}
                  className={inputClass()}
                  placeholder="z. B. 30 × 20 × 15"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">Höhe × Breite × Tiefe in cm</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Paketgewicht <span className="text-[#9B242A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.packageWeight}
                  onChange={field("packageWeight")}
                  className={inputClass()}
                  placeholder="z. B. 5"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">in kg</p>
              </div>
            </div>

            <SectionLabel>Serviceoptionen</SectionLabel>
            <div className="flex flex-col gap-6 mb-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">
                  Zahnersatz (falls nötig) durchführen? <span className="text-[#9B242A]">*</span>
                </label>
                <div className="flex flex-col gap-2">
                  {([
                    { value: "wirtschaftlich", label: "Ja, soweit wirtschaftlich" },
                    { value: "rücksprache",   label: "Ja, aber nur nach Rücksprache" },
                    { value: "nein",          label: "Nein, ist nicht erwünscht – bitte unbearbeitet zurückschicken" },
                  ] as const).map(({ value, label }) => (
                    <label key={value} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="carbideReplacement"
                        value={value}
                        checked={form.carbideReplacement === value}
                        onChange={() => setForm((f) => ({ ...f, carbideReplacement: value }))}
                        className="accent-[#00A597] w-4 h-4 mt-0.5 flex-shrink-0"
                        required
                      />
                      <span className="text-sm text-slate-800">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">
                  Gravur <span className="text-[#9B242A]">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {([
                    { value: "bukara",  label: "Bukara Gravur" },
                    { value: "neutral", label: "Neutrale Gravur" },
                  ] as const).map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="engraving"
                        value={value}
                        checked={form.engraving === value}
                        onChange={() => setForm((f) => ({ ...f, engraving: value }))}
                        className="accent-[#00A597] w-4 h-4"
                        required
                      />
                      <span className="text-sm text-slate-800">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {submitError && (
              <p className="text-sm text-red-500 mb-4 mt-4">{submitError}</p>
            )}

            <div className="mt-8">
              <button
                type="submit"
                disabled={submitting}
                className="btn-orange"
                style={{ opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? "Wird gesendet…" : "Anfrage absenden"}
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
    </section>
  );
}

function SonderContent({ serviceSlug }: { serviceSlug: string }) {
  const router = useRouter();
  const service = SERVICES.find((s) => s.slug === serviceSlug)!;
  const gallery = SERVICE_GALLERY[serviceSlug] ?? { bg: "#f5ede8", label: "SWZ" };
  const fileRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [form, setForm] = useState<SonderForm>({
    company: "", vat: "", contact: "", email: "", phone: "", message: "",
    material: "", dimensions: "", quantity: "",
  });

  function field(key: keyof SonderForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    let specFileUrl: string | null = null;
    const file = fileRef.current?.files?.[0] ?? null;

    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("service-files")
        .upload(path, file);
      if (uploadError) {
        setSubmitting(false);
        setSubmitError("Datei konnte nicht hochgeladen werden. Bitte versuchen Sie es erneut.");
        return;
      }
      const { data: urlData } = supabase.storage.from("service-files").getPublicUrl(path);
      specFileUrl = urlData?.publicUrl ?? null;
    }

    const { error } = await supabase.from("service_inquiries").insert({
      service_type: "sonderwerkzeug",
      company_name: form.company,
      vat_number: form.vat || null,
      contact_name: form.contact,
      email: form.email,
      phone: form.phone || null,
      message: form.message || null,
      material: form.material || null,
      dimensions_spec: form.dimensions || null,
      quantity_needed: form.quantity ? parseInt(form.quantity) : null,
      spec_file_url: specFileUrl,
    });

    setSubmitting(false);
    if (error) {
      setSubmitError("Ihre Anfrage konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut.");
    } else {
      router.push("/danke");
    }
  }

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10 pb-20">
      <div className="flex flex-col lg:flex-row gap-10 items-start">

        <div className="w-full lg:w-[42%] flex-shrink-0 lg:sticky lg:top-[72px]">
          <ProductGallery
            images={service.images ?? []}
            placeholderBg={gallery.bg}
            placeholderLabel={gallery.label}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
            {service.name}
          </h1>
          <p className="text-slate-500 text-sm mb-4 leading-relaxed">{service.tagline}</p>
          <p className="text-slate-700 text-sm mb-6 leading-relaxed">{service.description}</p>

          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Leistungen
            </p>
            <ul className="flex flex-col gap-2">
              {service.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-slate-900">
                  <CheckIcon />
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="h-px bg-slate-100 mb-8" />

          <form onSubmit={handleSubmit} noValidate>
            <SectionLabel>Ihre Kontaktdaten</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Firmenname <span className="text-[#9B242A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.company}
                  onChange={field("company")}
                  className={inputClass()}
                  placeholder="Muster GmbH"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  USt-IdNr.
                </label>
                <input
                  type="text"
                  value={form.vat}
                  onChange={field("vat")}
                  className={inputClass()}
                  placeholder="DE123456789"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Ansprechpartner <span className="text-[#9B242A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.contact}
                  onChange={field("contact")}
                  className={inputClass()}
                  placeholder="Max Mustermann"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  E-Mail <span className="text-[#9B242A]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={field("email")}
                  className={inputClass()}
                  placeholder="anfrage@firma.de"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Telefon</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={field("phone")}
                  className={inputClass()}
                  placeholder="+49 (0) 123 456789"
                />
              </div>
            </div>

            <SectionLabel>Werkzeugspezifikation</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Material <span className="text-[#9B242A]">*</span>
                </label>
                <select
                  required
                  value={form.material}
                  onChange={field("material")}
                  className={inputClass()}
                >
                  <option value="">Bitte wählen</option>
                  <option value="Holz">Holz</option>
                  <option value="MDF/Spanplatte">MDF / Spanplatte</option>
                  <option value="Kunststoff">Kunststoff</option>
                  <option value="Aluminium">Aluminium</option>
                  <option value="Sonstige">Sonstige</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Benötigte Stückzahl <span className="text-[#9B242A]">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.quantity}
                  onChange={field("quantity")}
                  className={inputClass()}
                  placeholder="z. B. 10"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Abmessungen & Spezifikationen <span className="text-[#9B242A]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.dimensions}
                  onChange={field("dimensions")}
                  className={inputClass("resize-none")}
                  placeholder="z. B. Durchmesser 12 mm, Schneidenlänge 35 mm, Schaftdurchmesser 12 mm, Toleranz ±0,01 mm..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Technische Zeichnung / Spezifikation{" "}
                  <span className="text-slate-400 font-normal">(optional, PDF, DXF, DWG, JPG, PNG — max. 10 MB)</span>
                </label>
                <div
                  className="border border-dashed border-slate-300 rounded-xl px-4 py-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#00A597] transition-colors bg-slate-50"
                  onClick={() => fileRef.current?.click()}
                >
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-sm text-slate-500">
                    {fileName ? fileName : "Datei auswählen oder hier ablegen"}
                  </span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.dxf,.dwg,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Nachricht</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={field("message")}
                  className={inputClass("resize-none")}
                  placeholder="Weitere Angaben zu Ihrem Projekt oder besonderen Anforderungen..."
                />
              </div>
            </div>

            {submitError && (
              <p className="text-sm text-red-500 mb-4 mt-4">{submitError}</p>
            )}

            <div className="mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="btn-orange"
                style={{ opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? "Wird gesendet…" : "Anfrage absenden"}
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
    </section>
  );
}

export default function LoesungenDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>
              Start
            </Link>
            <span>/</span>
            <Link href="/loesungen" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>
              Lösungen
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">{service.name}</span>
          </nav>
        </div>

        {service.type === "schaerfen" ? (
          <SchaerfContent serviceSlug={slug} />
        ) : (
          <SonderContent serviceSlug={slug} />
        )}
      </main>
      <Footer />
    </>
  );
}
