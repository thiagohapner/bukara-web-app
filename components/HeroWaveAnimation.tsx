"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Soft flowing-gradient background — a Stripe-hero-style color flow adapted to
// the Bukara teal ramp (see DESIGN_SYSTEM.md §5). Several large radial-gradient
// orbs drift, scale and fade on a seamless GSAP loop, screen-blended so they
// melt into one another; a heavy CSS blur turns them into smooth silky color
// flow with no hard edges. Canvas 2D only; GSAP drives all values. Clustered
// in the right ~60%; the left fade + stepper scrim live in CSS.

type Orb = {
  x: number; y: number; // base center, normalized 0–1
  r: number; // radius, fraction of canvas width
  color: string; // center color (rgb); alpha comes from `alpha`
  alpha: number;
  // Animation state, mutated by GSAP each frame.
  dx: number; dy: number; scale: number; a: number;
};

// Teal ramp with a couple of brighter mint accents for visible color movement.
const makeOrbs = (): Orb[] => [
  { x: 0.78, y: 0.35, r: 0.42, color: "1,164,151",  alpha: 0.55, dx: 0, dy: 0, scale: 1, a: 0.55 },
  { x: 0.95, y: 0.15, r: 0.5,  color: "4,133,123",  alpha: 0.5,  dx: 0, dy: 0, scale: 1, a: 0.5 },
  { x: 0.7,  y: 0.75, r: 0.38, color: "39,216,202", alpha: 0.42, dx: 0, dy: 0, scale: 1, a: 0.42 },
  { x: 1.02, y: 0.6,  r: 0.44, color: "1,164,151",  alpha: 0.5,  dx: 0, dy: 0, scale: 1, a: 0.5 },
  { x: 0.62, y: 0.2,  r: 0.3,  color: "132,205,199", alpha: 0.34, dx: 0, dy: 0, scale: 1, a: 0.34 },
  { x: 0.85, y: 0.9,  r: 0.34, color: "7,100,93",   alpha: 0.45, dx: 0, dy: 0, scale: 1, a: 0.45 },
];

export default function HeroWaveAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const orbs = makeOrbs();
    let w = 0;
    let h = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "screen";
      for (const o of orbs) {
        const cx = o.x * w + o.dx;
        const cy = o.y * h + o.dy;
        const rad = o.r * w * o.scale;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, `rgba(${o.color},${o.a})`);
        g.addColorStop(1, `rgba(${o.color},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    resize();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ro = new ResizeObserver(() => {
      resize();
      render();
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    if (reduced) {
      render();
      return () => ro.disconnect();
    }

    const ctxGsap = gsap.context(() => {
      orbs.forEach((o, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        gsap.to(o, {
          dx: dir * (40 + i * 12),
          dy: -dir * (24 + i * 8),
          scale: 1.18,
          a: Math.min(0.8, o.alpha + 0.12),
          duration: 12 + i * 2.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.9,
        });
      });
    });

    gsap.ticker.add(render);

    return () => {
      gsap.ticker.remove(render);
      ctxGsap.revert();
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="banner-petals__canvas" aria-hidden />;
}
