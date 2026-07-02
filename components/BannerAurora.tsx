"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Ambient animated background for the aurora hero banners — a coherent glow
// cluster on the LEFT (behind the headline), in the spirit of stripe.com's
// aurora backgrounds. Kept off the right side so it never sits behind the
// right panel and hurts legibility. Atmosphere only (see DESIGN_SYSTEM.md
// §5): monochrome brand teal. Comes in dark (deep-teal surface) and light
// (pale-teal surface) variants; only the blob gradients + grid tint change.

const BLOBS_DARK = [
  // Primary bright core, upper-left behind the headline.
  { grad: "var(--grad-aura-brand-core)", size: 460, top: "-26%", left: "2%" },
  // Cooler mid glow just below/left, for depth.
  { grad: "var(--grad-aura-brand-2)", size: 360, top: "38%", left: "-12%" },
  // Faint accent drifting toward center — never past the midline.
  { grad: "var(--grad-aura-brand-3)", size: 300, top: "60%", left: "22%" },
];

// Light variant: soft teal blooms that tint (rather than light up) the pale
// surface — same positions, gentler saturated washes visible on brand-25.
const BLOBS_LIGHT = [
  { grad: "radial-gradient(50% 50%, rgba(1,164,151,0.20) 0%, rgba(1,164,151,0) 70%)", size: 460, top: "-26%", left: "2%" },
  { grad: "radial-gradient(50% 50%, rgba(39,216,202,0.16) 0%, rgba(39,216,202,0) 70%)", size: 360, top: "38%", left: "-12%" },
  { grad: "radial-gradient(50% 50%, rgba(4,133,123,0.14) 0%, rgba(4,133,123,0) 70%)", size: 300, top: "60%", left: "22%" },
];

export default function BannerAurora({ light = false }: { light?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const BLOBS = light ? BLOBS_LIGHT : BLOBS_DARK;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const blobs = gsap.utils.toArray<HTMLDivElement>(".banner-aurora__blob", root);
    if (!blobs.length) return;

    // Respect reduced motion — skip the drift/breath but keep the static
    // glow + grid (their base opacity is set in CSS).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Breathe the technical grid gently in and out of the banner BG.
      gsap.to(".banner-grid", {
        opacity: 0.3,
        duration: 5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      // Drift the blueprint grid diagonally — one 96px cell, looping
      // seamlessly (pattern repeats every 96/24px, so the reset is invisible).
      gsap.to(".banner-grid__lines", {
        x: 96,
        y: 96,
        duration: 28,
        ease: "none",
        repeat: -1,
      });

      // Slow light sweep: a soft band drifts across, pausing between passes.
      gsap.fromTo(
        ".banner-sweep",
        { xPercent: -160 },
        { xPercent: 160, duration: 7, ease: "power1.inOut", repeat: -1, repeatDelay: 5 }
      );

      blobs.forEach((blob, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        // xPercent/yPercent are relative to each blob's own (large) size, so
        // these read as a clearly visible, organic drift — not a 30px nudge.
        gsap.to(blob, {
          xPercent: dir * (14 + i * 5),
          yPercent: -dir * (10 + i * 4),
          scale: 1.28,
          opacity: 0.6,
          duration: 6 + i * 1.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.4,
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="banner-aurora" aria-hidden>
      {/* Technical-drawing grid — behind the glow blobs so they bloom over it.
          Masked/opacity-breathing wrapper + oversized panning lines layer. */}
      <div className={`banner-grid${light ? " banner-grid--light" : ""}`}>
        <div className="banner-grid__lines" />
      </div>
      {BLOBS.map((b, i) => (
        <div
          key={i}
          className="banner-aurora__blob"
          style={{
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
            background: b.grad,
          }}
        />
      ))}
      {/* Light sweep — travels across on top of the grid + glow (behind text). */}
      <div className={`banner-sweep${light ? " banner-sweep--light" : ""}`} />
    </div>
  );
}
