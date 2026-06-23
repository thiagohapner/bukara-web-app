"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import ProductCard, { type ProductCardData } from "./ProductCard";

export default function SelectedProductsCarousel({
  cards,
}: {
  cards: ProductCardData[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  // Vertical center (px) of a card's image ("gray") area, so the arrows align to it.
  const [imgCenter, setImgCenter] = useState<number | null>(null);

  const update = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
    const imgEl = el.querySelector(".product-card")?.firstElementChild as HTMLElement | null;
    if (imgEl) setImgCenter(imgEl.clientHeight / 2);
  };

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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
        <Link
          href="/katalog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-[#00A597] transition-colors whitespace-nowrap"
          style={{ textDecoration: "none" }}
        >
          Alle Produkte ansehen
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Track + right-edge fade to hint there's more */}
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={update}
          className="flex gap-3 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {cards.map((c) => (
            <div
              key={c.slug}
              className="shrink-0 snap-start basis-[78%] sm:basis-[44%] lg:basis-[30%] xl:basis-[21%]"
            >
              <ProductCard card={{ ...c, variant: "grid" }} />
            </div>
          ))}
        </div>
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-white to-transparent transition-opacity duration-200 ${
            atEnd ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Left arrow — only after scrolling, over the far-left card */}
        <button
          type="button"
          aria-label="Zurück"
          onClick={() => scroll(-1)}
          style={{ top: imgCenter ?? "40%" }}
          className={`absolute left-2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white text-slate-900 shadow-md ring-1 ring-slate-200 flex items-center justify-center hover:bg-slate-50 transition ${
            atStart ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>

        {/* Right arrow — over the peeking 5th card */}
        <button
          type="button"
          aria-label="Weiter"
          onClick={() => scroll(1)}
          style={{ top: imgCenter ?? "40%" }}
          className={`absolute right-2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white text-slate-900 shadow-md ring-1 ring-slate-200 flex items-center justify-center hover:bg-slate-50 transition ${
            atEnd ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <ChevronRight size={20} strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}
