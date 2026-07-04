"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import BannerAurora from "./BannerAurora";
import HeroWaveAnimation from "./HeroWaveAnimation";
import CtaArrow from "./CtaArrow";

// Run before paint on the client (so the pre-animation state is set with no
// flash), fall back to useEffect on the server render.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
  /** Background for an aurora-hero slide. "grid" (default) = technical-drawing
   *  grid via BannerAurora (Sonderwerkzeuge); "petals" = the flowing ribbon
   *  petals canvas via HeroWaveAnimation (Schärfservice). */
  bgPattern?: "grid" | "petals";
  rightPanel: RightPanel;
};

const slides: Slide[] = [
  {
    id: "x99",
    headline: "X99 NeXcut VHW Highspeedfräser",
    highlight: "",
    subline:
      "Entdecken Sie Erweiterungsangebote die speziell auf den X99 NeXcut abgestimmt sind – Ab 55,72 €",
    ctaLabel: "Angebote entdecken",
    ctaHref: "/angebote",
    // Dark aurora-hero treatment: deep brand-950 surface, white text and a
    // white CTA (matching Schärfservice); the product image sits full-bleed
    // on the right.
    bgColor: "var(--color-brand-950)",
    textColor: "var(--color-text-dark-heading)",
    ctaStyle: "brand",
    darkHero: true,
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
    // Light-mode sibling: airy pale brand-teal gradient (brand-25 → brand-50
    // → brand-100) with the aurora glow + technical grid, ink text and a
    // brand CTA.
    bgColor: "linear-gradient(105deg, #F5FAFA 0%, #EAF5F4 48%, #D6EBE9 100%)",
    textColor: "var(--color-ink)",
    ctaStyle: "brand",
    darkHero: true,
    heroMode: "light",
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
      "Nachschliff für alle Bukara und Fremdwerkzeuge – Keine Mindestmenge, schnell, deutschlandweit.",
    ctaLabel: "Schärfauftrag starten",
    ctaHref: "/sonder-schaerfservice",
    // Dark scheme: deep diagonal brand-teal gradient (brand-800 → brand-950)
    // with the aurora glow + technical grid, white text and a white CTA.
    bgColor: "linear-gradient(105deg, #074843 0%, #062F2C 48%, #05211F 100%)",
    textColor: "var(--color-text-dark-heading)",
    ctaStyle: "brand",
    darkHero: true,
    bgPattern: "petals",
    rightPanel: {
      kind: "stepper",
      steps: [
        { title: "Online-Formular ausfüllen", sub: "In nur 2 Minuten Werkzeugdetails angeben" },
        { title: "Gratis Abholung", sub: "Deutschlandweiter Abholservice" },
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

  const cardRef = useRef<HTMLDivElement>(null);

  // First-in-viewport entrance animation (once per page load). Left-column
  // items stagger in; the checklist staggers; the stepper fills each circle
  // then draws its connector line in sequence. Respects reduced motion.
  useIsomorphicLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const revealItems = gsap.utils.toArray<HTMLElement>(".reveal-item", card);
    const checkItems = gsap.utils.toArray<HTMLElement>(".checklist-item", card);
    const stepNums = gsap.utils.toArray<HTMLElement>(".banner-step-num", card);
    const stepLines = gsap.utils.toArray<HTMLElement>(".banner-step-line", card);

    // Pre-animation state (set immediately so there's no flash before reveal).
    gsap.set(revealItems, { autoAlpha: 0, y: 12 });
    gsap.set(checkItems, { autoAlpha: 0, y: 8 });
    gsap.set(stepNums, {
      backgroundColor: "rgba(39,216,202,0.06)",
      borderColor: "#27D8CA",
      color: "#ffffff",
    });
    gsap.set(stepLines, { scaleY: 0 });

    let tl: gsap.core.Timeline | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry || !entry.isIntersecting) return;
        observer.disconnect();

        tl = gsap.timeline({ defaults: { ease: "power2.out" } });
        tl.to(revealItems, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.7 });
        if (checkItems.length) {
          tl.to(checkItems, { autoAlpha: 1, y: 0, stagger: 0.13, duration: 0.6 }, "-=0.25");
        }
        // Stepper: fill circle → draw line → next, in order.
        stepNums.forEach((num, i) => {
          tl!.to(
            num,
            { backgroundColor: "#ffffff", borderColor: "#ffffff", color: "#05211F", duration: 0.5 },
            i === 0 ? "-=0.1" : "-=0.05"
          );
          if (stepLines[i]) {
            tl!.to(stepLines[i], { scaleY: 1, duration: 0.6 }, "-=0.05");
          }
        });
      },
      { threshold: 0.35 }
    );
    observer.observe(card);

    return () => {
      observer.disconnect();
      tl?.kill();
    };
  }, []);

  const slide = shownSlides[active] ?? shownSlides[0];
  if (!slide) return null;

  const isLight = slide.heroMode === "light";

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-6">
      <div
        ref={cardRef}
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
        {slide.darkHero && slide.bgPattern === "petals" ? (
          <div className="banner-petals">
            <HeroWaveAnimation />
          </div>
        ) : (
          slide.darkHero && slide.rightPanel.kind !== "image" && <BannerAurora light={isLight} />
        )}
        {slide.darkHero && slide.bgPattern === "petals" && (
          <div className="banner-petals-scrim" />
        )}

        {/* LEFT COLUMN */}
        <div className="relative z-10 flex flex-col justify-center px-6 py-8 md:px-14 md:py-10 md:pr-9">
          {slide.eyebrow && (
            <p className={`reveal-item eyebrow ${isLight ? "eyebrow--brand" : "eyebrow--on-dark"} mb-3`}>{slide.eyebrow}</p>
          )}
          <h2
            style={{ color: slide.textColor }}
            className={`reveal-item m-0 ${slide.darkHero ? "heading-l" : "heading-xl"}`}
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
            className={`reveal-item mt-4 max-w-[420px] text-base leading-relaxed ${
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

          <div className="reveal-item mt-6">
            <Link
              href={slide.ctaHref}
              className={
                slide.darkHero
                  ? isLight
                    ? "btn-brand btn-arrow no-underline"
                    : "btn-white btn-arrow no-underline"
                  : slide.ctaStyle === "white"
                  ? "inline-block whitespace-nowrap bg-white text-[var(--color-ink)] text-sm font-bold tracking-wide px-6 py-3.5 rounded-sm no-underline transition-colors duration-150 hover:bg-neutral-100"
                  : slide.ctaStyle === "brand"
                  ? "btn-brand no-underline"
                  : "inline-block whitespace-nowrap bg-[var(--color-ink)] text-white text-sm font-bold tracking-wide px-6 py-3.5 rounded-sm no-underline transition-colors duration-150 hover:bg-[var(--color-brand-900)]"
              }
            >
              {slide.ctaLabel}
              {slide.darkHero && <CtaArrow />}
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        {slide.rightPanel.kind === "image" ? (
          // Full-bleed product image: fills the grid cell edge-to-edge so it
          // touches the top, right and bottom of the banner.
          <div className="relative z-10 hidden md:block h-full overflow-hidden">
            <Image
              src={slide.rightPanel.src}
              alt={slide.rightPanel.alt}
              fill
              className="object-cover object-center"
              sizes="50vw"
            />
          </div>
        ) : (
          // dark-hero slides indent the panel a bit further in
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
            ) : (
              <div className={`banner-stepper ${isLight ? "banner-stepper--light" : ""} w-full`}>
                {slide.rightPanel.steps.map((s, i, arr) => (
                  <div key={i} className="banner-step">
                    <span className="banner-step-num">{i + 1}</span>
                    {i < arr.length - 1 && (
                      <span className="banner-step-line" aria-hidden />
                    )}
                    <div className="banner-step-body">
                      <div className="banner-step-title">{s.title}</div>
                      <div className="banner-step-sub">{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
                background: i === active ? "var(--color-ink)" : "transparent",
                border: i === active ? "none" : "1.5px solid var(--color-ink)",
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
      className="appearance-none border-none cursor-pointer w-10 h-10 rounded-full bg-[var(--color-ink)] flex items-center justify-center transition-colors duration-150 hover:bg-[var(--color-brand-900)]"
    >
      {children}
    </button>
  );
}
