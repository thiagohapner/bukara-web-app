"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FEATURES = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Order Tracking",
    sub: "Track real time order status",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    title: "Free Shipping",
    sub: "You will love all our prices",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: "Flexible Payment",
    sub: "Pay with Multiple Credit Cards",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Fast Delivery",
    sub: "Your Product at the Door of Home",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "Premium Support",
    sub: "Outstanding 24/7 support service",
  },
];

export default function FeatureBar() {
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".feature-item", {
        opacity: 0,
        y: 30,
        duration: 0.55,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: { trigger: ".feature-grid", start: "top 88%" },
      });
    }, barRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={barRef} className="py-10" style={{ backgroundColor: "#044749" }}>
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="feature-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="feature-item flex flex-col items-center text-center gap-3 group"
            >
              <div className="text-slate-300 group-hover:text-orange-400 transition-colors duration-250">
                {f.icon}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{f.title}</p>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
