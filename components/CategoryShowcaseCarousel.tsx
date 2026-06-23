"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export type CategoryCardItem = {
  slug: string;
  name: string;
  blurb: string | null;
  image: string | null;
};

export default function CategoryShowcaseCarousel({
  items,
}: {
  items: CategoryCardItem[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-12">
      <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight mb-8">
        Unser Standardsortiment
      </h2>

      {/* Track + right-edge fade to hint there's more (3 cards visible, 4th peeks) */}
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={update}
          className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/sortiment/${item.slug}`}
              className="group shrink-0 snap-start basis-[85%] sm:basis-[48%] lg:basis-[31.5%]"
              style={{ textDecoration: "none" }}
            >
              <div
                className="relative flex min-h-[600px] flex-col overflow-hidden rounded-[28px] p-8 sm:p-10"
                style={{ background: "#FAFAFC" }}
              >
                {/* Background image slot — plain color for now, images may be added later.
                    When provided, render here with absolute inset-0 behind the text. */}

                <p className="relative z-10 text-sm font-medium text-slate-500">
                  {item.name}
                </p>
                {item.blurb && (
                  <h3 className="relative z-10 mt-2 max-w-[16ch] text-2xl sm:text-3xl font-semibold leading-tight text-slate-900">
                    {item.blurb}
                  </h3>
                )}

                <span
                  aria-hidden
                  className="absolute bottom-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition-transform duration-300 group-hover:scale-110"
                >
                  <Plus size={20} strokeWidth={2.5} />
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-white to-transparent transition-opacity duration-200 ${
            atEnd ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Left arrow — only after scrolling */}
        <button
          type="button"
          aria-label="Zurück"
          onClick={() => scroll(-1)}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white text-slate-900 shadow-md ring-1 ring-slate-200 flex items-center justify-center hover:bg-slate-50 transition ${
            atStart ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>

        {/* Right arrow — over the peeking 4th card */}
        <button
          type="button"
          aria-label="Weiter"
          onClick={() => scroll(1)}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white text-slate-900 shadow-md ring-1 ring-slate-200 flex items-center justify-center hover:bg-slate-50 transition ${
            atEnd ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <ChevronRight size={20} strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}
