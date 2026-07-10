"use client";

import { useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";
import { SERVICES } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { Check, ChevronLeft, ChevronRight, Phone, Mail } from "lucide-react";
import RecommendationsClient from "@/components/recommendations/RecommendationsClient";
import { SCHAERFSERVICE_CATEGORY_MAP } from "@/lib/recommendations/formSeedMaps";

// Multi-step Schärfservice request form. Layout/interaction pattern comes
// from design-system/schaerfservice-reference/ (Claude Design prototype) —
// see that folder's README for the full flow this implements.

const SERVICE_SLUG = "schaerfservice";

const CHECKLIST_ITEMS = [
  "Deutschlandweit",
  "Kostenloser Abholservice",
  "Fertig in 1–2 Wochen",
  "Keine Mindestmenge",
  "Auch für Fremdwerkzeuge",
];

const WERK_OPTIONS = [
  "Bohrer",
  "DP & HW Werkzeuge",
  "Vollhartmetall Fräser",
  "DP & VHW Werkzeuge",
  "Kreissägeblätter",
  "Sonstiges",
];

const SIZE_OPTIONS = [
  { label: "Klein", desc: "bis ca. 30 × 20 × 15 cm" },
  { label: "Mittel", desc: "bis ca. 60 × 40 × 30 cm" },
  { label: "Groß", desc: "bis ca. 120 × 60 × 60 cm" },
] as const;

const CARBIDE_OPTIONS = [
  { value: "wirtschaftlich", label: "Ja, soweit wirtschaftlich" },
  { value: "ruecksprache", label: "Ja, aber nur nach Rücksprache" },
  { value: "nein", label: "Nein, bitte unbearbeitet zurückschicken" },
] as const;

const CARBIDE_LABELS: Record<string, string> = {
  wirtschaftlich: "Ja, soweit wirtschaftlich",
  ruecksprache: "Ja, aber nur nach Rücksprache",
  nein: "Nein, ist nicht erwünscht – bitte unbearbeitet zurückschicken",
};

const ENGRAVING_OPTIONS = [
  { value: "bukara", label: "Bukara Gravur" },
  { value: "neutral", label: "Neutrale Gravur" },
] as const;

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const MONTH_ABBR = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const STEP_LABELS = ["Weiter", "Weiter", "Weiter", "Weiter", "Weiter", "Anfrage absenden"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function isoOf(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function formatDisplayDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_ABBR[m - 1]} ${y}`;
}
function buildTimeSlots() {
  const out: string[] = [];
  for (let h = 7; h < 20; h++) {
    out.push(`${pad2(h)}:00`);
    out.push(`${pad2(h)}:30`);
  }
  return out;
}
const TIME_SLOTS = buildTimeSlots();

type FormState = {
  werkzeuge: string[];
  datum: string;
  von: string;
  bis: string;
  bemerkung: string;
  ort: "Büro" | "Warenannahme" | "Sonstiges" | "";
  ortText: string;
  size: string;
  gewicht: number;
  zahn: string;
  gravur: string;
  firma: string;
  kontakt: string;
  email: string;
};

function initialState(): FormState {
  return {
    werkzeuge: [], datum: isoOf(new Date(Date.now() + 2 * 86400000)),
    von: "08:30", bis: "18:00", bemerkung: "",
    ort: "", ortText: "", size: "", gewicht: 5,
    zahn: "", gravur: "", firma: "", kontakt: "", email: "",
  };
}

function SchaerfPage() {
  const service = SERVICES.find((s) => s.slug === SERVICE_SLUG)!;

  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormState>(initialState);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [openPicker, setOpenPicker] = useState<"" | "cal" | "von" | "bis">("");
  const today = new Date();
  const [calY, setCalY] = useState(today.getFullYear());
  const [calM, setCalM] = useState(today.getMonth());
  const vonListRef = useRef<HTMLDivElement>(null);
  const bisListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openPicker) { setOpenPicker(""); return; }
      if (e.key !== "Enter" || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === "TEXTAREA") return;
      if (openPicker) { setOpenPicker(""); e.preventDefault(); return; }
      if (step === 7) return;
      e.preventDefault();
      goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPicker, step, data]);

  function toggleWerk(label: string) {
    setErr("");
    setData((d) => ({
      ...d,
      werkzeuge: d.werkzeuge.includes(label) ? d.werkzeuge.filter((x) => x !== label) : [...d.werkzeuge, label],
    }));
  }

  function togglePicker(which: "cal" | "von" | "bis") {
    setOpenPicker((cur) => (cur === which ? "" : which));
    setErr("");
    if (which === "von" || which === "bis") {
      requestAnimationFrame(() => {
        const cont = which === "von" ? vonListRef.current : bisListRef.current;
        const val = which === "von" ? data.von : data.bis;
        const btn = cont?.querySelector<HTMLButtonElement>(`[data-time="${val}"]`);
        if (btn && cont) cont.scrollTop = Math.max(0, btn.offsetTop - 12);
      });
    }
  }

  async function submitRequest() {
    setSubmitting(true);
    setErr("");

    const size = SIZE_OPTIONS.find((s) => s.label === data.size);
    const packageSize = size ? `${size.label} (${size.desc})` : data.size;
    const packageWeight = data.gewicht >= 20 ? "20+ kg" : `${data.gewicht} kg`;
    const pickupTimes = `${data.von}–${data.bis}`;
    const pickupLocation = data.ort === "Sonstiges" ? (data.ortText || "Sonstiges") : data.ort;
    const carbideReplacement = data.zahn ? CARBIDE_LABELS[data.zahn] : null;
    const engraving = data.gravur === "bukara" ? "Bukara Gravur" : data.gravur === "neutral" ? "Neutrale Gravur" : null;

    const toolType = data.werkzeuge.join(", ");

    const { error } = await supabase.from("service_inquiries").insert({
      service_type: "schaerfen",
      company_name: data.firma,
      contact_name: data.kontakt,
      email: data.email,
      tool_type: toolType || null,
      pickup_address_deviation: data.bemerkung.trim() || null,
      preferred_pickup_date: data.datum || null,
      pickup_times: pickupTimes,
      pickup_location: pickupLocation || null,
      package_size: packageSize || null,
      package_weight: packageWeight,
      carbide_replacement: carbideReplacement,
      engraving,
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
          type: "schaerfen",
          data: {
            company: data.firma,
            contact: data.kontakt,
            email: data.email,
            toolTypes: toolType,
            pickupAddressDeviation: data.bemerkung.trim() || null,
            pickupDate: formatDisplayDate(data.datum),
            pickupTimes,
            pickupLocation,
            packageSize,
            packageWeight,
            carbideReplacement,
            engraving,
          },
        }),
      });
    } catch (e) {
      console.error("[email] schaerfen:", e);
    }

    setSubmitting(false);
    setStep(7);
  }

  function goNext() {
    if (submitting) return;
    let e = "";
    if (step === 1) {
      if (!data.werkzeuge.length) e = "Bitte wählen Sie mindestens eine Werkzeugart.";
    } else if (step === 2) {
      if (!data.datum || !data.von || !data.bis) e = "Bitte Abholdatum und Zeitfenster angeben.";
      else if (data.von >= data.bis) e = "Die Endzeit muss nach der Startzeit liegen.";
    } else if (step === 3) {
      if (!data.ort) e = "Bitte wählen Sie einen Abholungsort.";
      else if (data.ort === "Sonstiges" && !data.ortText.trim()) e = "Bitte geben Sie die abweichende Adresse / Bemerkung an.";
    } else if (step === 4) {
      if (!data.size) e = "Bitte wählen Sie eine Paketgröße.";
    } else if (step === 5) {
      if (!data.zahn || !data.gravur) e = "Bitte beide Serviceoptionen wählen.";
    } else if (step === 6) {
      if (!data.firma.trim() || !data.kontakt.trim() || !data.email.trim()) e = "Bitte füllen Sie alle Pflichtfelder aus.";
      else if (!/.+@.+\..+/.test(data.email)) e = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
    }
    if (e) { setErr(e); return; }
    setErr("");
    if (step === 6) { submitRequest(); return; }
    setStep((s) => s + 1);
  }
  function goBack() {
    setErr("");
    setStep((s) => Math.max(1, s - 1));
  }

  function restart() {
    setData(initialState());
    setStep(1);
    setErr("");
    setOpenPicker("");
  }

  // ─── Calendar grid ──────────────────────────────────────────────
  const first = new Date(calY, calM, 1);
  const startDow = (first.getDay() + 6) % 7;
  const gridStart = new Date(calY, calM, 1 - startDow);
  const todayIso = isoOf(new Date());
  const calDays = Array.from({ length: 42 }, (_, i) => {
    const dt = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    const iso = isoOf(dt);
    return { iso, day: dt.getDate(), inMonth: dt.getMonth() === calM, isToday: iso === todayIso, isSelected: iso === data.datum };
  });
  function shiftMonth(delta: number) {
    let m = calM + delta, y = calY;
    if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; }
    setCalM(m); setCalY(y);
  }

  const progress = (Math.min(step, 6) / 6) * 100;
  const canBack = step > 1 && step < 7;

  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">

            {/* Sidebar */}
            <aside className="w-full lg:w-[360px] flex-shrink-0 bg-brand-25 border border-neutral-100 rounded-md p-8 flex flex-col gap-7 lg:sticky lg:top-[96px]">
              <div>
                <h1 className="heading-h2">{service.name}</h1>
                <p className="text-[15px] text-neutral-500 mt-1.5 leading-[1.4]">{service.tagline}</p>
              </div>

              <div className="h-px bg-neutral-100" />

              <div className="checklist">
                {CHECKLIST_ITEMS.map((item) => (
                  <div key={item} className="checklist-item">
                    <span className="checklist-badge"><Check className="w-3 h-3" strokeWidth={3} /></span>
                    {item}
                  </div>
                ))}
              </div>

              <p className="text-[13px] text-neutral-500 leading-relaxed">
                Für sehr kleine Aufträge unter 150 € fällt lediglich eine einmalige Pauschale von 15 € an.
              </p>

              <div className="mt-auto border-t border-neutral-100 pt-6">
                <div className="text-[15px] font-medium text-slate-900 mb-1">Noch Fragen?</div>
                <p className="text-[13px] text-neutral-500 leading-relaxed mb-3.5">
                  Wir beraten Sie gerne persönlich und unverbindlich.
                </p>
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

            {/* Step content */}
            <div className="flex-1 min-w-0 flex justify-center py-4 lg:py-10">
              <div className="w-full max-w-[560px]">

                {step !== 7 && (
                  <div className="flex items-center gap-3 mb-7 text-sm">
                    <span className="form-step-label whitespace-nowrap">Schritt {Math.min(step, 6)} von 6</span>
                    <span className="form-progress-track">
                      <span className="form-progress-fill" style={{ width: `${progress}%` }} />
                    </span>
                  </div>
                )}

                {step === 1 && (
                  <div>
                    <h2 className="heading-h2">Welche Werkzeuge senden Sie ein?</h2>
                    <p className="text-neutral-500 mt-2 mb-7 leading-[1.4]">Mehrfachauswahl möglich — wählen Sie alle zutreffenden Arten.</p>
                    <div className="flex flex-wrap gap-2.5">
                      {WERK_OPTIONS.map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => toggleWerk(label)}
                          className={`form-pill ${data.werkzeuge.includes(label) ? "form-pill--selected" : ""}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="heading-h2">Wann sollen wir abholen?</h2>
                    <p className="text-neutral-500 mt-2 mb-7 leading-[1.4]">Wählen Sie Datum und Zeitfenster — voreingestellt ist eine Abholung in zwei Tagen.</p>
                    <p className="form-label mb-2.5">Abholtermin <span className="text-brand-500">*</span></p>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="relative">
                        <button type="button" onClick={() => togglePicker("cal")} className={`form-chip ${openPicker === "cal" ? "form-chip--active" : ""}`}>
                          {formatDisplayDate(data.datum)}
                        </button>
                        {openPicker === "cal" && (
                          <div className="form-dropdown p-4 w-[296px]">
                            <div className="flex items-center justify-between mb-3">
                              <button type="button" onClick={() => shiftMonth(-1)} className="form-calendar-nav-btn"><ChevronLeft className="w-4 h-4" /></button>
                              <span className="text-sm font-medium text-slate-900">{MONTHS[calM]} {calY}</span>
                              <button type="button" onClick={() => shiftMonth(1)} className="form-calendar-nav-btn"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                            <div className="grid grid-cols-7 gap-[3px] mb-1.5">
                              {WEEKDAYS.map((w) => <div key={w} className="form-calendar-weekday">{w}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-[3px]">
                              {calDays.map((cd) => (
                                <button
                                  key={cd.iso}
                                  type="button"
                                  onClick={() => { setData((d) => ({ ...d, datum: cd.iso })); setOpenPicker(""); setErr(""); }}
                                  className={`form-calendar-day ${cd.isSelected ? "form-calendar-day--selected" : cd.isToday ? "form-calendar-day--today" : ""} ${!cd.inMonth ? "form-calendar-day--outside" : ""}`}
                                >
                                  {cd.day}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-neutral-500">von</span>
                      <div className="relative">
                        <button type="button" onClick={() => togglePicker("von")} className={`form-chip ${openPicker === "von" ? "form-chip--active" : ""}`}>{data.von}</button>
                        {openPicker === "von" && (
                          <div ref={vonListRef} className="form-dropdown max-h-60 overflow-y-auto w-[120px] p-1.5">
                            {TIME_SLOTS.map((t) => (
                              <button key={t} type="button" data-time={t} onClick={() => { setData((d) => ({ ...d, von: t })); setOpenPicker(""); setErr(""); }} className={`form-dropdown-item ${t === data.von ? "form-dropdown-item--selected" : ""}`}>{t}</button>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-neutral-500">bis</span>
                      <div className="relative">
                        <button type="button" onClick={() => togglePicker("bis")} className={`form-chip ${openPicker === "bis" ? "form-chip--active" : ""}`}>{data.bis}</button>
                        {openPicker === "bis" && (
                          <div ref={bisListRef} className="form-dropdown max-h-60 overflow-y-auto w-[120px] p-1.5">
                            {TIME_SLOTS.map((t) => (
                              <button key={t} type="button" data-time={t} onClick={() => { setData((d) => ({ ...d, bis: t })); setOpenPicker(""); setErr(""); }} className={`form-dropdown-item ${t === data.bis ? "form-dropdown-item--selected" : ""}`}>{t}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {openPicker && <div onClick={() => setOpenPicker("")} className="fixed inset-0 z-40" />}
                    <label className="flex flex-col gap-2 mt-6">
                      <span className="form-label mb-0">
                        Möchten Sie uns etwas mitteilen? <span className="text-neutral-300 font-normal">(optional)</span>
                      </span>
                      <textarea
                        value={data.bemerkung}
                        onChange={(e) => setData((d) => ({ ...d, bemerkung: e.target.value }))}
                        rows={3}
                        placeholder="Besondere Hinweise zur Abholung…"
                        className="form-textarea"
                      />
                    </label>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h2 className="heading-h2">Wo sollen wir abholen?</h2>
                    <p className="text-neutral-500 mt-2 mb-7 leading-[1.4]">Wählen Sie den gewünschten Abholungsort.</p>
                    <div className="flex flex-col gap-2.5">
                      {(["Büro", "Warenannahme", "Sonstiges"] as const).map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => { setData((d) => ({ ...d, ort: loc })); setErr(""); }}
                          className={`form-option-card ${data.ort === loc ? "form-option-card--selected" : ""}`}
                        >
                          <span className={`form-option-badge ${data.ort === loc ? "form-option-badge--selected" : ""}`}><Check className="w-3 h-3" strokeWidth={3} /></span>
                          <span className="text-base font-normal flex-1 text-left">{loc}</span>
                        </button>
                      ))}
                    </div>
                    {data.ort === "Sonstiges" && (
                      <input
                        type="text"
                        value={data.ortText}
                        onChange={(e) => setData((d) => ({ ...d, ortText: e.target.value }))}
                        placeholder="Abweichende Adresse / Bemerkungen eingeben…"
                        className="form-input mt-3"
                      />
                    )}
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <h2 className="heading-h2">Ihr Paket</h2>
                    <p className="text-neutral-500 mt-2 mb-6 leading-[1.4]">Wählen Sie die ungefähre Größe — die genauen Maße klären wir bei der Abholung.</p>
                    <p className="form-label mb-2.5">Paketgröße <span className="text-brand-500">*</span></p>
                    <div className="flex flex-col gap-2 mb-8">
                      {SIZE_OPTIONS.map((sz) => (
                        <button
                          key={sz.label}
                          type="button"
                          onClick={() => { setData((d) => ({ ...d, size: sz.label })); setErr(""); }}
                          className={`form-option-card ${data.size === sz.label ? "form-option-card--selected" : ""}`}
                        >
                          <span className={`form-option-badge ${data.size === sz.label ? "form-option-badge--selected" : ""}`}><Check className="w-3 h-3" strokeWidth={3} /></span>
                          <span className="flex-1 flex flex-col gap-0.5 text-left">
                            <span className="text-base font-normal">{sz.label}</span>
                            <span className="text-[13px] text-neutral-500">{sz.desc}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between items-baseline mb-4">
                      <span className="form-label mb-0">Paketgewicht</span>
                      <span className="heading-h3">{data.gewicht >= 20 ? "20+ kg" : `${data.gewicht} kg`}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={0.5}
                      value={data.gewicht}
                      onChange={(e) => setData((d) => ({ ...d, gewicht: parseFloat(e.target.value) }))}
                      className="w-full accent-brand-500"
                    />
                    <div className="flex justify-between text-xs text-neutral-300 mt-2">
                      <span>0 kg</span><span>20+ kg</span>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div>
                    <h2 className="heading-h2">Serviceoptionen</h2>
                    <p className="text-neutral-500 mt-2 mb-6 leading-[1.4]">Zwei kurze Angaben zur Bearbeitung.</p>
                    <p className="form-label mb-2.5">Zahnersatz (falls nötig) durchführen? <span className="text-brand-500">*</span></p>
                    <div className="flex flex-col gap-2 mb-6">
                      {CARBIDE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => { setData((d) => ({ ...d, zahn: opt.value })); setErr(""); }}
                          className={`form-option-card ${data.zahn === opt.value ? "form-option-card--selected" : ""}`}
                        >
                          <span className={`form-option-badge ${data.zahn === opt.value ? "form-option-badge--selected" : ""}`}><Check className="w-3 h-3" strokeWidth={3} /></span>
                          <span className="text-base font-normal flex-1 text-left">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="form-label mb-2.5">Gravur <span className="text-brand-500">*</span></p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ENGRAVING_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => { setData((d) => ({ ...d, gravur: opt.value })); setErr(""); }}
                          className={`form-option-card ${data.gravur === opt.value ? "form-option-card--selected" : ""}`}
                        >
                          <span className={`form-option-badge ${data.gravur === opt.value ? "form-option-badge--selected" : ""}`}><Check className="w-3 h-3" strokeWidth={3} /></span>
                          <span className="text-base font-normal flex-1 text-left">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div>
                    <h2 className="heading-h2">Ihre Kontaktdaten</h2>
                    <p className="text-neutral-500 mt-2 mb-7 leading-[1.4]">Damit wir wissen, an wen wir uns wenden dürfen.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="flex flex-col gap-2">
                        <span className="form-label mb-0">Firma <span className="text-brand-500">*</span></span>
                        <input value={data.firma} onChange={(e) => setData((d) => ({ ...d, firma: e.target.value }))} placeholder="Muster GmbH" className="form-input" />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="form-label mb-0">Kontaktperson <span className="text-brand-500">*</span></span>
                        <input value={data.kontakt} onChange={(e) => setData((d) => ({ ...d, kontakt: e.target.value }))} placeholder="Max Mustermann" className="form-input" />
                      </label>
                    </div>
                    <label className="flex flex-col gap-2 mt-4">
                      <span className="form-label mb-0">E-Mail <span className="text-brand-500">*</span></span>
                      <input type="email" value={data.email} onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))} placeholder="anfrage@firma.de" className="form-input" />
                    </label>
                  </div>
                )}

                {step === 7 && (
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6 rounded-pill bg-brand-500 flex items-center justify-center text-white">
                      <Check className="w-9 h-9" strokeWidth={2.5} />
                    </div>
                    <h2 className="heading-h2">Vielen Dank!</h2>
                    <p className="text-neutral-500 mt-2.5 max-w-[400px] mx-auto leading-relaxed">
                      Ihre Anfrage wurde übermittelt. Wir melden uns innerhalb von <strong className="text-slate-900 font-medium">24 Stunden</strong> bei Ihnen.
                    </p>
                    <button type="button" onClick={restart} className="btn-outline mt-7">Neue Anfrage starten</button>
                    <div className="mt-10 text-left">
                      <RecommendationsClient
                        surface="form_success"
                        seedFilters={{
                          categoryId: data.werkzeuge.map((w) => SCHAERFSERVICE_CATEGORY_MAP[w]).find(Boolean),
                        }}
                        title="Das könnte zu Ihrer Anfrage passen"
                        limit={8}
                      />
                    </div>
                  </div>
                )}

                {err && (
                  <div className="mt-5 flex items-center gap-2 text-[#d8351e] text-sm">
                    <span>⚠</span>{err}
                  </div>
                )}

                {step !== 7 && (
                  <div className="flex items-center gap-3 mt-9">
                    {canBack && (
                      <button type="button" onClick={goBack} aria-label="Zurück" className="w-12 h-12 flex-shrink-0 border border-neutral-100 bg-white rounded-sm cursor-pointer flex items-center justify-center text-neutral-600 hover:bg-brand-25 hover:border-brand-100 transition-colors duration-[240ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)]">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}
                    <button type="button" onClick={goNext} disabled={submitting} className="btn-brand" style={{ opacity: submitting ? 0.7 : 1 }}>
                      {submitting ? "Wird gesendet…" : STEP_LABELS[Math.min(step, 6) - 1]}
                      {!submitting && <ChevronRight className="w-4 h-4" />}
                    </button>
                    <span className="text-xs text-neutral-300 hidden sm:flex items-center gap-1.5">
                      drücken Sie <span className="kbd">Enter ↵</span>
                    </span>
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

export default SchaerfPage;
