"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";

interface Props {
  variant?: "full" | "compact" | "hero";
  lightBg?: boolean;
}

export default function DealsPromo({ variant = "full", lightBg = false }: Props) {
  const emojiRef = useRef<HTMLSpanElement>(null);
  const isCompact = variant === "compact";

  useEffect(() => {
    if (!emojiRef.current) return;
    const tween = gsap.to(emojiRef.current, {
      y: -5,
      duration: 2.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    return () => { tween.kill(); };
  }, []);

  if (variant === "hero") {
    return (
      <Link
        href="/angebote"
        className="group block rounded-lg overflow-hidden"
        style={{ textDecoration: "none", background: "linear-gradient(135deg, #00A597 0%, #007A70 100%)" }}
      >
        <div className="flex items-center gap-3 px-5 py-4">
          <span ref={emojiRef} className="flex w-12 h-12 rounded-xl bg-transparent items-center justify-center flex-shrink-0 text-white" style={{ fontSize: "4.5rem", lineHeight: 1 }}>
            🎁
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
      className="group block rounded-lg overflow-hidden"
      style={{
        textDecoration: "none",
        background: lightBg ? "#f1f5f9" : "linear-gradient(135deg, #00A597 0%, #007A70 100%)",
      }}
    >
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 ${isCompact ? "px-6 py-5" : "px-16 py-16"}`}>
        <div className="flex items-center gap-6">
          <span
            ref={emojiRef}
            className={`hidden sm:flex ${isCompact ? "w-12 h-12" : "w-20 h-20"} rounded-xl bg-transparent items-center justify-center flex-shrink-0`}
            style={{ fontSize: "4.5rem", lineHeight: 1 }}
          >
            🎁
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: lightBg ? "#00A597" : "rgba(255,255,255,0.7)" }}>
              Wir feiern mit Ihnen unser Jubiläum
            </p>
            <p className={`${isCompact ? "text-sm sm:text-base" : "text-xl sm:text-2xl"} font-extrabold leading-snug`} style={{ color: lightBg ? "#022221" : "#ffffff" }}>
              30 Jahre Bukara - Ein Jahr voller Deals und Angebote
            </p>
          </div>
        </div>
        <span
          className="flex-shrink-0 inline-flex items-center gap-2 font-semibold text-base rounded-sm px-7 py-3.5 transition-colors whitespace-nowrap"
          style={lightBg ? { backgroundColor: "#00A597", color: "#ffffff" } : { backgroundColor: "#ffffff", color: "#00A597" }}
        >
          Angebote entdecken
          <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
        </span>
      </div>
    </Link>
  );
}
