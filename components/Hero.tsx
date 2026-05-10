"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-title",   { opacity: 0, y: 40, duration: 0.8 })
        .from(".hero-desc",    { opacity: 0, y: 24, duration: 0.6 }, "-=0.4")
        .from(".hero-cta",     { opacity: 0, y: 20, duration: 0.5 }, "-=0.3")
        .from(".hero-keyboard",{ opacity: 0, x: 60, scale: 0.88, duration: 1, ease: "back.out(1.2)" }, "-=0.9")
        .from(".hero-phones",  { opacity: 0, x: -50, y: 30, scale: 0.88, duration: 1, ease: "back.out(1.2)" }, "-=0.8");

      // Continuous floating
      gsap.to(".hero-keyboard", {
        y: -12,
        duration: 6.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1.4,
      });

      gsap.to(".hero-phones", {
        y: -18,
        duration: 5.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1.6,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white min-h-[580px] lg:min-h-[640px]"
    >
      <div className="relative max-w-[1320px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-start pt-[75px] min-h-[580px] lg:min-h-[640px]">
        {/* Left — text */}
        <div className="w-full lg:w-[50%] py-16 lg:pt-0 lg:pb-0 z-10">
          <h1 className="hero-title text-4xl sm:text-5xl xl:text-6xl font-semibold text-slate-900 leading-[1.08] mb-6 max-w-[540px]">
            Das perfekte Werkzeug für Ihr Projekt
          </h1>
          <p className="hero-desc text-slate-500 text-[15px] leading-relaxed max-w-[440px] mb-8">
            Ihr Rundumpartner bei Werkzeug für die Holz- und Kunstoffbearbeitung.
            Schnell flexibel und ohne Mindeststückzahl
          </p>
          <div className="hero-cta flex flex-wrap gap-3 mb-8">
            <Link href="/loesungen/sonderwerkzeug" className="btn-orange text-sm" style={{ textDecoration: "none" }}>
              Sonderwerkzeug
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a href="https://b2b.bukara.de/" target="_blank" rel="noopener noreferrer" className="btn-outline text-sm inline-flex items-center gap-2" style={{ textDecoration: "none" }}>
              Zum B2B Portal
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>


        </div>

        {/* Right — product images */}
        <div className="w-full lg:w-[50%] flex items-start h-[360px] lg:h-[576px] gap-4">
          {/* Keyboard — 2/3 width of headphones via flex ratio */}
          <div
            className="hero-keyboard relative rounded-2xl overflow-hidden cursor-pointer"
            style={{ flex: 2, height: "65%", backgroundColor: "#e6eff5" }}
          >
            {/* <div className="absolute top-3 right-3 z-30 bg-white text-[#022221] text-[11px] font-bold px-2.5 py-1.5 rounded-full">
              Schärfservice
            </div> */}
            <Image
              src="https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/hero/main_image_small.png"
              alt="Bukara Tool"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Headphones — taller, fills remaining space */}
          <div
            className="hero-phones relative rounded-2xl overflow-hidden cursor-pointer"
            style={{ flex: 3, height: "90%", backgroundColor: "#f5ede8" }}
          >
            {/* <div className="absolute top-3 right-3 z-30 bg-white text-[#022221] text-[11px] font-bold px-2.5 py-1.5 rounded-full">
              Premium Product Line
            </div> */}
            <Image
              src="https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/hero/main_image.png"
              alt="Bukara End Mill"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
