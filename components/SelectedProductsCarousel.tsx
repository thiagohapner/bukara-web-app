"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import ProductCard, { type ProductCardData } from "./ProductCard";

function NavBtn({
  children,
  onClick,
  "aria-label": label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="appearance-none border-none cursor-pointer w-10 h-10 rounded-full bg-[#0F172A] flex items-center justify-center transition-colors duration-150 hover:bg-[#1e293b]"
    >
      {children}
    </button>
  );
}

export default function SelectedProductsCarousel({
  cards,
}: {
  cards: ProductCardData[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
          Ausgewählte Produkte
        </h2>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <NavBtn aria-label="Zurück" onClick={() => scroll(-1)}>
              <ChevronLeft size={18} strokeWidth={2} className="text-white" />
            </NavBtn>
            <NavBtn aria-label="Weiter" onClick={() => scroll(1)}>
              <ChevronRight size={18} strokeWidth={2} className="text-white" />
            </NavBtn>
          </div>
          <Link
            href="/katalog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-[#00A597] transition-colors whitespace-nowrap"
            style={{ textDecoration: "none" }}
          >
            Alle Produkte ansehen
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-3 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {cards.map((c) => (
          <div
            key={c.slug}
            className="shrink-0 snap-start basis-[78%] sm:basis-[44%] lg:basis-[30%] xl:basis-[23%]"
          >
            <ProductCard card={{ ...c, variant: "grid" }} />
          </div>
        ))}
      </div>
    </section>
  );
}
