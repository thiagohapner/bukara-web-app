"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { CheckCircle } from "lucide-react";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-title",   { opacity: 0, y: 40, duration: 0.8 })
        .from(".hero-desc",    { opacity: 0, y: 24, duration: 0.6 }, "-=0.4")
        .from(".hero-checks",  { opacity: 0, y: 18, duration: 0.5 }, "-=0.3")
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
      className="relative overflow-hidden bg-white lg:min-h-[640px]"
    >
      <div className="relative max-w-[1320px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-start pt-[40px] lg:pt-[75px] lg:min-h-[640px]">
        {/* Left — text */}
        <div className="w-full lg:w-[50%] pt-0 pb-6 lg:pt-0 lg:pb-0 z-10">
          <h1 className="hero-title text-[48px] lg:text-[53px] font-normal text-slate-900 leading-[1.06] mb-5 max-w-[560px]">
            Ihr Werkzeugpartner für Holz und Kunststoff
          </h1>
          <p className="hero-desc text-slate-500 text-[22px] leading-snug max-w-[420px] mb-7">
            Schnelle Lieferung, Sonderlösungen nach Maß, breites Standardsortiment
          </p>
          <ul className="hero-checks flex flex-col gap-3 mb-9">
            {[
              "Sonderlösungen ohne Mindeststückzahl",
              "Lieferung in 2–3 Wochen",
              "Deutschlandweiter Schärfservice",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-slate-700 text-[18px]">
                <CheckCircle className="w-5 h-5 text-slate-900 shrink-0" strokeWidth={1.8} />
                {item}
              </li>
            ))}
          </ul>
          <div className="hero-cta flex flex-col lg:flex-row gap-3">
            <Link href="/loesungen/sonderwerkzeug" className="btn-orange w-full lg:w-auto justify-center" style={{ textDecoration: "none" }}>
              Sonderlösung anfragen
            </Link>
            <Link href="/katalog" className="btn-outline w-full lg:w-auto justify-center" style={{ textDecoration: "none" }}>
              Produkte entdecken
            </Link>
          </div>
        </div>

        {/* Right — product images */}
        <div className="hidden lg:flex w-full lg:w-[50%] items-start h-[360px] lg:h-[576px] gap-4">
          {/* Keyboard — 2/3 width of headphones via flex ratio */}
          <div
            className="hero-keyboard relative rounded-lg overflow-hidden cursor-pointer"
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
            className="hero-phones relative rounded-lg overflow-hidden cursor-pointer"
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
