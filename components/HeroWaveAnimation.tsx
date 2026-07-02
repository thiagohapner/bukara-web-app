"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// "Flowing ribbon" background — a Stripe-hero-style canvas animation adapted
// to the Bukara monochrome-teal palette (see DESIGN_SYSTEM.md §5). Each ribbon
// is a long, thin, curved band with a gradient fill and dense fine striations
// running ALONG its length (the silky grain follows the flow, like Stripe's).
// Ribbons are drawn with a screen blend so overlaps glow, and slowly
// drift/rotate/warp on a seamless GSAP loop. Canvas 2D only; GSAP drives all
// values. Each ribbon is rendered once to an offscreen sprite (so striations
// can be dense without per-frame cost) and just transformed each frame.

type Ribbon = {
  // Centerline cubic bezier + tip, normalized 0–1 (scaled to canvas at build).
  baseX: number; baseY: number;
  c1x: number; c1y: number;
  c2x: number; c2y: number;
  tipX: number; tipY: number;
  widthMax: number; // half-width at the widest, fraction of canvas width
  colorStart: string;
  colorEnd: string;
  striationCount: number;
  striationOpacity: number;
  // Animation state, mutated by GSAP each frame.
  rotation: number; scale: number; warpY: number; opacity: number;
};

// Long sweeping ribbons flowing up toward the top-right, overlapping. Teal ramp.
const makeRibbons = (): Ribbon[] => [
  {
    baseX: 0.5, baseY: 1.25, c1x: 0.7, c1y: 0.7, c2x: 1.0, c2y: 0.5, tipX: 1.15, tipY: -0.2,
    widthMax: 0.1, colorStart: "#062F2C", colorEnd: "#07645D",
    striationCount: 110, striationOpacity: 0.08,
    rotation: 0, scale: 1, warpY: 0, opacity: 0.9,
  },
  {
    baseX: 0.55, baseY: 1.3, c1x: 0.8, c1y: 0.85, c2x: 1.05, c2y: 0.35, tipX: 1.2, tipY: -0.1,
    widthMax: 0.085, colorStart: "#07645D", colorEnd: "#01A497",
    striationCount: 110, striationOpacity: 0.1,
    rotation: 0, scale: 1, warpY: 0, opacity: 0.85,
  },
  {
    baseX: 0.6, baseY: 1.2, c1x: 0.85, c1y: 0.6, c2x: 1.1, c2y: 0.15, tipX: 1.25, tipY: -0.15,
    widthMax: 0.07, colorStart: "#01A497", colorEnd: "#27D8CA",
    striationCount: 100, striationOpacity: 0.12,
    rotation: 0, scale: 1, warpY: 0, opacity: 0.8,
  },
  {
    baseX: 0.66, baseY: 1.28, c1x: 0.95, c1y: 0.75, c2x: 1.15, c2y: 0.3, tipX: 1.3, tipY: 0.05,
    widthMax: 0.06, colorStart: "#27D8CA", colorEnd: "#84CDC7",
    striationCount: 90, striationOpacity: 0.11,
    rotation: 0, scale: 1, warpY: 0, opacity: 0.72,
  },
  {
    baseX: 0.48, baseY: 1.2, c1x: 0.72, c1y: 0.55, c2x: 0.98, c2y: 0.2, tipX: 1.05, tipY: -0.05,
    widthMax: 0.05, colorStart: "#84CDC7", colorEnd: "#B4DAD7",
    striationCount: 80, striationOpacity: 0.09,
    rotation: 0, scale: 1, warpY: 0, opacity: 0.6,
  },
];

const SAMPLES = 48;
const bez = (a: number, b: number, c: number, d: number, t: number) => {
  const mt = 1 - t;
  return mt * mt * mt * a + 3 * mt * mt * t * b + 3 * mt * t * t * c + t * t * t * d;
};
const bezD = (a: number, b: number, c: number, d: number, t: number) => {
  const mt = 1 - t;
  return 3 * mt * mt * (b - a) + 6 * mt * t * (c - b) + 3 * t * t * (d - c);
};
// Width taper: narrow at base, widest ~55%, tapering to the tip.
const widthAt = (t: number) => Math.pow(Math.sin(Math.PI * t), 0.7);

