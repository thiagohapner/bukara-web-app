"use client";

import { useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";
import { SERVICES } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { Check, ChevronLeft, Phone, Mail, Upload } from "lucide-react";
import CtaArrow from "@/components/CtaArrow";
import FormStepNav from "@/components/FormStepNav";

// Multi-step Sonderwerkzeug request form. Mirrors the Schärfservice wizard
// (app/(public)/sonder-schaerfservice/page.tsx) — same sidebar + .form-*
// components + progress + keyboard nav + in-page success. Fields, sonder_details
// shape, Storage upload and confirmation email are unchanged from the old form.

const SERVICE_SLUG = "sonderwerkzeug";
const TOTAL_STEPS = 11;

// Grouped phases for the vertical step nav (11 wizard steps → 4 phases):
// Anwendung (1–2) · Bearbeitung (3–6) · Anforderungen (7–10) · Kontakt (11).
const PHASES = ["Anwendung", "Bearbeitung", "Anforderungen", "Kontakt"];
const phaseIndex = (step: number) =>
  step <= 2 ? 0 : step <= 6 ? 1 : step <= 10 ? 2 : step <= 11 ? 3 : 4;

const ANWENDUNG = ["Plattenzuschnitt", "Nuten / Falzen", "Kantenbearbeitung", "Bohren", "Fräsen / Kontur", "Profilbearbeitung", "Sonstiges"];
const MATERIAL = ["Spanplatte", "MDF / HDF", "Multiplex", "Massivholz", "HPL / Kompaktplatte", "Kunststoff", "Aluminium", "Verbundmaterial", "Sonstiges"];
const MASCHINE = ["CNC", "Formatkreissäge", "Nesting", "Kantenanleimmaschine", "Tischfräse", "Sonstiges"];
const ZIEL = ["Bessere Schnittqualität", "Höhere Standzeit", "Schnellere Bearbeitung", "Werkzeug funktioniert nicht optimal", "Neue Anwendung", "Sonstiges"];
const SICHTKANTEN = ["Ja", "Nein", "Teilweise"];
const PRIO_STANDZEIT = ["Maximale Standzeit", "Ausgewogen", "Maximale Geschwindigkeit"];
const PRIO_PREIS = ["Möglichst günstig", "Ausgewogen", "Maximale Performance"];
const STUECKZAHL = ["Einzelteile", "Kleinserie", "Serienfertigung"];
const BESTEHEND = ["Ja", "Nein"];
const LOESUNGSUMFANG = ["Komplettlösung inkl. Beratung", "Nur Werkzeug", "Beratung gewünscht"];

type FormState = {
  anwendung: string[];
  anwendungSonstiges: string;
  material: string[];
  materialSonstiges: string;
  materialstaerke: string;
  maschine: string[];
  maschineSonstiges: string;
  maschinentyp: string;
  zielProblem: string[];
  zielSonstiges: string;
  sichtkanten: string;
  prioritaetStandzeit: string;
  prioritaetPreis: string;
  stueckzahl: string[];
  teileProTag: string;
  bestehendesWerkzeug: string;
  bestehendesBeschreibung: string;
  loesungsumfang: string[];
  company: string;
  vat: string;
  contact: string;
  email: string;
  phone: string;
  message: string;
};

function initialState(): FormState {
  return {
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
  };
}

export default function SonderWerkzeugPage() {
  const service = SERVICES.find((s) => s.slug === SERVICE_SLUG)!;
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormState>(initialState);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) return;
      if (step === TOTAL_STEPS + 1) return;
      e.preventDefault();
      goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, data, submitting]);

  function toggle(key: keyof FormState, value: string) {
    setErr("");
    setData((d) => {
      const arr = d[key] as string[];
      return { ...d, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  }
  function setField(key: keyof FormState, value: string) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function submitRequest() {
    setSubmitting(true);
    setErr("");

    let specFileUrl: string | null = null;
    const file = fileRef.current?.files?.[0] ?? null;
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("service-files").upload(path, file);
      if (uploadError) {
        setSubmitting(false);
        setErr("Datei konnte nicht hochgeladen werden. Bitte versuchen Sie es erneut.");
        return;
      }
      const { data: urlData } = supabase.storage.from("service-files").getPublicUrl(path);
      specFileUrl = urlData?.publicUrl ?? null;
    }

    const sonderDetails = {
      anwendung: data.anwendung,
      anwendungSonstiges: data.anwendungSonstiges || null,
      material: data.material,
      materialSonstiges: data.materialSonstiges || null,
      materialstaerke: data.materialstaerke || null,
      maschine: data.maschine,
      maschineSonstiges: data.maschineSonstiges || null,
      maschinentyp: data.maschinentyp || null,
      zielProblem: data.zielProblem,
      zielSonstiges: data.zielSonstiges || null,
      sichtkanten: data.sichtkanten || null,
      prioritaetStandzeit: data.prioritaetStandzeit || null,
      prioritaetPreis: data.prioritaetPreis || null,
      stueckzahl: data.stueckzahl,
      teileProTag: data.teileProTag || null,
      bestehendesWerkzeug: data.bestehendesWerkzeug || null,
      bestehendesBeschreibung: data.bestehendesBeschreibung || null,
      loesungsumfang: data.loesungsumfang,
    };

    const { error } = await supabase.from("service_inquiries").insert({
      service_type: "sonderwerkzeug",
      company_name: data.company,
      vat_number: data.vat || null,
      contact_name: data.contact,
      email: data.email,
      phone: data.phone || null,
      message: data.message || null,
      spec_file_url: specFileUrl,
      sonder_details: sonderDetails,
    });

    if (error) {
      setSubmitting(false);
      setErr("Ihre Anfrage konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut.");
      return;
    }

    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sonderwerkzeug",
          data: {
            company_name: data.company,
            vat_number: data.vat || null,
            contact_name: data.contact,
            email: data.email,
            phone: data.phone || null,
            message: data.message || null,
            spec_file_url: specFileUrl,
            sonder_details: sonderDetails,
          },
        }),
      });
    } catch (e) {
      console.error("[email] sonderwerkzeug:", e);
    }

    setSubmitting(false);
    setStep(TOTAL_STEPS + 1);
  }

  function goNext() {
    if (submitting) return;
    if (step === TOTAL_STEPS) {
      if (!data.company.trim() || !data.contact.trim() || !data.email.trim()) {
        setErr("Bitte füllen Sie alle Pflichtfelder aus (Firmenname, Ansprechpartner, E-Mail).");
        return;
      }
      if (!/.+@.+\..+/.test(data.email)) {
        setErr("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
        return;
      }
      submitRequest();
      return;
    }
    setErr("");
    setStep((s) => s + 1);
  }
  function goBack() {
    setErr("");
    setStep((s) => Math.max(1, s - 1));
  }
  function restart() {
    setData(initialState());
    setFileName(null);
    setStep(1);
    setErr("");
  }

  const canBack = step > 1 && step <= TOTAL_STEPS;

  // Reusable renderers
  const pills = (key: keyof FormState, options: string[]) => (
    <div className="flex flex-wrap gap-2.5">
      {options.map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => toggle(key, label)}
          className={`form-pill ${(data[key] as string[]).includes(label) ? "form-pill--selected" : ""}`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const optionCards = (key: keyof FormState, options: string[]) => (
    <div className="flex flex-col gap-2">
      {options.map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => { setField(key, label); setErr(""); }}
          className={`form-option-card ${data[key] === label ? "form-option-card--selected" : ""}`}
        >
          <span className={`form-option-badge ${data[key] === label ? "form-option-badge--selected" : ""}`}><Check className="w-3 h-3" strokeWidth={3} /></span>
          <span className="text-base font-normal flex-1 text-left">{label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <main className="min-h-screen form-aurora-bg">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-6 lg:gap-[120px] xl:gap-[200px] py-12 lg:min-h-[calc(100vh-108px)]">

            {/* Left rail — plain vertical phase nav, centered as one block */}
            <aside className="w-full lg:w-[220px] flex-shrink-0 flex flex-col">
              <h1 className="text-[15px] font-medium text-slate-900 mb-0 lg:mb-7">{service.name}</h1>

              {/* Step nav — desktop only; hidden on mobile */}
              <div className="hidden lg:block">
                <FormStepNav phases={PHASES} activeIndex={phaseIndex(step)} />
              </div>

              {/* Contact — desktop only (duplicated below the mobile CTA) */}
              <div className="hidden lg:block mt-9">
                <div className="text-[15px] font-medium text-slate-900 mb-3">Noch Fragen?</div>
                <a href="tel:+4974439661-0" className="flex items-center gap-3 text-slate-900 text-sm mb-2.5" style={{ textDecoration: "none" }}>
                  <span className="icon-tile icon-tile--sm"><Phone className="w-4 h-4" strokeWidth={1.75} /></span>
                  +49 7443 / 9661-0
                </a>
                <a href="mailto:info@bukara.de" className="flex items-center gap-3 text-slate-900 text-sm" style={{ textDecoration: "none" }}>
                  <span className="icon-tile icon-tile--sm"><Mail className="w-4 h-4" strokeWidth={1.75} /></span>
                  info@bukara.de
                </a>
              </div>
            </aside>

            {/* Step content — card-less, centered in the page */}
            <div className="w-full lg:w-[560px] flex-shrink-0 min-w-0">
              <div className="w-full">


                {step === 1 && (
                  <div>
                    <h2 className="heading-h2">Für welche Anwendung?</h2>
                    <p className="text-neutral-500 mt-2 mb-7 leading-[1.4]">Mehrfachauswahl möglich — wählen Sie alle zutreffenden Anwendungen.</p>
                    {pills("anwendung", ANWENDUNG)}
                    {data.anwendung.includes("Sonstiges") && (
                      <input className="form-input mt-3" value={data.anwendungSonstiges} onChange={(e) => setField("anwendungSonstiges", e.target.value)} placeholder="Beschreibung…" />
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="heading-h2">Welches Material bearbeiten Sie?</h2>
                    <p className="text-neutral-500 mt-2 mb-7 leading-[1.4]">Mehrfachauswahl möglich.</p>
                    {pills("material", MATERIAL)}
                    {data.material.includes("Sonstiges") && (
                      <input className="form-input mt-3" value={data.materialSonstiges} onChange={(e) => setField("materialSonstiges", e.target.value)} placeholder="Beschreibung…" />
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h2 className="heading-h2">Materialstärke &amp; Abmessungen</h2>
                    <p className="text-neutral-500 mt-2 mb-7 leading-[1.4]">Optional — hilft uns bei der Auslegung.</p>
                    <label className="form-label" htmlFor="materialstaerke">Materialstärke / Abmessungen</label>
                    <input id="materialstaerke" className="form-input" value={data.materialstaerke} onChange={(e) => setField("materialstaerke", e.target.value)} placeholder="z. B. 18 mm, 300 × 600 mm" />
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <h2 className="heading-h2">Auf welcher Maschine?</h2>
                    <p className="text-neutral-500 mt-2 mb-7 leading-[1.4]">Mehrfachauswahl möglich.</p>
                    {pills("maschine", MASCHINE)}
                    {data.maschine.includes("Sonstiges") && (
                      <input className="form-input mt-3" value={data.maschineSonstiges} onChange={(e) => setField("maschineSonstiges", e.target.value)} placeholder="Beschreibung…" />
                    )}
                    <label className="form-label mt-6" htmlFor="maschinentyp">Maschinentyp / Hersteller</label>
                    <input id="maschinentyp" className="form-input" value={data.maschinentyp} onChange={(e) => setField("maschinentyp", e.target.value)} placeholder="z. B. Homag BOF 211, Biesse Rover B" />
                  </div>
                )}

                {step === 5 && (
                  <div>
                    <h2 className="heading-h2">Was möchten Sie erreichen?</h2>
                    <p className="text-neutral-500 mt-2 mb-7 leading-[1.4]">Ziel oder Problem — Mehrfachauswahl möglich.</p>
                    {pills("zielProblem", ZIEL)}
                    {data.zielProblem.includes("Sonstiges") && (
                      <input className="form-input mt-3" value={data.zielSonstiges} onChange={(e) => setField("zielSonstiges", e.target.value)} placeholder="Beschreibung…" />
                    )}
                  </div>
                )}

                {step === 6 && (
                  <div>
                    <h2 className="heading-h2">Gibt es Sichtkanten?</h2>
                    <p className="text-neutral-500 mt-2 mb-7 leading-[1.4]">Sichtbare Kanten stellen höhere Anforderungen an die Schnittqualität.</p>
                    {optionCards("sichtkanten", SICHTKANTEN)}
                  </div>
                )}

                {step === 7 && (
                  <div>
                    <h2 className="heading-h2">Ihre Prioritäten</h2>
                    <p className="text-neutral-500 mt-2 mb-6 leading-[1.4]">Zwei kurze Angaben zur Auslegung.</p>
                    <p className="form-label mb-2.5">Standzeit vs. Geschwindigkeit</p>
                    <div className="mb-6">{optionCards("prioritaetStandzeit", PRIO_STANDZEIT)}</div>
                    <p className="form-label mb-2.5">Preis vs. Leistung</p>
                    {optionCards("prioritaetPreis", PRIO_PREIS)}
                  </div>
                )}

                {step === 8 && (
                  <div>
                    <h2 className="heading-h2">Stückzahl &amp; Einsatz</h2>
                    <p className="text-neutral-500 mt-2 mb-7 leading-[1.4]">Mehrfachauswahl möglich.</p>
                    {pills("stueckzahl", STUECKZAHL)}
                    <label className="form-label mt-6" htmlFor="teileProTag">Teile pro Tag / Woche</label>
                    <input id="teileProTag" className="form-input" value={data.teileProTag} onChange={(e) => setField("teileProTag", e.target.value)} placeholder="z. B. 50 / Tag" />
                  </div>
                )}

                {step === 9 && (
                  <div>
                    <h2 className="heading-h2">Gibt es ein bestehendes Werkzeug?</h2>
                    <p className="text-neutral-500 mt-2 mb-7 leading-[1.4]">Wenn ja, beschreiben Sie es uns kurz.</p>
                    {optionCards("bestehendesWerkzeug", BESTEHEND)}
                    {data.bestehendesWerkzeug === "Ja" && (
                      <input className="form-input mt-3" value={data.bestehendesBeschreibung} onChange={(e) => setField("bestehendesBeschreibung", e.target.value)} placeholder="Beschreibung des bestehenden Werkzeugs…" />
                    )}
                  </div>
                )}

                {step === 10 && (
                  <div>
                    <h2 className="heading-h2">Gewünschter Lösungsumfang</h2>
                    <p className="text-neutral-500 mt-2 mb-7 leading-[1.4]">Mehrfachauswahl möglich.</p>
                    {pills("loesungsumfang", LOESUNGSUMFANG)}
                  </div>
                )}

                {step === 11 && (
                  <div>
                    <h2 className="heading-h2">Ihre Kontaktdaten</h2>
                    <p className="text-neutral-500 mt-2 mb-7 leading-[1.4]">Damit wir wissen, an wen wir uns wenden dürfen.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="flex flex-col gap-2">
                        <span className="form-label mb-0">Firmenname <span className="text-brand-500">*</span></span>
                        <input className="form-input" value={data.company} onChange={(e) => setField("company", e.target.value)} placeholder="Muster GmbH" />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="form-label mb-0">USt-IdNr.</span>
                        <input className="form-input" value={data.vat} onChange={(e) => setField("vat", e.target.value)} placeholder="DE123456789" />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="form-label mb-0">Ansprechpartner <span className="text-brand-500">*</span></span>
                        <input className="form-input" value={data.contact} onChange={(e) => setField("contact", e.target.value)} placeholder="Max Mustermann" />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="form-label mb-0">E-Mail <span className="text-brand-500">*</span></span>
                        <input type="email" className="form-input" value={data.email} onChange={(e) => setField("email", e.target.value)} placeholder="anfrage@firma.de" />
                      </label>
                      <label className="flex flex-col gap-2 sm:col-span-2">
                        <span className="form-label mb-0">Telefon</span>
                        <input type="tel" className="form-input" value={data.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+49 (0) 123 456789" />
                      </label>
                    </div>

                    <label className="form-label mt-6">
                      Technische Zeichnung / Spezifikation{" "}
                      <span className="text-neutral-400 font-normal">(optional, PDF, DXF, DWG, JPG, PNG — max. 10 MB)</span>
                    </label>
                    <div
                      className="border border-dashed border-[color:var(--color-border)] rounded-sm px-4 py-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-neutral-25 hover:border-brand-500 transition-colors duration-[240ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)]"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="w-6 h-6 text-neutral-400" strokeWidth={1.5} />
                      <span className="text-sm text-neutral-500">{fileName ?? "Datei auswählen oder hier ablegen"}</span>
                      <input ref={fileRef} type="file" accept=".pdf,.dxf,.dwg,.jpg,.jpeg,.png" className="hidden"
                        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} />
                    </div>

                    <label className="form-label mt-6" htmlFor="message">Nachricht</label>
                    <textarea id="message" className="form-textarea" rows={4} value={data.message} onChange={(e) => setField("message", e.target.value)}
                      placeholder="Weitere Angaben zu Ihrem Projekt oder besonderen Anforderungen…" />
                  </div>
                )}

                {step === TOTAL_STEPS + 1 && (
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6 rounded-pill bg-brand-500 flex items-center justify-center text-white">
                      <Check className="w-9 h-9" strokeWidth={2.5} />
                    </div>
                    <h2 className="heading-h2">Vielen Dank!</h2>
                    <p className="text-neutral-500 mt-2.5 max-w-[400px] mx-auto leading-relaxed">
                      Ihre Anfrage wurde übermittelt. Wir melden uns innerhalb von <strong className="text-slate-900 font-medium">24 Stunden</strong> bei Ihnen.
                    </p>
                    <button type="button" onClick={restart} className="btn-outline mt-7">Neue Anfrage starten</button>
                  </div>
                )}

                {err && (
                  <div className="mt-5 flex items-center gap-2 text-[#d8351e] text-sm">
                    <span>⚠</span>{err}
                  </div>
                )}

                {step <= TOTAL_STEPS && (
                  <div className="flex items-center gap-3 mt-9">
                    {canBack && (
                      <button type="button" onClick={goBack} aria-label="Zurück" className="w-12 h-12 flex-shrink-0 border border-neutral-100 bg-white rounded-sm cursor-pointer flex items-center justify-center text-neutral-600 hover:bg-brand-25 hover:border-brand-100 transition-colors duration-[240ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)]">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}
                    <button type="button" onClick={goNext} disabled={submitting} className="btn-black btn-arrow" style={{ opacity: submitting ? 0.7 : 1 }}>
                      {submitting ? "Wird gesendet…" : step === TOTAL_STEPS ? "Anfrage absenden" : "Weiter"}
                      {!submitting && <CtaArrow />}
                    </button>
                    <span className="text-xs text-neutral-300 hidden sm:flex items-center gap-1.5">
                      oder drücken Sie <span className="kbd">Enter ↵</span>
                    </span>
                  </div>
                )}

                {/* Contact — mobile only, below the CTA */}
                {step <= TOTAL_STEPS && (
                  <div className="lg:hidden mt-9">
                    <div className="text-[15px] font-medium text-slate-900 mb-3">Noch Fragen?</div>
                    <a href="tel:+4974439661-0" className="flex items-center gap-3 text-slate-900 text-sm mb-2.5" style={{ textDecoration: "none" }}>
                      <span className="icon-tile icon-tile--sm"><Phone className="w-4 h-4" strokeWidth={1.75} /></span>
                      +49 7443 / 9661-0
                    </a>
                    <a href="mailto:info@bukara.de" className="flex items-center gap-3 text-slate-900 text-sm" style={{ textDecoration: "none" }}>
                      <span className="icon-tile icon-tile--sm"><Mail className="w-4 h-4" strokeWidth={1.75} /></span>
                      info@bukara.de
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
