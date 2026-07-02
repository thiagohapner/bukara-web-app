"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// "Flowing ribbon petals" background — a Stripe-hero-style canvas animation
// adapted to the Bukara monochrome-teal palette (see DESIGN_SYSTEM.md §5).
// Large organic bezier "petals" with gradient fills + dense radial striations
// (silky fabric texture) drift/rotate/warp on a seamless GSAP loop and glow
// where they overlap (screen blend). Canvas 2D only — GSAP drives all values.

type Petal = {
  // Bezier control points, normalized 0–1 (scaled to canvas size at draw).
  startX: number; startY: number;
  cp1x: number; cp1y: number;
  cp2x: number; cp2y: number;
  endX: number; endY: number;
  // Base/root point the petal rotates + striations radiate from (normalized).
  baseX: number; baseY: number;
  colorStart: string;
  colorEnd: string;
  striationCount: number;
  striationOpacity: number;
  // Animation state, mutated by GSAP tweens each frame.
  rotation: number; // radians
  scale: number;
  warpY: number; // px
  opacity: number;
};

// Bukara teal ramp (monochrome, on the deep-teal dark surface). Clustered in
// the right ~60%; the left fade is handled by the CSS mask on the canvas.
const makePetals = (): Petal[] => [
  {
    startX: 0.55, startY: 0.15, cp1x: 1.05, cp1y: 0.0, cp2x: 1.1, cp2y: 0.7,
    endX: 0.6, endY: 0.95, baseX: 0.58, baseY: 0.5,
    colorStart: "#07645D", colorEnd: "#062F2C",
    striationCount: 190, striationOpacity: 0.1,
    rotation: 0, scale: 1, warpY: 0, opacity: 0.9,
  },
  {
    startX: 0.62, startY: -0.05, cp1x: 1.15, cp1y: 0.25, cp2x: 0.95, cp2y: 0.85,
    endX: 0.7, endY: 1.05, baseX: 0.66, baseY: 0.42,
    colorStart: "#01A497", colorEnd: "#07645D",
    striationCount: 170, striationOpacity: 0.12,
    rotation: 0, scale: 1, warpY: 0, opacity: 0.85,
  },
  {
    startX: 0.72, startY: 0.1, cp1x: 1.2, cp1y: 0.4, cp2x: 1.05, cp2y: 0.95,
    endX: 0.8, endY: 1.1, baseX: 0.74, baseY: 0.55,
    colorStart: "#27D8CA", colorEnd: "#01A497",
    striationCount: 160, striationOpacity: 0.14,
    rotation: 0, scale: 1, warpY: 0, opacity: 0.8,
  },
  {
    startX: 0.8, startY: -0.1, cp1x: 1.25, cp1y: 0.15, cp2x: 1.15, cp2y: 0.75,
    endX: 0.85, endY: 0.9, baseX: 0.82, baseY: 0.4,
    colorStart: "#84CDC7", colorEnd: "#04857B",
    striationCount: 150, striationOpacity: 0.12,
    rotation: 0, scale: 1, warpY: 0, opacity: 0.7,
  },
  {
    startX: 0.5, startY: 0.35, cp1x: 0.95, cp1y: 0.35, cp2x: 1.0, cp2y: 0.95,
    endX: 0.55, endY: 1.15, baseX: 0.55, baseY: 0.62,
    colorStart: "#B4DAD7", colorEnd: "#01A497",
    striationCount: 140, striationOpacity: 0.1,
    rotation: 0, scale: 1, warpY: 0, opacity: 0.65,
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

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = p.opacity;
      // Warp/rotate/scale around the petal's base point.
      ctx.translate(bx, by + p.warpY);
      ctx.rotate(p.rotation);
      ctx.scale(p.scale, p.scale);
      ctx.translate(-bx, -by);

      // Petal silhouette (closed bezier loop back through the base).
      ctx.beginPath();
      ctx.moveTo(p.startX * w, p.startY * h);
      ctx.bezierCurveTo(
        p.cp1x * w, p.cp1y * h,
        p.cp2x * w, p.cp2y * h,
        p.endX * w, p.endY * h
      );
      ctx.bezierCurveTo(
        bx + (p.endX * w - bx) * 0.3, by + (p.endY * h - by) * 0.3,
        bx + (p.startX * w - bx) * 0.3, by + (p.startY * h - by) * 0.3,
        p.startX * w, p.startY * h
      );
      ctx.closePath();

      const grad = ctx.createLinearGradient(bx, by, p.endX * w, p.endY * h);
      grad.addColorStop(0, p.colorStart);
      grad.addColorStop(1, p.colorEnd);
      ctx.fillStyle = grad;
      ctx.fill();

      // Silky striations: fan of thin lines from the base to points along the
      // petal's outer edge (clipped to the petal shape).
      ctx.clip();
      ctx.lineWidth = 1;
      const ex = p.endX * w;
      const ey = p.endY * h;
      const sx = p.startX * w;
      const sy = p.startY * h;
      for (let i = 0; i < p.striationCount; i++) {
        const t = i / (p.striationCount - 1);
        // Interpolate the outer edge from start point to end point.
        const tx = sx + (ex - sx) * t;
        const ty = sy + (ey - sy) * t;
        ctx.strokeStyle = `rgba(255,255,255,${p.striationOpacity})`;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        // Overshoot past the edge so lines always reach the clip boundary.
        ctx.lineTo(bx + (tx - bx) * 1.6, by + (ty - by) * 1.6);
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
      // Static composition — spread the petals to their mid state and draw once.
      petals.forEach((p, i) => {
        p.rotation = (i - 2) * 0.06;
        p.scale = 1;
      });
      render();
      return () => ro.disconnect();
    }

    const ctxGsap = gsap.context(() => {
      petals.forEach((p, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        gsap.to(p, {
          rotation: dir * (0.16 + i * 0.03),
          scale: 1.08,
          warpY: dir * (14 + i * 3),
          opacity: Math.min(1, p.opacity + 0.1),
          duration: 9 + i * 1.6,
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
