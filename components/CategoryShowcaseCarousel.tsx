"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

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
          className="flex gap-3 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/sortiment/${item.slug}`}
              className="group min-w-0 shrink-0 snap-start basis-[78%] sm:basis-[44%] lg:basis-[30%] xl:basis-[23%]"
              style={{ textDecoration: "none" }}
            >
              <div
                className="relative flex min-h-[380px] sm:min-h-[480px] lg:min-h-[600px] flex-col overflow-hidden rounded-[28px] p-8 sm:p-10"
                style={{ background: "#EEEFEF" }}
              >
                {/* Transparent product PNG in a fixed-height strip anchored to the bottom,
                    so every tool renders to the same height (widths vary by tool thickness). */}
                {item.image && (
                  <div className="absolute inset-x-0 bottom-[88px] sm:bottom-[110px] lg:bottom-[132px] h-[42%]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 78vw, (max-width: 1280px) 30vw, 23vw"
                      className="object-contain object-bottom"
                    />
                  </div>
                )}

                <p className="relative z-10 text-sm font-medium text-slate-500">
                  {item.name}
                </p>
                {item.blurb && (
                  <h3 className="relative z-10 mt-2 break-words text-lg sm:text-xl font-semibold leading-tight text-slate-900">
                    {item.blurb}
                  </h3>
                )}

                <span
                  aria-hidden
                  className="absolute bottom-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition-transform duration-300 group-hover:scale-110"
                >
                  <ArrowUpRight size={20} strokeWidth={2.5} />
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
