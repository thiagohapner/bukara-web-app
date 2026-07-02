"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// "Flowing ribbon petals" background — a Stripe-hero-style canvas animation
// adapted to the Bukara monochrome-teal palette (see DESIGN_SYSTEM.md §5).
// Each petal is a smooth tapered ribbon (two mirrored bezier edges) with a
// gradient fill + dense radial striations (silky sheen). Petals are drawn
// with a screen blend so overlaps glow, and drift/rotate/warp on a seamless
// GSAP loop. Canvas 2D only — GSAP drives all animation values. A CSS blur on
// the canvas melts the edges so it reads as silk, not glass.

type Petal = {
  // Base (narrow root) and tip, normalized 0–1 (scaled to canvas at draw).
  baseX: number; baseY: number;
  tipX: number; tipY: number;
  // Half-width of the ribbon at its widest, as a fraction of canvas width.
  width: number;
  // Asymmetry of the two edges (0 = symmetric leaf, >0 = one side bows more).
  bow: number;
  colorStart: string;
  colorEnd: string;
  striationCount: number;
  striationOpacity: number;
  // Animation state, mutated by GSAP each frame.
  rotation: number; // radians
  scale: number;
  warpY: number; // px
  opacity: number;
};

// Broad, graceful ribbons clustered in the right ~60%. Teal ramp only.
const makePetals = (): Petal[] => [
  {
    baseX: 0.6, baseY: 1.15, tipX: 0.72, tipY: -0.15, width: 0.16, bow: 0.35,
    colorStart: "#07645D", colorEnd: "#062F2C",
    striationCount: 170, striationOpacity: 0.09,
    rotation: 0, scale: 1, warpY: 0, opacity: 0.9,
  },
  {
    baseX: 0.7, baseY: 1.2, tipX: 0.86, tipY: 0.0, width: 0.19, bow: -0.3,
    colorStart: "#01A497", colorEnd: "#07645D",
    striationCount: 170, striationOpacity: 0.11,
    rotation: 0, scale: 1, warpY: 0, opacity: 0.85,
  },
  {
    baseX: 0.66, baseY: 1.1, tipX: 1.0, tipY: 0.2, width: 0.17, bow: 0.4,
    colorStart: "#27D8CA", colorEnd: "#01A497",
    striationCount: 160, striationOpacity: 0.13,
    rotation: 0, scale: 1, warpY: 0, opacity: 0.8,
  },
  {
    baseX: 0.82, baseY: 1.15, tipX: 1.05, tipY: -0.1, width: 0.2, bow: -0.35,
    colorStart: "#84CDC7", colorEnd: "#04857B",
    striationCount: 150, striationOpacity: 0.11,
    rotation: 0, scale: 1, warpY: 0, opacity: 0.72,
  },
  {
    baseX: 0.58, baseY: 1.2, tipX: 0.62, tipY: 0.05, width: 0.14, bow: 0.2,
    colorStart: "#B4DAD7", colorEnd: "#01A497",
    striationCount: 140, striationOpacity: 0.09,
    rotation: 0, scale: 1, warpY: 0, opacity: 0.6,
  },
];

export default function HeroWaveAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const petals = makePetals();
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

    const drawPetal = (p: Petal) => {
      const bx = p.baseX * w;
      const by = p.baseY * h;
      const tx = p.tipX * w;
      const ty = p.tipY * h;

      // Spine direction + perpendicular (for the ribbon's width).
      const dx = tx - bx;
      const dy = ty - by;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const hw = p.width * w;

      // Widen in the middle, taper to base + tip — a smooth leaf/ribbon.
      const eA1x = bx + dx * 0.28 + nx * hw * (1 + p.bow);
      const eA1y = by + dy * 0.28 + ny * hw * (1 + p.bow);
      const eA2x = bx + dx * 0.72 + nx * hw * (0.85 + p.bow * 0.5);
      const eA2y = by + dy * 0.72 + ny * hw * (0.85 + p.bow * 0.5);
      const eB1x = bx + dx * 0.72 - nx * hw * 0.85;
      const eB1y = by + dy * 0.72 - ny * hw * 0.85;
      const eB2x = bx + dx * 0.28 - nx * hw * (1 - p.bow * 0.5);
      const eB2y = by + dy * 0.28 - ny * hw * (1 - p.bow * 0.5);

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = p.opacity;
      ctx.translate(bx, by + p.warpY);
      ctx.rotate(p.rotation);
      ctx.scale(p.scale, p.scale);
      ctx.translate(-bx, -by);

      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.bezierCurveTo(eA1x, eA1y, eA2x, eA2y, tx, ty);
      ctx.bezierCurveTo(eB1x, eB1y, eB2x, eB2y, bx, by);
      ctx.closePath();

      const grad = ctx.createLinearGradient(bx, by, tx, ty);
      grad.addColorStop(0, p.colorStart);
      grad.addColorStop(1, p.colorEnd);
      ctx.fillStyle = grad;
      ctx.fill();

      // Silky striations: a fan from the base across the ribbon's far edge,
      // clipped to the petal so they read as fine satin ribs.
      ctx.clip();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255,255,255,${p.striationOpacity})`;
      for (let i = 0; i <= p.striationCount; i++) {
        const t = i / p.striationCount;
        // Sweep the far endpoint across the full width at the tip end.
        const acrossX = tx + nx * hw * (t * 2 - 1);
        const acrossY = ty + ny * hw * (t * 2 - 1);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(acrossX, acrossY);
        ctx.stroke();
      }
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of petals) drawPetal(p);
    };

    resize();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) render();
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    if (reduced) {
      petals.forEach((p, i) => { p.rotation = (i - 2) * 0.05; });
      render();
      return () => ro.disconnect();
    }

    const ctxGsap = gsap.context(() => {
      petals.forEach((p, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        gsap.to(p, {
          rotation: dir * (0.1 + i * 0.02),
          scale: 1.06,
          warpY: dir * (12 + i * 3),
          opacity: Math.min(1, p.opacity + 0.08),
          duration: 10 + i * 1.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.7,
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
