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

float hash(vec2 x){ return fract(sin(dot(x, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 x){
  vec2 i = floor(x); vec2 f = fract(x);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0,0.0)), u.x),
             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
}
float fbm(vec2 x){
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 5; i++){ v += a * noise(x); x *= 2.0; a *= 0.5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  uv.x *= u_res.x / u_res.y; // keep the cells round
  float t = u_time * 0.06;
  vec2 q = vec2(fbm(uv * 1.2 + vec2(0.0, t)), fbm(uv * 1.2 + vec2(t * 0.8, 1.3)));
  float n = fbm(uv * 1.5 + q * 1.5 + vec2(-t * 0.5, t * 0.3));
  float m = fbm(uv * 1.8 + q * 1.2 + 4.0 - t * 0.4);
  float k = fbm(uv * 2.2 + q - t * 0.2);
  vec3 col = mix(c1, c2, smoothstep(0.25, 0.75, n));
  col = mix(col, c3, smoothstep(0.35, 0.90, m));
  col = mix(col, c4, smoothstep(0.55, 0.95, k));
  gl_FragColor = vec4(col, 1.0);
}
`;

// Bukara teal ramp, normalized RGB: deep #062F2C, brand #01A497,
// mint #27D8CA, pale #84CDC7.
const COLORS: [number, number, number][] = [
  [6 / 255, 47 / 255, 44 / 255],
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
