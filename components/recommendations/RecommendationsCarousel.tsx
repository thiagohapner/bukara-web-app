"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";

/** Same scroll/arrow carousel as the home page's SelectedProductsCarousel, generalized with a title prop for reuse across recommendation surfaces (PDP, forms). */
export default function RecommendationsCarousel({
  title,
  cards,
}: {
  title: string;
  cards: ProductCardData[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
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
  }, [cards]);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  if (cards.length === 0) return null;

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8">
      <h2 className="heading-h3 mb-6">{title}</h2>

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

        <button
          type="button"
          aria-label="Zurück"
          onClick={() => scroll(-1)}
          style={{ top: imgCenter ?? "40%" }}
          className={`absolute left-2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white text-slate-900 shadow-[var(--shadow-md)] ring-1 ring-neutral-100 flex items-center justify-center hover:bg-brand-25 transition-colors duration-[240ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)] ${
            atStart ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>

        <button
          type="button"
          aria-label="Weiter"
          onClick={() => scroll(1)}
          style={{ top: imgCenter ?? "40%" }}
          className={`absolute right-2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white text-slate-900 shadow-[var(--shadow-md)] ring-1 ring-neutral-100 flex items-center justify-center hover:bg-brand-25 transition-colors duration-[240ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)] ${
            atEnd ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <ChevronRight size={20} strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}
