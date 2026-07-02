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

// Teal ramp with brighter mint accents for visible color movement. Each orb
// gets a large per-orb travel/scale range so the flow is clearly perceptible.
type OrbSpec = Orb & { toX: number; toY: number; toScale: number; toA: number; dur: number };
const makeOrbs = (): OrbSpec[] => [
  { x: 0.72, y: 0.4,  r: 0.4,  color: "1,164,151",   alpha: 0.55, dx: 0, dy: 0, scale: 1, a: 0.55, toX: 260,  toY: -120, toScale: 1.35, toA: 0.7,  dur: 8 },
  { x: 0.98, y: 0.2,  r: 0.46, color: "4,133,123",   alpha: 0.5,  dx: 0, dy: 0, scale: 1, a: 0.5,  toX: -200, toY: 140,  toScale: 1.3,  toA: 0.62, dur: 10 },
  { x: 0.66, y: 0.78, r: 0.36, color: "39,216,202",  alpha: 0.42, dx: 0, dy: 0, scale: 1, a: 0.42, toX: 230,  toY: -160, toScale: 1.4,  toA: 0.6,  dur: 9 },
  { x: 1.05, y: 0.62, r: 0.42, color: "1,164,151",   alpha: 0.5,  dx: 0, dy: 0, scale: 1, a: 0.5,  toX: -260, toY: -90,  toScale: 1.25, toA: 0.66, dur: 11 },
  { x: 0.6,  y: 0.15, r: 0.3,  color: "132,205,199", alpha: 0.36, dx: 0, dy: 0, scale: 1, a: 0.36, toX: 180,  toY: 180,  toScale: 1.45, toA: 0.55, dur: 7.5 },
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
        gsap.to(o, {
          dx: o.toX,
          dy: o.toY,
          scale: o.toScale,
          a: o.toA,
          duration: o.dur,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.6,
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
