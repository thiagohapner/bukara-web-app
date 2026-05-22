"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Footer from "@/components/Footer";
import { SERVICES } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import ProductGallery from "@/components/ProductGallery";
import { Check, ArrowRight, ArrowLeft, Upload } from "lucide-react";

const SERVICE_GALLERY: Record<string, { bg: string; label: string }> = {
  "schaerfservice":  { bg: "#e8f7f6", label: "SRV" },
  "sonderwerkzeug": { bg: "#f5ede8", label: "SWZ" },
};

function ServiceFeatureCheck() {
  return <Check className="w-4 h-4 text-[#00A597] flex-shrink-0 mt-0.5" strokeWidth={2.5} />;
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
  pickupLocationSonstiges: string;
  packageSize: string;
  packageWeight: string;
  carbideReplacement: "wirtschaftlich" | "rücksprache" | "nein" | "";
  engraving: "bukara" | "neutral" | "";
};

type SonderForm = {
  // Step 1
  anwendung: string[];
  anwendungSonstiges: string;
  material: string[];
  materialSonstiges: string;
  materialstaerke: string;
  // Step 2
  maschine: string[];
  maschineSonstiges: string;
  maschinentyp: string;
  zielProblem: string[];
  zielSonstiges: string;
  sichtkanten: string;
  // Step 3
  prioritaetStandzeit: string;
  prioritaetPreis: string;
  stueckzahl: string[];
  teileProTag: string;
  bestehendesWerkzeug: string;
  bestehendesBeschreibung: string;
  loesungsumfang: string[];
  // Step 4
  company: string;
  vat: string;
  contact: string;
  email: string;
  phone: string;
  message: string;
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
    pickupAddressDeviation: "", pickupDate: "", pickupTimes: "", pickupLocation: "", pickupLocationSonstiges: "",
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
      pickup_location: form.pickupLocation === "Sonstiges"
        ? (form.pickupLocationSonstiges || "Sonstiges")
        : (form.pickupLocation || null),
      package_size: form.packageSize || null,
      package_weight: form.packageWeight || null,
      carbide_replacement: form.carbideReplacement ? carbideLabels[form.carbideReplacement] : null,
      engraving: form.engraving || null,
    });
    setSubmitting(false);
    if (error) {
      setSubmitError("Ihre Anfrage konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut.");
      return;
    }

    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "schaerfen",
          data: {
            company: form.company,
            contact: form.contact,
            email: form.email,
            pickupAddressDeviation: form.pickupAddressDeviation,
            pickupDate: form.pickupDate,
            pickupTimes: form.pickupTimes,
            pickupLocation: form.pickupLocation === "Sonstiges"
              ? (form.pickupLocationSonstiges || "Sonstiges")
              : form.pickupLocation,
            packageSize: form.packageSize,
            packageWeight: form.packageWeight,
            carbideReplacement: form.carbideReplacement ? carbideLabels[form.carbideReplacement] : null,
            engraving: form.engraving,
          },
        }),
      });
    } catch (err) {
      console.error("[email] schaerfen:", err);
    }

    router.push("/danke?type=schaerfen");
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
                  <ServiceFeatureCheck />
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
                <input type="text" required value={form.company} onChange={field("company")} className={inputClass()} placeholder="Muster GmbH" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Kontaktperson <span className="text-[#9B242A]">*</span>
                </label>
                <input type="text" required value={form.contact} onChange={field("contact")} className={inputClass()} placeholder="Max Mustermann" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  E-Mail <span className="text-[#9B242A]">*</span>
                </label>
                <input type="email" required value={form.email} onChange={field("email")} className={inputClass()} placeholder="anfrage@firma.de" />
              </div>
            </div>

            <SectionLabel>Abholung</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Abweichende Abholadresse / Sonstige Bemerkungen
                </label>
                <textarea rows={2} value={form.pickupAddressDeviation} onChange={field("pickupAddressDeviation")} className={inputClass("resize-none")} placeholder="Falls abweichend von Ihrer hinterlegten Adresse..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Gewünschtes Abholdatum <span className="text-[#9B242A]">*</span>
                </label>
                <input type="date" required value={form.pickupDate} onChange={field("pickupDate")} className={inputClass()} />
                <p className="text-[11px] text-slate-400 mt-1.5">Abholungen erfolgen in der Regel zwischen 07:00 und 16:00 Uhr</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Abholungszeiten <span className="text-[#9B242A]">*</span>
                </label>
                <input type="text" required value={form.pickupTimes} onChange={field("pickupTimes")} className={inputClass()} placeholder="z. B. 08:00–12:00, 13:00–16:00" />
                <p className="text-[11px] text-slate-400 mt-1.5">Falls Mittagspause, bitte angeben</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-2">
                  Gewünschter Abholungsort <span className="text-[#9B242A]">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {(["Büro", "Warenannahme", "Sonstiges"] as const).map((loc) => (
                    <label key={loc} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="pickupLocation" value={loc} checked={form.pickupLocation === loc} onChange={() => setForm((f) => ({ ...f, pickupLocation: loc }))} className="accent-[#00A597] w-4 h-4" required />
                      <span className="text-sm text-slate-800">{loc}</span>
                    </label>
                  ))}
                </div>
                {form.pickupLocation === "Sonstiges" && (
                  <input
                    type="text"
                    value={form.pickupLocationSonstiges}
                    onChange={field("pickupLocationSonstiges")}
                    className={inputClass("mt-3")}
                    placeholder="Bitte beschreiben Sie den Abholungsort…"
                    required
                  />
                )}
              </div>
            </div>

            <SectionLabel>Paket</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Paketgröße <span className="text-[#9B242A]">*</span>
                </label>
                <input type="text" required value={form.packageSize} onChange={field("packageSize")} className={inputClass()} placeholder="z. B. 30 × 20 × 15" />
                <p className="text-[11px] text-slate-400 mt-1.5">Höhe × Breite × Tiefe in cm</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Paketgewicht <span className="text-[#9B242A]">*</span>
                </label>
                <input type="text" required value={form.packageWeight} onChange={field("packageWeight")} className={inputClass()} placeholder="z. B. 5" />
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
                      <input type="radio" name="carbideReplacement" value={value} checked={form.carbideReplacement === value} onChange={() => setForm((f) => ({ ...f, carbideReplacement: value }))} className="accent-[#00A597] w-4 h-4 mt-0.5 flex-shrink-0" required />
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
                      <input type="radio" name="engraving" value={value} checked={form.engraving === value} onChange={() => setForm((f) => ({ ...f, engraving: value }))} className="accent-[#00A597] w-4 h-4" required />
                      <span className="text-sm text-slate-800">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {submitError && <p className="text-sm text-red-500 mb-4 mt-4">{submitError}</p>}

            <div className="mt-8">
              <button type="submit" disabled={submitting} className="btn-orange" style={{ opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Wird gesendet…" : "Anfrage absenden"}
                {!submitting && (
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
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

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [form, setForm] = useState<SonderForm>({
    anwendung: [], anwendungSonstiges: "",
    material: [], materialSonstiges: "",
    materialstaerke: "",
    maschine: [], maschineSonstiges: "", maschinentyp: "",
    zielProblem: [], zielSonstiges: "",
    sichtkanten: "",
    prioritaetStandzeit: "", prioritaetPreis: "",
    stueckzahl: [], teileProTag: "",
    bestehendesWerkzeug: "", bestehendesBeschreibung: "",
    loesungsumfang: [],
    company: "", vat: "", contact: "", email: "", phone: "", message: "",
  });

  function txt(key: keyof SonderForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));
  }

  function toggle(arrKey: keyof SonderForm, value: string) {
    setForm(f => {
      const arr = f[arrKey] as string[];
      return { ...f, [arrKey]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  }

  // Render helpers (called as functions, not JSX components, to avoid remount issues)
  const chk = (arrKey: keyof SonderForm, value: string) => {
    const arr = form[arrKey] as string[];
    return (
      <label key={value} className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={arr.includes(value)}
          onChange={() => toggle(arrKey, value)}
          className="accent-[#00A597] w-4 h-4 flex-shrink-0"
        />
        <span className="text-sm text-slate-800">{value}</span>
      </label>
    );
  };

  const radioBtn = (name: string, stateKey: keyof SonderForm, value: string) => {
    const active = (form[stateKey] as string) === value;
    return (
      <label key={value} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors ${active ? "border-[#00A597] bg-[#00A597]/5" : "border-slate-200 hover:border-slate-300"}`}>
        <input type="radio" name={name} value={value} checked={active}
          onChange={() => setForm(f => ({ ...f, [stateKey]: value }))} className="sr-only" />
        <span className={`text-sm font-medium ${active ? "text-[#00A597]" : "text-slate-700"}`}>{value}</span>
      </label>
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Guard: pressing Enter on steps 1–3 should advance, not submit
    if (step !== 4) {
      setStep(s => s + 1);
      return;
    }
    // Validate required Kontaktdaten fields
    if (!form.company.trim() || !form.contact.trim() || !form.email.trim()) {
      setSubmitError("Bitte füllen Sie alle Pflichtfelder aus (Firmenname, Ansprechpartner, E-Mail).");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    let specFileUrl: string | null = null;
    const file = fileRef.current?.files?.[0] ?? null;
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("service-files").upload(path, file);
      if (uploadError) {
        setSubmitting(false);
        setSubmitError("Datei konnte nicht hochgeladen werden. Bitte versuchen Sie es erneut.");
        return;
      }
      const { data: urlData } = supabase.storage.from("service-files").getPublicUrl(path);
      specFileUrl = urlData?.publicUrl ?? null;
    }

    const sonderDetails = {
      anwendung: form.anwendung,
      anwendungSonstiges: form.anwendungSonstiges || null,
      material: form.material,
      materialSonstiges: form.materialSonstiges || null,
      materialstaerke: form.materialstaerke || null,
      maschine: form.maschine,
      maschineSonstiges: form.maschineSonstiges || null,
      maschinentyp: form.maschinentyp || null,
      zielProblem: form.zielProblem,
      zielSonstiges: form.zielSonstiges || null,
      sichtkanten: form.sichtkanten || null,
      prioritaetStandzeit: form.prioritaetStandzeit || null,
      prioritaetPreis: form.prioritaetPreis || null,
      stueckzahl: form.stueckzahl,
      teileProTag: form.teileProTag || null,
      bestehendesWerkzeug: form.bestehendesWerkzeug || null,
      bestehendesBeschreibung: form.bestehendesBeschreibung || null,
      loesungsumfang: form.loesungsumfang,
    };

    const { error } = await supabase.from("service_inquiries").insert({
      service_type: "sonderwerkzeug",
      company_name: form.company,
      vat_number: form.vat || null,
      contact_name: form.contact,
      email: form.email,
      phone: form.phone || null,
      message: form.message || null,
      spec_file_url: specFileUrl,
      sonder_details: sonderDetails,
    });

    setSubmitting(false);
    if (error) {
      setSubmitError("Ihre Anfrage konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut.");
      return;
    }

    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sonderwerkzeug",
          data: {
            company_name: form.company,
            vat_number: form.vat || null,
            contact_name: form.contact,
            email: form.email,
            phone: form.phone || null,
            message: form.message || null,
            spec_file_url: specFileUrl,
            sonder_details: sonderDetails,
          },
        }),
      });
    } catch (err) {
      console.error("[email] sonderwerkzeug:", err);
    }

    router.push("/danke?type=sonderwerkzeug");
  }

  const STEP_LABELS = ["Anwendung & Material", "Maschine & Ziel", "Prioritäten & Umfang", "Kontaktdaten"];

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
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Leistungen</p>
            <ul className="flex flex-col gap-2">
              {service.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-slate-900">
                  <ServiceFeatureCheck />{h}
                </li>
              ))}
            </ul>
          </div>

          <div className="h-px bg-slate-100 mb-8" />

          {/* Step indicator */}
          <div className="flex items-start mb-8">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex-1 flex flex-col items-center relative">
                {i < STEP_LABELS.length - 1 && (
                  <div className={`absolute top-4 left-1/2 w-full h-px transition-colors ${step > i + 1 ? "bg-[#00A597]" : "bg-slate-200"}`} />
                )}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= i + 1 ? "bg-[#00A597] text-white" : "bg-slate-100 text-slate-400"}`}>
                  {step > i + 1 ? (
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  ) : i + 1}
                </div>
                <span className="text-[10px] text-slate-400 mt-1.5 text-center leading-tight px-1">{label}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* ── STEP 1: Anwendung & Material ── */}
            {step === 1 && (
              <div className="flex flex-col gap-6">
                <div>
                  <SectionLabel>1. Anwendung</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {["Plattenzuschnitt", "Nuten / Falzen", "Kantenbearbeitung", "Bohren", "Fräsen / Kontur", "Profilbearbeitung", "Sonstiges"].map(v => chk("anwendung", v))}
                  </div>
                  {form.anwendung.includes("Sonstiges") && (
                    <input type="text" value={form.anwendungSonstiges} onChange={txt("anwendungSonstiges")} className={inputClass("mt-2")} placeholder="Beschreibung…" />
                  )}
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <SectionLabel>2. Material</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {["Spanplatte", "MDF / HDF", "Multiplex", "Massivholz", "HPL / Kompaktplatte", "Kunststoff", "Aluminium", "Verbundmaterial", "Sonstiges"].map(v => chk("material", v))}
                  </div>
                  {form.material.includes("Sonstiges") && (
                    <input type="text" value={form.materialSonstiges} onChange={txt("materialSonstiges")} className={inputClass("mt-2")} placeholder="Beschreibung…" />
                  )}
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <SectionLabel>3. Materialstärke / Abmessungen</SectionLabel>
                  <input type="text" value={form.materialstaerke} onChange={txt("materialstaerke")} className={inputClass()} placeholder="z. B. 18 mm, 300 × 600 mm" />
                </div>
              </div>
            )}

            {/* ── STEP 2: Maschine & Ziel ── */}
            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div>
                  <SectionLabel>4. Maschine</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {["CNC", "Formatkreissäge", "Nesting", "Kantenanleimmaschine", "Tischfräse", "Sonstiges"].map(v => chk("maschine", v))}
                  </div>
                  {form.maschine.includes("Sonstiges") && (
                    <input type="text" value={form.maschineSonstiges} onChange={txt("maschineSonstiges")} className={inputClass("mt-2")} placeholder="Beschreibung…" />
                  )}
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Maschinentyp / Hersteller</label>
                    <input type="text" value={form.maschinentyp} onChange={txt("maschinentyp")} className={inputClass()} placeholder="z. B. Homag BOF 211, Biesse Rover B" />
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <SectionLabel>5. Ziel / Problem</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {["Bessere Schnittqualität", "Höhere Standzeit", "Schnellere Bearbeitung", "Werkzeug funktioniert nicht optimal", "Neue Anwendung", "Sonstiges"].map(v => chk("zielProblem", v))}
                  </div>
                  {form.zielProblem.includes("Sonstiges") && (
                    <input type="text" value={form.zielSonstiges} onChange={txt("zielSonstiges")} className={inputClass("mt-2")} placeholder="Beschreibung…" />
                  )}
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <SectionLabel>6. Sichtkanten</SectionLabel>
                  <div className="flex flex-wrap gap-3">
                    {["Ja", "Nein", "Teilweise"].map(v => radioBtn("sichtkanten", "sichtkanten", v))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Prioritäten & Umfang ── */}
            {step === 3 && (
              <div className="flex flex-col gap-6">
                <div>
                  <SectionLabel>7. Prioritäten</SectionLabel>
                  <p className="text-xs font-medium text-slate-500 mb-2">Standzeit vs. Geschwindigkeit</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {["Maximale Standzeit", "Ausgewogen", "Maximale Geschwindigkeit"].map(v => radioBtn("prioritaetStandzeit", "prioritaetStandzeit", v))}
                  </div>
                  <p className="text-xs font-medium text-slate-500 mb-2">Preis vs. Leistung</p>
                  <div className="flex flex-wrap gap-2">
                    {["Möglichst günstig", "Ausgewogen", "Maximale Performance"].map(v => radioBtn("prioritaetPreis", "prioritaetPreis", v))}
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <SectionLabel>8. Stückzahl / Einsatz</SectionLabel>
                  <div className="flex flex-wrap gap-4 mb-3">
                    {["Einzelteile", "Kleinserie", "Serienfertigung"].map(v => chk("stueckzahl", v))}
                  </div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Teile pro Tag / Woche</label>
                  <input type="text" value={form.teileProTag} onChange={txt("teileProTag")} className={inputClass()} placeholder="z. B. 50 / Tag" />
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <SectionLabel>9. Bestehendes Werkzeug</SectionLabel>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {["Ja", "Nein"].map(v => radioBtn("bestehendesWerkzeug", "bestehendesWerkzeug", v))}
                  </div>
                  {form.bestehendesWerkzeug === "Ja" && (
                    <input type="text" value={form.bestehendesBeschreibung} onChange={txt("bestehendesBeschreibung")} className={inputClass()} placeholder="Beschreibung des bestehenden Werkzeugs…" />
                  )}
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <SectionLabel>10. Lösungsumfang</SectionLabel>
                  <div className="flex flex-col gap-2.5">
                    {["Komplettlösung inkl. Beratung", "Nur Werkzeug", "Beratung gewünscht"].map(v => chk("loesungsumfang", v))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: Kontaktdaten ── */}
            {step === 4 && (
              <div className="flex flex-col gap-4">
                <SectionLabel>Kontaktdaten</SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Firmenname <span className="text-[#9B242A]">*</span></label>
                    <input type="text" required value={form.company} onChange={txt("company")} className={inputClass()} placeholder="Muster GmbH" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">USt-IdNr.</label>
                    <input type="text" value={form.vat} onChange={txt("vat")} className={inputClass()} placeholder="DE123456789" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Ansprechpartner <span className="text-[#9B242A]">*</span></label>
                    <input type="text" required value={form.contact} onChange={txt("contact")} className={inputClass()} placeholder="Max Mustermann" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">E-Mail <span className="text-[#9B242A]">*</span></label>
                    <input type="email" required value={form.email} onChange={txt("email")} className={inputClass()} placeholder="anfrage@firma.de" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Telefon</label>
                    <input type="tel" value={form.phone} onChange={txt("phone")} className={inputClass()} placeholder="+49 (0) 123 456789" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Technische Zeichnung / Spezifikation{" "}
                    <span className="text-slate-400 font-normal">(optional, PDF, DXF, DWG, JPG, PNG — max. 10 MB)</span>
                  </label>
                  <div
                    className="border border-dashed border-slate-300 rounded-xl px-4 py-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#00A597] transition-colors bg-slate-50"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
                    <span className="text-sm text-slate-500">{fileName ?? "Datei auswählen oder hier ablegen"}</span>
                    <input ref={fileRef} type="file" accept=".pdf,.dxf,.dwg,.jpg,.jpeg,.png" className="hidden"
                      onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Nachricht</label>
                  <textarea rows={4} value={form.message} onChange={txt("message")} className={inputClass("resize-none")}
                    placeholder="Weitere Angaben zu Ihrem Projekt oder besonderen Anforderungen…" />
                </div>

                {submitError && <p className="text-sm text-red-500">{submitError}</p>}
              </div>
            )}

            {/* Navigation */}
            <div className={`flex items-center mt-8 ${step > 1 ? "justify-between" : "justify-end"}`}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  className="text-sm text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={2.2} />
                  Zurück
                </button>
              )}
              {step < 4 ? (
                <button type="button" onClick={() => setStep(s => s + 1)} className="btn-orange">
                  Weiter
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
              ) : (
                <button type="submit" disabled={submitting} className="btn-orange" style={{ opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? "Wird gesendet…" : "Anfrage absenden"}
                  {!submitting && (
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  )}
                </button>
              )}
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
