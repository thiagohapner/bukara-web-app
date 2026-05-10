"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CATEGORIES } from "@/lib/data";

const ICONS: Record<string, React.ReactNode> = {
  // Circular saw blade — outer circle, center hole, 8 tooth marks
  kreissaegen: (
    <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="2" />
      <path strokeLinecap="round" d="M12 4.5V3M17.7 6.3l1-1M19.5 12H21M17.7 17.7l1 1M12 19.5V21M6.3 17.7l-1 1M4.5 12H3M6.3 6.3l-1-1" />
    </svg>
  ),
  // Shank tool — body with flute lines, narrower shank below
  schaftwerkzeuge: (
    <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6v13H9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 16h3v5h-3z" />
      <path strokeLinecap="round" d="M9.5 6c1.5 1 3 2 5 2.5" />
      <path strokeLinecap="round" d="M9.5 10c1.5 1 3 2 5 2.5" />
    </svg>
  ),
  // Sharpening service — grinding wheel with spark lines
  schaerfservice: (
    <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
      <circle cx="11" cy="13" r="7" />
      <circle cx="11" cy="13" r="2" />
      <path strokeLinecap="round" d="M16 8l2-3M18 8l2-2M17 6l2-1" />
    </svg>
  ),
  // Twist drill — cylindrical body, V-tip, helical flutes
  bohrer: (
    <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 2h4v14h-4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 16l2 5 2-5" />
      <path strokeLinecap="round" d="M10.5 5c1 1.5 2 2.5 3.5 3" />
      <path strokeLinecap="round" d="M10.5 9.5c1 1.5 2 2.5 3.5 3" />
    </svg>
  ),
  // Tool holder (HSK) — tapered cone + flange collar + shank
  spannsysteme: (
    <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8l-2.5 9h-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 13h10v2.5H7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 15.5h4V20h-4z" />
    </svg>
  ),
  // Carbide spiral drill — wider flutes, 3 helix marks, similar tip
  "hartmetall-spiralbohrer": (
    <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 2h5v12h-5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 14l2.5 5.5 2.5-5.5" />
      <path strokeLinecap="round" d="M9.5 5c1.5 1 2.5 1.5 5 2" />
      <path strokeLinecap="round" d="M9.5 8.5c1.5 1 2.5 1.5 5 2" />
      <path strokeLinecap="round" d="M9.5 12c1.5 0.5 2.5 1 5 1.5" />
    </svg>
  ),
  // End mill / Fräser — wide body, shank on top, cutting edges at base
  fraeser: (
    <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 2h4v4h-4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h8v12H8z" />
      <path strokeLinecap="round" d="M8 18h8" />
      <path strokeLinecap="round" d="M9 9c1 1 2 2 2.5 4" />
      <path strokeLinecap="round" d="M13 9c0.5 1.5 1 2.5 2.5 4" />
    </svg>
  ),
};

export default function CategoryRail() {
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".cat-item", {
        opacity: 0,
        y: 30,
        duration: 0.5,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: ".cat-rail", start: "top 88%" },
      });
    }, railRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={railRef} className="pt-1 pb-12 border-b border-slate-100">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="cat-rail flex justify-between overflow-x-auto gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className="cat-item flex flex-col items-center gap-4 min-w-[120px] group cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-orange-50 group-hover:text-orange-500 transition-all duration-250">
                {ICONS[cat.slug]}
              </div>
              <span className="text-sm font-medium text-slate-600 group-hover:text-orange-500 transition-colors leading-tight text-center">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