export default function HeroWaveAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ribbons = makeRibbons();
    let sprites: HTMLCanvasElement[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;

    // Pre-render one ribbon (gradient fill + curved longitudinal striations)
    // into its own offscreen canvas, in logical (w×h) coordinates at dpr.
    const buildSprite = (r: Ribbon): HTMLCanvasElement => {
      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.round(w * dpr));
      off.height = Math.max(1, Math.round(h * dpr));
      const o = off.getContext("2d")!;
      o.setTransform(dpr, 0, 0, dpr, 0, 0);

      const bx = r.baseX * w, by = r.baseY * h;
      const tx = r.tipX * w, ty = r.tipY * h;
      const c1x = r.c1x * w, c1y = r.c1y * h;
      const c2x = r.c2x * w, c2y = r.c2y * h;
      const hw = r.widthMax * w;

      // Sample the centerline: point + unit normal + local width.
      const cx: number[] = [], cy: number[] = [], nx: number[] = [], ny: number[] = [], wd: number[] = [];
      for (let i = 0; i <= SAMPLES; i++) {
        const t = i / SAMPLES;
        const px = bez(bx, c1x, c2x, tx, t);
        const py = bez(by, c1y, c2y, ty, t);
        const dx = bezD(bx, c1x, c2x, tx, t);
        const dy = bezD(by, c1y, c2y, ty, t);
        const len = Math.hypot(dx, dy) || 1;
        cx.push(px); cy.push(py);
        nx.push(-dy / len); ny.push(dx / len);
        wd.push(hw * widthAt(t));
      }

      // Fill silhouette: edge A forward, edge B back.
      o.beginPath();
      for (let i = 0; i <= SAMPLES; i++) {
        const x = cx[i] + nx[i] * wd[i], y = cy[i] + ny[i] * wd[i];
        if (i === 0) o.moveTo(x, y); else o.lineTo(x, y);
      }
      for (let i = SAMPLES; i >= 0; i--) {
        o.lineTo(cx[i] - nx[i] * wd[i], cy[i] - ny[i] * wd[i]);
      }
      o.closePath();
      const grad = o.createLinearGradient(bx, by, tx, ty);
      grad.addColorStop(0, r.colorStart);
      grad.addColorStop(1, r.colorEnd);
      o.fillStyle = grad;
      o.fill();

      // Longitudinal striations, each following the curve at a fixed offset
      // across the width — the silky grain.
      o.save();
      o.clip();
      o.lineWidth = 1;
      o.strokeStyle = `rgba(255,255,255,${r.striationOpacity})`;
      for (let k = 0; k <= r.striationCount; k++) {
        const s = (k / r.striationCount) * 2 - 1; // -1..1 across the width
        o.beginPath();
        for (let i = 0; i <= SAMPLES; i++) {
          const x = cx[i] + nx[i] * wd[i] * s;
          const y = cy[i] + ny[i] * wd[i] * s;
          if (i === 0) o.moveTo(x, y); else o.lineTo(x, y);
        }
        o.stroke();
      }
      o.restore();
      return off;
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sprites = ribbons.map(buildSprite);
    };

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "screen";
      ribbons.forEach((r, idx) => {
        const sprite = sprites[idx];
        if (!sprite) return;
        const bx = r.baseX * w, by = r.baseY * h;
        ctx.save();
        ctx.globalAlpha = r.opacity;
        ctx.translate(bx, by + r.warpY);
        ctx.rotate(r.rotation);
        ctx.scale(r.scale, r.scale);
        ctx.translate(-bx, -by);
        ctx.drawImage(sprite, 0, 0, w, h);
        ctx.restore();
      });
    };

    resize();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ro = new ResizeObserver(() => {
      resize();
      render();
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    if (reduced) {
      ribbons.forEach((r, i) => { r.rotation = (i - 2) * 0.04; });
      render();
      return () => ro.disconnect();
    }

    const ctxGsap = gsap.context(() => {
      ribbons.forEach((r, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        gsap.to(r, {
          rotation: dir * (0.08 + i * 0.015),
          scale: 1.05,
          warpY: dir * (10 + i * 3),
          opacity: Math.min(1, r.opacity + 0.06),
          duration: 11 + i * 1.7,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.8,
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
