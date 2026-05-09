"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/Footer";

gsap.registerPlugin(ScrollTrigger);

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-[#00A597] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Placeholder({ bg, label, className = "" }: { bg: string; label: string; className?: string }) {
  return (
    <div
      className={`w-full rounded-2xl flex items-center justify-center ${className}`}
      style={{ background: bg }}
    >
      <span className="font-black tracking-tighter select-none text-4xl sm:text-5xl" style={{ color: "rgba(0,165,151,0.13)" }}>
        {label}
      </span>
    </div>
  );
}


export default function UeberUnsPage() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".ueber-section").forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          y: 40,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
          },
        });
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <main className="min-h-screen bg-white">

        {/* Breadcrumb */}
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Über uns</span>
          </nav>
        </div>

        {/* ── 1. Hero ── */}
        <section className="ueber-section max-w-[1320px] mx-auto px-4 sm:px-6 pt-12 pb-4">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="inline-flex text-[12px] font-bold bg-[#00A597] text-white rounded-full px-3 py-1.5 leading-none tracking-wide mb-5">
              Über uns
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
              Wir sind Bukara Werkzeuge
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed">
              Seit fast 30 Jahren stehen wir für präzise Werkzeuglösungen und kurze Entscheidungswege.
            </p>
          </div>
        </section>

        {/* ── 2. Identity ── */}
        <section className="ueber-section max-w-[1320px] mx-auto px-4 sm:px-6 py-16">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="relative w-full lg:w-[48%] flex-shrink-0 aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/services/sonderwerkzeug/Frame%2065%20(4).png"
                alt="Sonderwerkzeuge"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#00A597] uppercase tracking-widest mb-3">Unser Anspruch</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-5">
                Präzision vom ersten Kontakt bis zur Lieferung
              </h2>
              <p className="text-slate-600 text-base leading-relaxed mb-4">
                Dank unserer außergewöhnlich hohen Produktionstiefe realisieren wir Sonderlösungen besonders schnell und zuverlässig.
              </p>
              <p className="text-slate-600 text-base leading-relaxed mb-8">
                Von Profilwechselmessern über VHM-Werkzeuge bis zu diamantbestückten Lösungen – wir entwickeln gemeinsam mit Ihnen die optimale Ausführung und liefern vom ersten Kontakt bis zum fertigen Werkzeug in kürzester Zeit.
              </p>
              <Link href="/loesungen/sonderwerkzeug" className="btn-orange inline-flex items-center gap-2" style={{ textDecoration: "none" }}>
                Sonderwerkzeuge anfragen
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── 3. B2B Portal ── */}
        <section className="ueber-section max-w-[1320px] mx-auto px-4 sm:px-6 py-16">
          <div className="flex flex-col lg:flex-row-reverse gap-12 items-center">
            <div className="w-full lg:w-[48%] flex-shrink-0">
              <Placeholder bg="#f5ede8" label="B2B Portal" className="aspect-[4/3]" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#00A597] uppercase tracking-widest mb-3">Unser Sortiment</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
                Schnell und digital bestellen
              </h2>
              <div className="inline-flex items-center gap-1.5 bg-white rounded-lg px-3 py-1.5 mb-5" style={{ border: "1px solid #e8e8e8" }}>
                <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: "#022221" }}>Exklusiver Partner von</span>
                <Image src="/ITA_Logo.png" alt="ITA Tools" width={44} height={14} className="object-contain" />
              </div>
              <p className="text-slate-600 text-base leading-relaxed mb-4">
                Unser Sortiment wächst – und zwar mit System: Dank unserer Exklusivpartnerschaft mit einem der am schnellsten wachsenden Standardwerkzeug-Anbieter Europas bekommen Sie starke Produkte zu einem Preis-Leistungs-Verhältnis, das überzeugt.
              </p>
              <p className="text-slate-600 text-base leading-relaxed mb-8">
                Über unser B2B-Portal haben Sie jederzeit Zugriff auf Preise, Verfügbarkeit und Bestellinfos – ohne Umwege, ohne Warten.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/produkte" className="btn-orange inline-flex items-center gap-2" style={{ textDecoration: "none" }}>
                  Produkte entdecken
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <a href="https://b2b.bukara.de/" target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex items-center gap-2" style={{ textDecoration: "none" }}>
                  Zum B2B Portal
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Schärfservice ── */}
        <section className="ueber-section max-w-[1320px] mx-auto px-4 sm:px-6 py-16">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="relative w-full lg:w-[48%] flex-shrink-0 aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/services/schaerfservice/main_image_small.png"
                alt="Schärfservice"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#00A597] uppercase tracking-widest mb-3">Unser Service</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-5">
                Bequemer Schärfservice
              </h2>
              <p className="text-slate-600 text-base leading-relaxed mb-4">
                Zu jedem Werkzeug gehört auch ein zuverlässiger Service – genau das bieten wir Ihnen. Durch die deutschlandweite Abholung über unseren Versandpartner oder die persönliche Abholung durch einen Bukara-Mitarbeiter bei Ihnen vor Ort, bleibt Ihr Aufwand minimal.
              </p>
              <p className="text-slate-600 text-base leading-relaxed mb-5">
                Wir prüfen Ihre gebrauchten Werkzeuge und setzen sie fachgerecht instand – egal ob Bukara-Werkzeug oder Fremdfabrikat, und sowohl in Diamant- als auch Hartmetall-Ausführung.
              </p>
              <ul className="flex flex-col gap-2 mb-8">
                {["Faire Preise", "Schnelle Durchlaufzeit", "In der Regel innerhalb von 1–2 Wochen geschärft zurück"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-900">
                    <CheckIcon />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/loesungen/schaerfservice" className="btn-orange inline-flex items-center gap-2" style={{ textDecoration: "none" }}>
                Schärfservice anfragen
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── 6. Kontakt ── */}
        <section className="ueber-section w-full py-20" style={{ background: "linear-gradient(135deg, #00A597 0%, #007A70 100%)" }}>
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Kontakt</h2>
            <p className="text-white/80 text-base mb-8 max-w-md mx-auto leading-relaxed">
              Wir beraten Sie gerne per E-Mail, Telefon oder bei einem persönlichen Gespräch.
            </p>
            <div className="flex flex-col items-center gap-2 text-white/90 text-sm mb-10">
              <span className="font-semibold text-white">Bukara GmbH · Siemensstraße 24 · 72280 Dornstetten</span>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 mt-1">
                <a href="mailto:info@bukara.de" className="flex items-center gap-1.5 hover:text-white transition-colors" style={{ textDecoration: "none", color: "rgba(255,255,255,0.85)" }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@bukara.de
                </a>
                <a href="tel:+4974439661-0" className="flex items-center gap-1.5 hover:text-white transition-colors" style={{ textDecoration: "none", color: "rgba(255,255,255,0.85)" }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +49 7443 / 9661-0
                </a>
              </div>
            </div>
            <a
              href="mailto:info@bukara.de"
              className="inline-flex items-center gap-2 bg-white font-semibold text-sm rounded-full px-6 py-3 hover:bg-slate-50 transition-colors"
              style={{ textDecoration: "none", color: "#00A597" }}
            >
              E-Mail schreiben
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
