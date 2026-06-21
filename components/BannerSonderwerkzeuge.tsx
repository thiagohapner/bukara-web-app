"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  PenLine,
  PackageOpen,
  Layers,
  BarChart2,
  MessageCircle,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ACCENT = "#2E1A40";

type Feature = { icon: ReactNode; text: ReactNode };

const features: Feature[] = [
  {
    icon: <PenLine size={22} color={ACCENT} strokeWidth={1.5} style={{ flex: "none" }} />,
    text: <><strong>Nach Ihrer Zeichnung</strong> oder Spezifikation gefertigt</>,
  },
  {
    icon: <PackageOpen size={22} color={ACCENT} strokeWidth={1.5} style={{ flex: "none" }} />,
    text: <><strong>Keine Mindestbestellmenge</strong></>,
  },
  {
    icon: <Layers size={22} color={ACCENT} strokeWidth={1.5} style={{ flex: "none" }} />,
    text: <><strong>Alle gängigen Materialien</strong></>,
  },
  {
    icon: <BarChart2 size={22} color={ACCENT} strokeWidth={1.5} style={{ flex: "none" }} />,
    text: <><strong>Klein- und Großserien</strong></>,
  },
  {
    icon: <MessageCircle size={22} color={ACCENT} strokeWidth={1.5} style={{ flex: "none" }} />,
    text: <><strong>Technische Beratung</strong> inklusive</>,
  },
  {
    icon: <Award size={22} color={ACCENT} strokeWidth={1.5} style={{ flex: "none" }} />,
    text: <><strong>Jahrzehntelange</strong> Werkzeug-Expertise</>,
  },
];

const TOTAL_SLIDES = 5;

export default function BannerSonderwerkzeuge() {
  const [active, setActive] = useState(0);

  const prev = () => setActive((a) => (a - 1 + TOTAL_SLIDES) % TOTAL_SLIDES);
  const next = () => setActive((a) => (a + 1) % TOTAL_SLIDES);

  return (
    <section
      style={{
        background: "#F4F3F9",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "56px 56px 32px",
        overflow: "auto",
        fontFamily: "var(--font-mulish), sans-serif",
      }}
    >
      {/* Fixed 1180×492 banner card */}
      <div
        style={{
          flex: "none",
          width: "1180px",
          height: "492px",
          background: "#ECE5DA",
          borderRadius: "16px",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          boxShadow: "0 18px 50px -20px rgba(46,26,64,0.28)",
        }}
      >
        {/* LEFT COLUMN */}
        <div
          style={{
            padding: "40px 36px 52px 56px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-playfair), serif",
              color: ACCENT,
              fontSize: "42px",
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              fontWeight: 600,
            }}
          >
            <span style={{ display: "block", fontStyle: "normal" }}>Individuelle Werkzeuge,</span>
            <span
              style={{
                display: "inline",
                fontStyle: "italic",
                fontWeight: 600,
                backgroundImage: "linear-gradient(180deg, #D2F25E 0%, #D2F25E 100%)",
                backgroundRepeat: "no-repeat",
                backgroundSize: "100% 44%",
                backgroundPosition: "0 80%",
                padding: "0 2px",
              }}
            >
              geplant für Ihre Maschine
            </span>
          </h2>

          <p
            style={{
              margin: "18px 0 0",
              maxWidth: "420px",
              color: ACCENT,
              fontSize: "16px",
              lineHeight: 1.5,
              fontWeight: 500,
              opacity: 0.86,
            }}
          >
            Wir definieren gemeinsam mit Ihnen Ihren vollständigen Werkzeugbedarf – gestützt auf jahrzehntelange Erfahrung.
          </p>

          <div style={{ marginTop: "24px" }}>
            <Link
              href="/loesungen/sonderwerkzeug"
              style={{
                display: "inline-block",
                whiteSpace: "nowrap",
                background: ACCENT,
                color: "#ffffff",
                fontFamily: "var(--font-mulish), sans-serif",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.01em",
                padding: "13px 24px",
                borderRadius: "4px",
                textDecoration: "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#3d2456")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = ACCENT)}
            >
              Sonderwerkzeug anfragen
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN — floating white feature card */}
        <div
          style={{
            padding: "36px 56px 36px 20px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              background: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 14px 36px -16px rgba(46,26,64,0.26)",
              padding: "26px 30px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {f.icon}
                <span style={{ color: ACCENT, fontSize: "15px", lineHeight: 1.3 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTROLS — dots left, arrows right, below the card */}
      <div
        style={{
          width: "1180px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        {/* Pagination dots */}
        <div
          role="tablist"
          aria-label="Carousel slides"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === active}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setActive(i)}
              style={{
                appearance: "none",
                border: i === active ? "none" : `1.5px solid ${ACCENT}`,
                cursor: "pointer",
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                background: i === active ? ACCENT : "transparent",
                opacity: i === active ? 1 : 0.45,
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Prev / Next buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <NavBtn aria-label="Vorherige Folie" onClick={prev}>
            <ChevronLeft size={18} color="#ffffff" strokeWidth={2} />
          </NavBtn>
          <NavBtn aria-label="Nächste Folie" onClick={next}>
            <ChevronRight size={18} color="#ffffff" strokeWidth={2} />
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
      style={{
        appearance: "none",
        border: "none",
        cursor: "pointer",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: ACCENT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#3d2456")}
      onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
    >
      {children}
    </button>
  );
}
