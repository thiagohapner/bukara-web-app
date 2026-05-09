"use client";

import Link from "next/link";

interface Props {
  variant?: "full" | "compact" | "hero";
}

const TAG_ICON = <span style={{ fontSize: "3.375rem", lineHeight: 1 }}>🎁</span>;

export default function DealsPromo({ variant = "full" }: Props) {
  const isCompact = variant === "compact";

  if (variant === "hero") {
    return (
      <Link
        href="/angebote"
        className="group block rounded-2xl overflow-hidden"
        style={{ textDecoration: "none", background: "linear-gradient(135deg, #00A597 0%, #007A70 100%)" }}
      >
        <div className="flex items-center gap-3 px-5 py-4">
          <span className="flex w-12 h-12 rounded-xl bg-transparent items-center justify-center flex-shrink-0 text-white">
            {TAG_ICON}
          </span>
          <div>
            <p className="text-sm font-extrabold text-white leading-snug">
              30 Jahre Bukara — Ein Jahr voller Deals und Angebote
            </p>
            <p className="text-xs text-white/60 mt-0.5">Zuverlässige Präzision seit 1996</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="/angebote"
      className="group block rounded-2xl overflow-hidden"
      style={{ textDecoration: "none", background: "linear-gradient(135deg, #00A597 0%, #007A70 100%)" }}
    >
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${isCompact ? "px-6 py-5" : "px-8 py-7"}`}>
        <div className="flex items-center gap-4">
          <span className={`hidden sm:flex ${isCompact ? "w-12 h-12" : "w-14 h-14"} rounded-xl bg-transparent items-center justify-center flex-shrink-0 text-white`}>
            {TAG_ICON}
          </span>
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-0.5">
              Wir feiern mit Ihnen unser Jubiläum
            </p>
            <p className={`${isCompact ? "text-sm sm:text-base" : "text-base sm:text-lg"} font-extrabold text-white leading-snug`}>
              30 Jahre Bukara - Ein Jahr voller Deals und Angebote
            </p>
            <p className="text-s text-white/60 mt-0.5">Bukara - Zuverlässige Präzision seit 1996</p>
          </div>
        </div>
        <span className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-[#00A597] font-semibold text-sm rounded-full px-5 py-2.5 group-hover:bg-orange-50 transition-colors whitespace-nowrap">
          Jetzt entdecken
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
