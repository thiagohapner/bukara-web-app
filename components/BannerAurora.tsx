"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Ambient animated background for the Sonderlösungen dark-hero banner — a
// coherent glow cluster on the LEFT (behind the headline), in the spirit of
// stripe.com's aurora backgrounds. Kept off the right side so it never sits
// behind the checklist and hurts legibility. Atmosphere only (see
// DESIGN_SYSTEM.md §5): monochrome brand teal on the deep-teal surface.

const BLOBS = [
  // Primary bright core, upper-left behind the headline.
  { grad: "var(--grad-aura-brand-core)", size: 460, top: "-26%", left: "2%" },
  // Cooler mid glow just below/left, for depth.
  { grad: "var(--grad-aura-brand-2)", size: 360, top: "38%", left: "-12%" },
  // Faint accent drifting toward center — never past the midline.
  { grad: "var(--grad-aura-brand-3)", size: 300, top: "60%", left: "22%" },
];

export default function BannerAurora() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const blobs = gsap.utils.toArray<HTMLDivElement>(".banner-aurora__blob", root);
    if (!blobs.length) return;

    // Respect reduced motion — skip the drift but keep the static glow.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
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
    </div>
  );
}
