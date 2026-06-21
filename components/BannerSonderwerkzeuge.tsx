"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PenLine,
  PackageOpen,
  Layers,
  BarChart2,
  MessageCircle,
  Award,
  Wrench,
  Scissors,
  Truck,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Feature = { icon: ReactNode; text: ReactNode };

type RightPanel =
  | { kind: "features"; features: Feature[] }
  | { kind: "image"; src: string; alt: string };

type Slide = {
  headline: string;
  highlight: string;
  subline: string;
  ctaLabel: string;
  ctaHref: string;
  bgColor: string;
  textColor: string;
  ctaStyle: "dark" | "white";
  rightPanel: RightPanel;
};

const slides: Slide[] = [
  {
    headline: "Sonderwerkzeuge,",
    highlight: "geplant für Ihre Maschine",
    subline:
      "Wir definieren gemeinsam mit Ihnen Ihren vollständigen Werkzeugbedarf – gestützt auf jahrzehntelange Erfahrung.",
    ctaLabel: "Sonderwerkzeug anfragen",
    ctaHref: "/loesungen/sonderwerkzeug",
    bgColor: "#8fdbd6",
    textColor: "#0F172A",
    ctaStyle: "dark",
    rightPanel: {
      kind: "features",
      features: [
        {
          icon: <PenLine size={22} strokeWidth={1.5} className="shrink-0 text-[#0F172A]" />,
          text: <><strong>Nach Ihrer Zeichnung</strong> oder Spezifikation gefertigt</>,
        },
        {
          icon: <PackageOpen size={22} strokeWidth={1.5} className="shrink-0 text-[#0F172A]" />,
          text: <><strong>Keine Mindestbestellmenge</strong></>,
        },
        {
          icon: <Layers size={22} strokeWidth={1.5} className="shrink-0 text-[#0F172A]" />,
          text: <><strong>Alle gängigen Materialien</strong></>,
        },
        {
          icon: <BarChart2 size={22} strokeWidth={1.5} className="shrink-0 text-[#0F172A]" />,
          text: <><strong>Klein- und Großserien</strong></>,
        },
        {
          icon: <MessageCircle size={22} strokeWidth={1.5} className="shrink-0 text-[#0F172A]" />,
          text: <><strong>Technische Beratung</strong> inklusive</>,
        },
        {
          icon: <Award size={22} strokeWidth={1.5} className="shrink-0 text-[#0F172A]" />,
          text: <><strong>Jahrzehntelange</strong> Werkzeug-Expertise</>,
        },
      ],
    },
  },
  {
    headline: "Nachschliff,",
    highlight: "der Standzeit verlängert",
    subline:
      "Nachschliff für HW-Messer, PCD-Werkzeuge und Bohrer – präzise, schnell, bundesweit.",
    ctaLabel: "Schärfauftrag starten",
    ctaHref: "/sonder-schaerfservice",
    bgColor: "#8fdbd6",
    textColor: "#0F172A",
    ctaStyle: "dark",
    rightPanel: {
      kind: "features",
      features: [
        {
          icon: <Wrench size={22} strokeWidth={1.5} className="shrink-0 text-[#0F172A]" />,
          text: <><strong>Bukara</strong>- und Fremdwerkzeuge</>,
        },
        {
          icon: <Scissors size={22} strokeWidth={1.5} className="shrink-0 text-[#0F172A]" />,
          text: <>Für <strong>HW-Messer</strong>, PCD-Werkzeuge & Bohrer</>,
        },
        {
          icon: <Truck size={22} strokeWidth={1.5} className="shrink-0 text-[#0F172A]" />,
          text: <><strong>Bundesweite</strong> Abholung & Rücksendung</>,
        },
        {
          icon: <Clock size={22} strokeWidth={1.5} className="shrink-0 text-[#0F172A]" />,
          text: <>Rücklauf in <strong>1 bis 2 Wochen</strong></>,
        },
        {
          icon: <RefreshCw size={22} strokeWidth={1.5} className="shrink-0 text-[#0F172A]" />,
          text: <><strong>Nachschliff</strong>, Reparatur & Aufbereitung</>,
        },
        {
          icon: <PackageOpen size={22} strokeWidth={1.5} className="shrink-0 text-[#0F172A]" />,
          text: <><strong>Keine</strong> Mindestmenge</>,
        },
      ],
    },
  },
  {
    headline: "-30% auf den neuen",
    highlight: "X99 NeXcut VHW Highspeedfräser",
    subline:
      "Jetzt bis 31. August auch im Set sparen. Entdecken Sie Erweiterungsangebote die speziell auf den X99 NeXcut abgestimmt sind.",
    ctaLabel: "Angebote entdecken",
    ctaHref: "/angebote",
    bgColor: "#000000",
    textColor: "#ffffff",
    ctaStyle: "white",
    rightPanel: {
      kind: "image",
      src: "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/products/angebote/nur-x99/x-99-deal.png",
      alt: "X99 NeXcut VHW Highspeedfräser",
    },
  },
];

const TOTAL_SLIDES = 3;

export default function BannerSonderwerkzeuge() {
  const [active, setActive] = useState(0);

  const prev = () => setActive((a) => (a - 1 + TOTAL_SLIDES) % TOTAL_SLIDES);
  const next = () => setActive((a) => (a + 1) % TOTAL_SLIDES);

  const slide = slides[active];

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-6">
      <div
        style={{ background: slide.bgColor }}
        className="w-full h-[360px] rounded-2xl overflow-hidden grid grid-cols-2 shadow-[0_18px_50px_-20px_rgba(46,26,64,0.28)]"
      >
        {/* LEFT COLUMN */}
        <div className="flex flex-col justify-center px-14 py-10 pr-9">
          <h2
            style={{ color: slide.textColor }}
            className="text-4xl font-extrabold leading-tight tracking-tight m-0"
          >
            {slide.headline}{" "}
            {slide.highlight}
          </h2>

          <p
            style={{ color: slide.textColor }}
            className="mt-4 max-w-[420px] text-base leading-relaxed font-medium opacity-80"
          >
            {slide.subline}
          </p>

          <div className="mt-6">
            <Link
              href={slide.ctaHref}
              className={
                slide.ctaStyle === "white"
                  ? "inline-block whitespace-nowrap bg-white text-[#0F172A] text-sm font-bold tracking-wide px-6 py-3.5 rounded-sm no-underline transition-colors duration-150 hover:bg-gray-100"
                  : "inline-block whitespace-nowrap bg-[#0F172A] text-white text-sm font-bold tracking-wide px-6 py-3.5 rounded-sm no-underline transition-colors duration-150 hover:bg-[#1e293b]"
              }
            >
              {slide.ctaLabel}
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex items-center pr-14 pl-5 py-9">
          {slide.rightPanel.kind === "features" ? (
            <div className="w-full bg-white rounded-xl shadow-[0_14px_36px_-16px_rgba(46,26,64,0.26)] px-[30px] py-[26px] flex flex-col gap-4">
              {slide.rightPanel.features.map((f, i) => (
                <div key={i} className="flex items-center gap-4">
                  {f.icon}
                  <span className="text-[#0F172A] text-[15px] leading-snug">{f.text}</span>
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

      {/* CONTROLS — dots left, arrows right, below the card */}
      <div className="flex items-center justify-between mt-4">
        <div role="tablist" aria-label="Carousel slides" className="flex items-center gap-2.5">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === active}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setActive(i)}
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
