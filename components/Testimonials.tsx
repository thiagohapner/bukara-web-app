"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TESTIMONIALS } from "@/lib/data";

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".t-header", {
        opacity: 0,
        y: 28,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: { trigger: ".t-header", start: "top 88%" },
      });
      gsap.from(".t-card", {
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.14,
        ease: "power3.out",
        scrollTrigger: { trigger: ".t-grid", start: "top 84%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-slate-50">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="t-header mb-4 flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Happy Customers</h2>
          <div className="flex gap-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i === 0 ? "bg-orange-500" : "bg-slate-200"}`}
              />
            ))}
          </div>
        </div>
        <div className="t-grid grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="t-card bg-white rounded-2xl p-7 border border-slate-100 transition-transform duration-450 hover:scale-[1.02]"
            >
              {/* Stars */}
              <div className="stars text-lg mb-3">
                {"★".repeat(t.rating)}
              </div>
              {/* Text */}
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                &ldquo;{t.text}&rdquo;
              </p>
              {/* Author */}
              <div className="flex items-center gap-3">
                <Image
                  src={t.image}
                  alt={t.name}
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-full object-cover border-2 border-slate-100"
                  unoptimized
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
