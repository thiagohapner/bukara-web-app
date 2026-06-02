"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";

interface Props {
  images: string[];
  placeholderBg: string;
  placeholderLabel: string;
  badge?: string;
}

function PlaceholderBlock({ label }: { label: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: "#EEEEEE" }}>
      <span className="font-black tracking-tighter select-none text-2xl" style={{ color: "rgba(0,165,151,0.18)" }}>
        {label}
      </span>
    </div>
  );
}

export default function ProductGallery({ images, placeholderLabel, badge }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Escape key to close
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxIndex(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxIndex]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIndex]);

  const mainImage = images.length > 0 ? images[0] : null;

  return (
    <>
      {/* ── Desktop: main image + 3/4 grid below ── */}
      <div className="hidden lg:block">
        {/* Main image */}
        <div
          className="relative w-full aspect-[10/11] rounded-2xl overflow-hidden mb-2 cursor-zoom-in"
          style={{ background: "#EEEEEE" }}
          onClick={() => mainImage && setLightboxIndex(0)}
        >
          {mainImage ? (
            <div className="absolute inset-2">
              <Image src={mainImage} alt={placeholderLabel} fill className="object-contain"
                sizes="(max-width: 1024px) 100vw, 55vw" />
            </div>
          ) : (
            <PlaceholderBlock label={placeholderLabel} />
          )}
          {badge && (
            <span className="absolute top-3 left-3 z-10 bg-[#9B242A] text-white text-[12px] font-bold px-2.5 py-1 rounded-full tracking-wide">
              {badge}
            </span>
          )}
        </div>

        {/* Additional images grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-2 gap-2">
            {images.slice(1, 5).map((img, idx) => (
              <div
                key={idx}
                className="relative w-full aspect-[10/11] rounded-xl overflow-hidden cursor-zoom-in"
                style={{ background: "#EEEEEE" }}
                onClick={() => setLightboxIndex(idx + 1)}
              >
                <div className="absolute inset-2">
                  <Image src={img} alt={`${placeholderLabel} ${idx + 2}`} fill className="object-contain" sizes="27vw" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Mobile: horizontal scroll-snap ── */}
      <div
        className="lg:hidden flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {(images.length > 0 ? images : [null]).map((img, i) => (
          <div key={i} className="flex-shrink-0 w-[82%] aspect-[10/11] snap-start rounded-2xl overflow-hidden relative"
            style={{ background: "#EEEEEE" }}>
            {i === 0 && badge && (
              <span className="absolute top-3 left-3 z-10 bg-[#9B242A] text-white text-[12px] font-bold px-2.5 py-1 rounded-full tracking-wide">
                {badge}
              </span>
            )}
            {img ? (
              <div className="absolute inset-2">
                <Image src={img} alt={`${placeholderLabel} ${i + 1}`} fill className="object-contain" sizes="82vw" />
              </div>
            ) : (
              <PlaceholderBlock label={placeholderLabel} />
            )}
          </div>
        ))}
      </div>

      {/* ── Lightbox — rendered via portal directly on document.body ── */}
      {lightboxIndex !== null && images[lightboxIndex] &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.92)" }}
            onClick={() => setLightboxIndex(null)}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute top-5 right-5 z-10 w-11 h-11 rounded-full flex items-center justify-center text-white transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              aria-label="Schließen"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image — stopPropagation prevents backdrop-click from firing */}
            <div
              className="relative"
              style={{ width: "min(85vw, 700px)", height: "85vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightboxIndex]}
                alt={`${placeholderLabel} ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="85vw"
                priority
              />
            </div>
          </div>,
          document.body
        )
      }
    </>
  );
}
