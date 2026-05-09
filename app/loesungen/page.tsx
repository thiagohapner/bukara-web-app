"use client";

import { useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { SERVICES } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

export default function LoesungenPage() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".service-card");
      cards.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 40,
          duration: 0.65,
          ease: "power3.out",
          delay: i * 0.12,
          scrollTrigger: {
            trigger: card,
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
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Lösungen</span>
          </nav>
        </div>

        <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.slug} service={service} index={i} />
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
