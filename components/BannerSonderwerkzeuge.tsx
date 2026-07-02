"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import BannerAurora from "./BannerAurora";
import CtaArrow from "./CtaArrow";

type Feature = { text: ReactNode };
type Step = { title: string; sub: string };

type RightPanel =
  | { kind: "features"; features: Feature[] }
  | { kind: "stepper"; steps: Step[] }
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
  /** Aurora-hero treatment: brand-teal gradient surface, aurora glow +
   *  technical grid, big headline, body + CTA, and a right panel (checklist
   *  or stepper). (X99 slide leaves this off and keeps its own dark-image look.) */
  darkHero?: boolean;
  /** Colour theme for an aurora-hero slide. "dark" (default) = deep-teal
   *  surface, light text, white CTA, on-dark panel. "light" = pale brand-teal
   *  surface, ink text, brand CTA, dark-on-light grid + light panel. */
  heroMode?: "light" | "dark";
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
    headline: "Sonderlösungen,",
    highlight: "geplant für Ihre Maschine",
    subline:
      "Wir definieren gemeinsam mit Ihnen Ihren vollständigen Werkzeugbedarf.",
    ctaLabel: "Sonderwerkzeug anfragen",
    ctaHref: "/sonder-werkzeug",
    // Distinct-but-related scheme vs Schärfservice (flat near-black + photo):
    // a diagonal brand-teal gradient (brand-800 → brand-950), lighter/greener
    // in the headline area, deep on the right so the checklist stays legible.
    bgColor: "linear-gradient(105deg, #074843 0%, #062F2C 48%, #05211F 100%)",
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
    // Light-mode sibling of the dark Sonderlösungen banner: airy pale
    // brand-teal gradient (brand-25 → brand-50 → brand-100) with the same
    // aurora glow + technical grid, ink text and a brand CTA.
    bgColor: "linear-gradient(105deg, #F5FAFA 0%, #EAF5F4 48%, #D6EBE9 100%)",
    textColor: "var(--color-ink)",
    ctaStyle: "brand",
    darkHero: true,
    heroMode: "light",
    rightPanel: {
      kind: "stepper",
      steps: [
        { title: "Formular ausfüllen", sub: "In 2 Minuten online – Werkzeug & Menge angeben" },
        { title: "Abholung", sub: "Gratis und deutschlandweit" },
        { title: "Fertig in 1–2 Wochen", sub: "Geschärft & geprüft zurück bei Ihnen" },
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

  const isLight = slide.heroMode === "light";

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-6">
      <div
        style={{
          background: slide.bgColor,
          opacity: visible ? 1 : 0,
          border: slide.darkHero
            ? isLight
              ? "1px solid var(--color-brand-100)"
              : "1px solid var(--color-border-dark)"
            : "none",
        }}
        className="relative w-full h-auto md:h-[360px] rounded-md overflow-hidden grid grid-cols-1 md:grid-cols-2 transition-opacity duration-200"
      >
        {slide.darkHero && <BannerAurora light={isLight} />}

        {/* LEFT COLUMN */}
        <div className="relative z-10 flex flex-col justify-center px-6 py-8 md:px-14 md:py-10 md:pr-9">
          {slide.eyebrow && (
            <p className={`eyebrow ${isLight ? "eyebrow--brand" : "eyebrow--on-dark"} mb-3`}>{slide.eyebrow}</p>
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
              slide.darkHero
                ? isLight
                  ? "body-text body-text--subdued"
                  : "body-text body-text--on-dark"
                : "font-medium opacity-80"
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
                  ? isLight
                    ? "btn-brand btn-arrow no-underline"
                    : "btn-white btn-arrow no-underline"
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

        {/* RIGHT COLUMN — dark-hero slides indent the panel a bit further in */}
        <div className={`relative z-10 hidden md:flex items-center py-9 ${slide.darkHero ? "pr-14 pl-[108px]" : "pr-14 pl-5"}`}>
          {slide.rightPanel.kind === "features" ? (
            <div className={`checklist ${isLight ? "" : "checklist--on-dark"} w-full`}>
              {slide.rightPanel.features.map((f, i) => (
                <div key={i} className="checklist-item">
                  <span className="checklist-badge"><Check className="w-3 h-3" strokeWidth={3} /></span>
                  {f.text}
                </div>
              ))}
            </div>
          ) : slide.rightPanel.kind === "stepper" ? (
            <div className={`banner-stepper ${isLight ? "banner-stepper--light" : ""} w-full`}>
              {slide.rightPanel.steps.map((s, i) => (
                <div key={i} className="banner-step">
                  <span className="banner-step-num">{i + 1}</span>
                  <div className="banner-step-body">
                    <div className="banner-step-title">{s.title}</div>
                    <div className="banner-step-sub">{s.sub}</div>
                  </div>
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
