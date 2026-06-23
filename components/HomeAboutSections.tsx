"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ExternalLink } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

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
      {/* ── Unser Sortiment ── */}
      <section className="home-about-section max-w-[1320px] mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col lg:flex-row-reverse gap-12 items-center">
          <div className="relative w-full lg:w-[48%] flex-shrink-0 aspect-[4/3] rounded-lg overflow-hidden">
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
              <Link href="/katalog" className="btn-orange inline-flex items-center gap-2" style={{ textDecoration: "none" }}>
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
    </>
  );
}
