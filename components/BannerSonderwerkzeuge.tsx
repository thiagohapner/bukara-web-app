"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";

const ACCENT = "#2E1A40";

type Feature = { icon: ReactNode; text: ReactNode };

const features: Feature[] = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
    text: <><strong>Made to your drawing</strong> or specification</>,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
        <rect x="3" y="14" width="18" height="6" rx="1" />
        <path d="M6 14V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5" />
        <line x1="4" y1="4" x2="20" y2="20" />
      </svg>
    ),
    text: <><strong>No minimum</strong> order quantity</>,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
        <path d="M21 7.5 12 2 3 7.5v9L12 22l9-5.5v-9Z" />
        <path d="m3 7.5 9 5.5 9-5.5" />
        <path d="M12 22V13" />
      </svg>
    ),
    text: <><strong>All common materials</strong></>,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
        <rect x="3" y="13" width="7" height="8" rx="1" />
        <rect x="14" y="9" width="7" height="12" rx="1" />
        <path d="M6.5 13V8.5" />
        <path d="M17.5 9V4.5" />
      </svg>
    ),
    text: <><strong>Small and large batches</strong></>,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
        <path d="M21 11.5a8.38 8.38 0 0 1-9 8.34L4 21l1.16-4A8.5 8.5 0 1 1 21 11.5Z" />
      </svg>
    ),
    text: <><strong>Technical consultation</strong> included</>,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
        <circle cx="12" cy="9" r="6" />
        <path d="M9 14.5 7.5 22 12 19.5 16.5 22 15 14.5" />
      </svg>
    ),
    text: <><strong>Decades</strong> of tooling experience</>,
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
        alignItems: "center",
        justifyContent: "safe center",
        padding: "56px",
        overflow: "auto",
        fontFamily: "var(--font-mulish), sans-serif",
      }}
    >
      {/* Fixed 1180×492 banner card — matches design dimensions exactly */}
      <div
        style={{
          flex: "none",
          width: "1180px",
          height: "492px",
          background: "#ECE5DA",
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
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
          <h1
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
            <span style={{ display: "block", fontStyle: "normal" }}>Custom tooling,</span>
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
              planned to your machine
            </span>
          </h1>

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
            We define your complete tooling scope together with you, backed by decades of hands-on experience.
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
              Request a custom tool
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

        {/* CAROUSEL CHROME — pagination dots */}
        <div
          role="tablist"
          aria-label="Carousel slides"
          style={{
            position: "absolute",
            left: "64px",
            bottom: "28px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
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

        {/* CAROUSEL CHROME — prev/next buttons */}
        <div
          style={{
            position: "absolute",
            right: "32px",
            bottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <NavBtn aria-label="Previous slide" onClick={prev}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </NavBtn>
          <NavBtn aria-label="Next slide" onClick={next}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </NavBtn>
        </div>
      </div>
    </section>
  );
}

function NavBtn({ children, onClick, "aria-label": label }: {
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
