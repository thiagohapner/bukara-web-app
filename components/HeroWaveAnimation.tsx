"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Animated mesh gradient background (à la meshgradient.com / Stripe's hero),
// recolored to the Bukara teal ramp. A WebGL fragment shader blends 4 teal
// tones across a domain-warped fbm noise field that flows over time — a full,
// smooth, edge-to-edge color field (not blobs on dark). Driven on the GSAP
// ticker. The left fade + stepper scrim live in CSS.

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 c1; uniform vec3 c2; uniform vec3 c3; uniform vec3 c4;

void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  float t = u_time;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  // Fixed diagonal groove direction.
  float ang = 0.62;
  vec2 dir = vec2(cos(ang), sin(ang)); // along the grooves
  vec2 nrm = vec2(-sin(ang), cos(ang)); // across the grooves
  float across = dot(p, nrm);
  float along  = dot(p, dir);

  // Dense fine brushed striations across the grooves — razor-thin lines
  // (high exponent narrows each bright ridge to a hairline).
  float stri = pow(0.5 + 0.5 * sin(across * 230.0), 14.0);

  // Specular streak: a bright band of lit grooves sweeping across (perp).
  float streakPos = mix(-0.2, 1.1, 0.5 + 0.5 * sin(t * 0.16));
  float beam = exp(-pow((across - streakPos) / 0.22, 2.0));

  // Hot glint travelling ALONG the streak — the converging light point.
  float glintAlong = mix(-0.3, aspect + 0.3, 0.5 + 0.5 * sin(t * 0.11 + 1.3));
  float glint = beam * exp(-pow((along - glintAlong) / 0.28, 2.0));

  // Compose on the near-black base: brand grooves, pale-hot core at the glint.
  float bright = beam * 0.75 + glint * 2.1;
  vec3 grooveCol = mix(c2, c4, glint);
  vec3 col = c1;
  col += grooveCol * stri * bright;
  col += c4 * glint * 0.55;        // bright convergent glow
  gl_FragColor = vec4(col, 1.0);
}
`;

// Bukara teal ramp, normalized RGB: near-black base #041A19, brand #01A497,
// mint #27D8CA, pale #84CDC7.
const COLORS: [number, number, number][] = [
  [4 / 255, 26 / 255, 25 / 255],
  [1 / 255, 164 / 255, 151 / 255],
  [39 / 255, 216 / 255, 202 / 255],
  [132 / 255, 205 / 255, 199 / 255],
];

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function HeroWaveAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: true, premultipliedAlpha: false });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // Full-screen quad.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    (["c1", "c2", "c3", "c4"] as const).forEach((name, i) => {
      gl.uniform3fv(gl.getUniformLocation(prog, name), COLORS[i]);
    });

    let w = 0, h = 0;
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
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    const draw = (time: number) => {
      gl.uniform1f(uTime, time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    resize();

    const ro = new ResizeObserver(() => { resize(); });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      draw(0);
      return () => ro.disconnect();
    }

    const start = performance.now();
    const tick = () => draw((performance.now() - start) / 1000);
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="banner-petals__canvas" aria-hidden />;
}
