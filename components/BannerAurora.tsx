"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Ambient animated background for the dark-hero promo banners — a single
// coherent glow cluster radiating from the top-right (a sense of one light
// source), in the spirit of stripe.com's aurora backgrounds. Atmosphere
// only (see DESIGN_SYSTEM.md §5): one cluster, monochrome brand teal, tuned
// to actually read against the deep-teal dark surface.

const BLOBS = [
  // Primary bright core, top-right behind the checklist.
  { grad: "var(--grad-aura-brand-core)", size: 460, top: "-24%", left: "58%" },
  // Cooler mid glow just below it, for depth.
  { grad: "var(--grad-aura-brand-2)", size: 360, top: "34%", left: "72%" },
  // Faint far-left wash so the cluster doesn't feel one-sided.
  { grad: "var(--grad-aura-brand-3)", size: 300, top: "58%", left: "-14%" },
];

export default function BannerAurora() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blobs = rootRef.current?.querySelectorAll<HTMLDivElement>(".banner-aurora__blob");
    if (!blobs || !blobs.length) return;

    const mm = gsap.matchMedia();
    mm.add(
      { reduce: "(prefers-reduced-motion: reduce)", move: "(prefers-reduced-motion: no-preference)" },
      (context) => {
        const { reduce } = context.conditions as { reduce: boolean };
        if (reduce) return;

        const ctx = gsap.context(() => {
          blobs.forEach((blob, i) => {
            gsap.to(blob, {
              x: i % 2 === 0 ? 36 : -32,
              y: i % 2 === 0 ? -24 : 28,
              scale: 1.12,
              duration: 9 + i * 2.5,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              delay: i * 0.6,
            });
          });
        }, rootRef);
        return () => ctx.revert();
      }
    );

    return () => mm.revert();
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
