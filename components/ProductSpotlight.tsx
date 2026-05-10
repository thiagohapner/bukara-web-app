"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ProductSpotlight() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".spotlight-text", {
        opacity: 0,
        x: -50,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ".spotlight-inner", start: "top 82%" },
      });
      gsap.from(".spotlight-img", {
        opacity: 0,
        x: 50,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ".spotlight-inner", start: "top 82%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-6 bg-white">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="spotlight-inner bg-slate-100 rounded-3xl overflow-hidden flex flex-col sm:flex-row items-center justify-between px-10 py-10 gap-8 min-h-[200px]">
          {/* Text */}
          <div className="spotlight-text">
            <p className="text-[10px] font-bold tracking-widest uppercase text-orange-500 mb-2">
              Wir feiern mit Ihnen unser Jubiläum 🎉
            </p>
            <h2 className="text-3xl font-semibold text-slate-900 mb-5">
              30 Jahre Bukara - Ein Jahr voller Deals und Angebote
            </h2>
            <button className="btn-orange text-sm">
              Angebote entdecken
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          {/* Emoji */}
          <div className="spotlight-img flex-shrink-0 flex items-center justify-center w-[120px] h-[120px]">
            <span style={{ fontSize: "6rem", lineHeight: 1 }}>🎁</span>
          </div>
        </div>
      </div>
    </section>
  );
}
