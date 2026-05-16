"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ShieldCheckIcon,
  TruckIcon,
  CreditCardIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

const FEATURES = [
  {
    icon: <ShieldCheckIcon className="w-7 h-7" strokeWidth={1.6} />,
    title: "Sendungsverfolgung",
    sub: "Bestellstatus jederzeit im Blick",
  },
  {
    icon: <TruckIcon className="w-7 h-7" strokeWidth={1.6} />,
    title: "Kostenloser Versand",
    sub: "Ab einem Bestellwert von 200 €",
  },
  {
    icon: <CreditCardIcon className="w-7 h-7" strokeWidth={1.6} />,
    title: "Flexible Zahlung",
    sub: "Rechnung, Vorkasse & mehr",
  },
  {
    icon: <BoltIcon className="w-7 h-7" strokeWidth={1.6} />,
    title: "Schnelle Lieferung",
    sub: "Direkt zu Ihnen ins Unternehmen",
  },
  {
    icon: <WrenchScrewdriverIcon className="w-7 h-7" strokeWidth={1.6} />,
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
