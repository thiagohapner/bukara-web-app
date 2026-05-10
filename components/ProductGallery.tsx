"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  placeholderBg: string;
  placeholderLabel: string;
  badge?: string;
}

function PlaceholderBlock({ bg, label, className = "" }: { bg: string; label: string; className?: string }) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center ${className}`}
      style={{ background: bg }}
    >
      <span
        className="font-black tracking-tighter select-none text-2xl"
        style={{ color: "rgba(0,165,151,0.18)" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function ProductGallery({ images, placeholderBg, placeholderLabel, badge }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Only show slots for real images; fall back to one placeholder when none provided
  const hasImages = images.length > 0;
  const slots = hasImages ? images : [null];
  const activeImage = hasImages ? images[Math.min(activeIndex, images.length - 1)] : null;

  return (
    <>
      {/* ── Desktop: thumbs column + main image ── */}
      <div className="hidden lg:flex flex-row gap-3 h-full">
        {/* Thumbnail column — only shown when there are multiple images */}
        {images.length > 1 && (
          <div className="flex flex-col gap-2 w-[72px] flex-shrink-0">
            {images.map((img, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-colors flex-shrink-0 ${
                    isActive ? "border-[#00A597]" : "border-transparent hover:border-slate-300"
                  }`}
                  aria-label={`Bild ${idx + 1}`}
                >
                  <Image src={img} alt={`${placeholderLabel} ${idx + 1}`} fill className="object-cover" />
                </button>
              );
            })}
          </div>
        )}

        {/* Main image */}
        <div className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden">
          {badge && (
            <span className="absolute top-3 left-3 z-10 bg-[#9B242A] text-white text-[12px] font-bold px-2.5 py-1 rounded-full tracking-wide">
              {badge}
            </span>
          )}
          {activeImage ? (
            <Image
              src={activeImage}
              alt={placeholderLabel}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          ) : (
            <PlaceholderBlock bg={placeholderBg} label={placeholderLabel} />
          )}
        </div>
      </div>

      {/* ── Mobile: horizontal scroll-snap gallery ── */}
      <div
        className="lg:hidden flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {slots.map((img, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[82%] aspect-[3/4] snap-start rounded-2xl overflow-hidden relative"
          >
            {i === 0 && badge && (
              <span className="absolute top-3 left-3 z-10 bg-[#9B242A] text-white text-[12px] font-bold px-2.5 py-1 rounded-full tracking-wide">
                {badge}
              </span>
            )}
            {img ? (
              <Image
                src={img}
                alt={`${placeholderLabel} ${i + 1}`}
                fill
                className="object-cover"
                sizes="82vw"
              />
            ) : (
              <PlaceholderBlock bg={placeholderBg} label={placeholderLabel} />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
