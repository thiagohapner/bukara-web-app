"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROMO_TILES } from "@/lib/data";

export default function PromoTiles() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".promo-tile", {
        opacity: 0,
        y: 40,
        scale: 0.97,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".promo-grid", start: "top 82%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-6 bg-white">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="promo-grid grid grid-cols-1 sm:grid-cols-3 gap-5">
          {PROMO_TILES.map((tile) => (
            <div
              key={tile.id}
              className="promo-tile relative rounded-2xl overflow-hidden min-h-[200px] flex items-center justify-between px-7 py-7 cursor-pointer group"
              style={{ backgroundColor: tile.bg }}
            >
              {/* Text */}
              <div className="z-10 max-w-[55%]">
                <p
                  className={`text-[10px] font-bold tracking-widest uppercase mb-2 ${
                    tile.dark ? "text-orange-400" : "text-orange-500"
                  }`}
                >
                  {tile.badge}
                </p>
                <h3
                  className={`text-[17px] font-semibold leading-tight mb-4 ${
                    tile.dark ? "text-white" : "text-slate-800"
                  }`}
                >
                  {tile.title}
                </h3>
                <button
                  className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-250 ${
                    tile.dark
                      ? "bg-orange-500 text-white hover:bg-orange-400"
                      : "text-white hover:opacity-90"
                  }`}
                  style={tile.dark ? undefined : { backgroundColor: "#044749" }}
                >
                  {tile.cta}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>

              {/* Image */}
              <div className="w-[42%] h-[160px] relative flex-shrink-0">
                <Image
                  src={tile.image}
                  alt={tile.title}
                  fill
                  className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                  sizes="(max-width: 640px) 50vw, 20vw"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
