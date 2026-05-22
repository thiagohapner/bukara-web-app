"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, ArrowRight, ExternalLink } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

function AboutCheck() {
  return <Check className="w-4 h-4 text-[#00A597] flex-shrink-0 mt-0.5" strokeWidth={2.5} />;
}

export default function HomeAboutSections() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".home-about-section").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 40,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ── Unser Anspruch ── */}
      <section className="home-about-section max-w-[1320px] mx-auto px-4 sm:px-6 py-16">
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
            <p className="text-xs font-semibold text-[#00A597] uppercase tracking-widest mb-3">SONDERWERKZEUG</p>
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
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Unser Sortiment ── */}
      <section className="home-about-section max-w-[1320px] mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col lg:flex-row-reverse gap-12 items-center">
          <div className="relative w-full lg:w-[48%] flex-shrink-0 aspect-[4/3] rounded-2xl overflow-hidden">
            <Image
              src="https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/ueber-uns/assortment.png"
              alt="Schnell und digital bestellen"
              fill
              className="object-cover"
            />
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
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
              <a href="https://b2b.bukara.de/" target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex items-center gap-2" style={{ textDecoration: "none" }}>
                Zum B2B Portal
                <ExternalLink className="w-4 h-4" strokeWidth={2.5} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Unser Service ── */}
      <section className="home-about-section max-w-[1320px] mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="relative w-full lg:w-[48%] flex-shrink-0 aspect-[4/3] rounded-2xl overflow-hidden">
            <Image
              src="https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/services/schaerfservice/A3679582.png"
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
                  <AboutCheck />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/loesungen/schaerfservice" className="btn-orange inline-flex items-center gap-2" style={{ textDecoration: "none" }}>
              Schärfservice anfragen
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
