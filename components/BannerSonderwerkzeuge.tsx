"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import BannerAurora from "./BannerAurora";
import CtaArrow from "./CtaArrow";

type Feature = { text: ReactNode };

type RightPanel =
  | { kind: "features"; features: Feature[] }
  | { kind: "image"; src: string; alt: string };

type SlideId = "x99" | "sonderloesungen" | "schaerfservice";

type Slide = {
  id: SlideId;
  eyebrow?: string;
  headline: string;
  highlight: string;
  subline: string;
  ctaLabel: string;
  ctaHref: string;
  bgColor: string;
  textColor: string;
  ctaStyle: "dark" | "white" | "brand";
  highlightColor?: string;
  /** Dark-hero treatment: deep brand-teal surface, glowing aurora, eyebrow +
   *  light headline + subdued-teal body + CTA + checklist on dark.
   *  (X99 slide leaves this off and keeps its own dark-image look.) */
  darkHero?: boolean;
  /** Full-bleed background photo (in /public) for a darkHero slide, blended
   *  into the surface via a left→right gradient so the left stays dark for
   *  text. Replaces the aurora + checklist for that slide. */
  bgImage?: string;
  rightPanel: RightPanel;
};

const slides: Slide[] = [
  {
    id: "x99",
    headline: "X99 NeXcut VHW Highspeedfräser –",
    highlight: "Ab 55,72 €",
    subline:
      "Entdecken Sie Erweiterungsangebote die speziell auf den X99 NeXcut abgestimmt sind.",
    ctaLabel: "Angebote entdecken",
    ctaHref: "/angebote",
    bgColor: "#000000",
    textColor: "#ffffff",
    ctaStyle: "white",
    rightPanel: {
      kind: "image",
      src: "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/banner/Frame%2013%20(7).png",
      alt: "X99 NeXcut VHW Highspeedfräser",
    },
  },
  {
    id: "sonderloesungen",
    eyebrow: "Sonderlösungen",
    headline: "Sonderlösungen,",
    highlight: "geplant für Ihre Maschine",
    subline:
      "Wir definieren gemeinsam mit Ihnen Ihren vollständigen Werkzeugbedarf.",
    ctaLabel: "Sonderwerkzeug anfragen",
    ctaHref: "/sonder-werkzeug",
    bgColor: "var(--color-surface-dark)",
    textColor: "var(--color-text-dark-heading)",
    ctaStyle: "brand",
    darkHero: true,
    rightPanel: {
      kind: "features",
      features: [
        { text: <>Nach Ihrer Zeichnung oder Spezifikation gefertigt</> },
        { text: <>Keine Mindestbestellmenge</> },
        { text: <>Alle gängigen Materialien</> },
        { text: <>Klein- und Großserien</> },
        { text: <>Technische Beratung inklusive</> },
        { text: <>Jahrzehntelange Werkzeug-Expertise</> },
      ],
    },
  },
  {
    id: "schaerfservice",
    headline: "Nachschliff,",
    highlight: "der Standzeit verlängert",
    subline:
      "Nachschliff für HW-Messer, PCD-Werkzeuge und Bohrer – präzise, schnell, bundesweit.",
    ctaLabel: "Schärfauftrag starten",
    ctaHref: "/sonder-schaerfservice",
    bgColor: "var(--color-surface-dark)",
    textColor: "var(--color-text-dark-heading)",
    ctaStyle: "brand",
    darkHero: true,
    bgImage: "/service2_banner.png",
    rightPanel: {
      kind: "features",
      features: [
        { text: <>Bukara- und Fremdwerkzeuge</> },
        { text: <>Für HW-Messer, PCD-Werkzeuge &amp; Bohrer</> },
        { text: <>Bundesweite Abholung &amp; Rücksendung</> },
        { text: <>Rücklauf in 1 bis 2 Wochen</> },
        { text: <>Nachschliff, Reparatur &amp; Aufbereitung</> },
        { text: <>Keine Mindestmenge</> },
      ],
    },
  },
];

