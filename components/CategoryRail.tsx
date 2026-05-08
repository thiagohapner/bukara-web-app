"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CATEGORIES } from "@/lib/data";

const ICONS: Record<string, React.ReactNode> = {
  smartphones: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="17" r="1" />
    </svg>
  ),
  smartwatch: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path strokeLinecap="round" d="M9 7V5m6 2V5M9 17v2m6-2v2" />
    </svg>
  ),
  games: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h4m-2-2v4M16 12h.01M18 10h.01M5 8h14a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2z" />
    </svg>
  ),
  home: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  ),
  headphones: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M3 18v-6a9 9 0 0118 0v6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
    </svg>
  ),
  laptops: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v10H4zM2 20h20" />
    </svg>
  ),
  gadget: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
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
    <section ref={railRef} className="py-12 border-b border-slate-100">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="cat-rail flex justify-between overflow-x-auto gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className="cat-item flex flex-col items-center gap-2.5 min-w-[80px] group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-orange-50 group-hover:text-orange-500 transition-all duration-250">
                {ICONS[cat.slug]}
              </div>
              <span className="text-[11px] font-medium text-slate-600 group-hover:text-orange-500 transition-colors whitespace-nowrap leading-tight text-center">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
