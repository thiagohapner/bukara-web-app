"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LATEST_PRODUCTS } from "@/lib/data";
import ProductCard from "./ProductCard";
import SectionHeader from "./SectionHeader";

export default function LatestProducts() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".lp-header", {
        opacity: 0,
        y: 28,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: { trigger: ".lp-header", start: "top 88%" },
      });
      gsap.from(".lp-card", {
        opacity: 0,
        y: 45,
        duration: 0.6,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: ".lp-grid", start: "top 82%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-slate-50">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="lp-header">
          <SectionHeader title="Latest Products" />
        </div>
        <div className="lp-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {LATEST_PRODUCTS.map((product) => (
            <div key={product.id} className="lp-card">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