export default function BannerSonderwerkzeuge({ only }: { only?: SlideId } = {}) {
  const shownSlides = only ? slides.filter((s) => s.id === only) : slides;
  const total = shownSlides.length;
  const showControls = total > 1;

  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);

  const goTo = (index: number) => {
    setVisible(false);
    setTimeout(() => {
      setActive(index);
      setVisible(true);
    }, 180);
  };

  const prev = () => goTo((active - 1 + total) % total);
  const next = () => goTo((active + 1) % total);

  const slide = shownSlides[active] ?? shownSlides[0];
  if (!slide) return null;

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-6">
      <div
        style={{
          background: slide.bgColor,
          opacity: visible ? 1 : 0,
          border: slide.darkHero ? "1px solid var(--color-border-dark)" : "none",
        }}
        className={`relative w-full h-auto md:h-[360px] rounded-md overflow-hidden grid grid-cols-1 md:grid-cols-2 transition-opacity duration-200 ${
          slide.darkHero ? "" : "shadow-[0_18px_50px_-20px_rgba(46,26,64,0.28)]"
        }`}
      >
        {slide.darkHero && slide.bgImage && (
          <>
            {/* Full-bleed background photo, anchored right */}
            <div className="absolute inset-0 z-0">
              <Image
                src={slide.bgImage}
                alt=""
                fill
                aria-hidden
                className="object-cover object-[70%_center]"
                style={{ filter: "saturate(0.95)" }}
              />
            </div>
            {/* Partial multiply of the brand teal — tints the photo toward
                teal-black and knocks the highlights back so it reads on-brand,
                but at 0.55 opacity the image stays clearly visible. */}
            <div
              className="absolute inset-0 z-0"
              style={{ backgroundColor: "var(--color-brand-800)", mixBlendMode: "multiply", opacity: 0.55 }}
            />
            {/* Horizontal gradient: fully solid on the left for text, easing
                to a light floor on the right so the photo shows through. */}
            <div
              className="absolute inset-0 z-0"
              style={{
                background:
                  "linear-gradient(90deg, #041A19 0%, #041A19 46%, rgba(4,26,25,0.62) 72%, rgba(4,26,25,0.35) 100%)",
              }}
            />
          </>
        )}
        {slide.darkHero && !slide.bgImage && <BannerAurora />}

        {/* LEFT COLUMN */}
        <div className="relative z-10 flex flex-col justify-center px-6 py-8 md:px-14 md:py-10 md:pr-9">
          {slide.eyebrow && (
            <p className="eyebrow eyebrow--on-dark mb-3">{slide.eyebrow}</p>
          )}
          <h2
            style={{ color: slide.textColor }}
            className={`m-0 ${slide.darkHero ? "heading-l" : "heading-xl"}`}
          >
            {slide.headline}{" "}
            {slide.highlightColor ? (
              <span
                className="inline"
                style={{
                  backgroundImage: `linear-gradient(180deg,${slide.highlightColor} 0%,${slide.highlightColor} 100%)`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "100% 32%",
                  backgroundPosition: "0 80%",
                }}
              >
                {slide.highlight}
              </span>
            ) : (
              slide.highlight
            )}
          </h2>

          <p
            className={`mt-4 max-w-[420px] text-base leading-relaxed ${
              slide.darkHero ? "body-text body-text--on-dark" : "font-medium opacity-80"
            }`}
            style={slide.darkHero ? undefined : { color: slide.textColor }}
          >
            {slide.subline}
          </p>

          <div className="mt-6">
            <Link
              href={slide.ctaHref}
              className={
                slide.darkHero
                  ? "btn-white btn-arrow no-underline"
                  : slide.ctaStyle === "white"
                  ? "inline-block whitespace-nowrap bg-white text-[#0F172A] text-sm font-bold tracking-wide px-6 py-3.5 rounded-sm no-underline transition-colors duration-150 hover:bg-gray-100"
                  : slide.ctaStyle === "brand"
                  ? "btn-brand no-underline"
                  : "inline-block whitespace-nowrap bg-[#0F172A] text-white text-sm font-bold tracking-wide px-6 py-3.5 rounded-sm no-underline transition-colors duration-150 hover:bg-[#1e293b]"
              }
            >
              {slide.ctaLabel}
              {slide.darkHero && <CtaArrow />}
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN — photo slides indent the checklist a bit further in */}
        <div className={`relative z-10 hidden md:flex items-center py-9 ${slide.bgImage ? "pr-14 pl-[78px]" : "pr-14 pl-5"}`}>
          {slide.rightPanel.kind === "features" ? (
            <div className="checklist checklist--on-dark w-full">
              {slide.rightPanel.features.map((f, i) => (
                <div key={i} className="checklist-item">
                  <span className="checklist-badge"><Check className="w-3 h-3" strokeWidth={3} /></span>
                  {f.text}
                </div>
              ))}
            </div>
          ) : (
            <div className="relative w-full h-full rounded-xl overflow-hidden">
              <Image
                src={slide.rightPanel.src}
                alt={slide.rightPanel.alt}
                fill
                className="object-cover object-center"
              />
            </div>
          )}
        </div>
      </div>

      {/* CONTROLS — dots left, arrows right, below the card (hidden for single-slide banners) */}
      {showControls && (
      <div className="flex items-center justify-between mt-4">
        <div role="tablist" aria-label="Carousel slides" className="flex items-center gap-2.5">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === active}
              aria-label={`Slide ${i + 1}`}
              onClick={() => goTo(i)}
              className="p-0 appearance-none cursor-pointer w-[9px] h-[9px] rounded-full transition-colors"
              style={{
                background: i === active ? "#0F172A" : "transparent",
                border: i === active ? "none" : "1.5px solid #0F172A",
                opacity: i === active ? 1 : 0.45,
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <NavBtn aria-label="Vorherige Folie" onClick={prev}>
            <ChevronLeft size={18} strokeWidth={2} className="text-white" />
          </NavBtn>
          <NavBtn aria-label="Nächste Folie" onClick={next}>
            <ChevronRight size={18} strokeWidth={2} className="text-white" />
          </NavBtn>
        </div>
      </div>
      )}
    </section>
  );
}

function NavBtn({
  children,
  onClick,
  "aria-label": label,
}: {
  children: ReactNode;
  onClick: () => void;
  "aria-label": string;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="appearance-none border-none cursor-pointer w-10 h-10 rounded-full bg-[#0F172A] flex items-center justify-center transition-colors duration-150 hover:bg-[#1e293b]"
    >
      {children}
    </button>
  );
}
