"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, Truck, CreditCard, Zap, Wrench } from "lucide-react";

const FEATURES = [
  {
    icon: <ShieldCheck className="w-7 h-7" strokeWidth={1.6} />,
    title: "Sendungsverfolgung",
    sub: "Bestellstatus jederzeit im Blick",
  },
  {
    icon: <Truck className="w-7 h-7" strokeWidth={1.6} />,
    title: "Kostenloser Versand",
    sub: "Ab einem Bestellwert von 200 €",
  },
  {
    icon: <CreditCard className="w-7 h-7" strokeWidth={1.6} />,
    title: "Flexible Zahlung",
    sub: "Rechnung, Vorkasse & mehr",
  },
  {
    icon: <Zap className="w-7 h-7" strokeWidth={1.6} />,
    title: "Schnelle Lieferung",
    sub: "Direkt zu Ihnen ins Unternehmen",
  },
  {
    icon: <Wrench className="w-7 h-7" strokeWidth={1.6} />,
    title: "Expertenberatung",
    sub: "Persönliche Beratung durch Fachleute",
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
    <section ref={barRef} className="py-10" style={{ backgroundColor: "var(--color-brand-800)" }}>
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="feature-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="feature-item flex flex-col items-center text-center gap-3 group"
            >
              <div className="text-brand-200 group-hover:text-brand-400 transition-colors duration-[240ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)]">
                {f.icon}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{f.title}</p>
                <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "var(--color-text-dark-body)" }}>{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
