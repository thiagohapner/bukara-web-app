"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BEST_SELLERS } from "@/lib/data";
import ProductCard from "./ProductCard";
import SectionHeader from "./SectionHeader";

export default function BestSellers() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".bs-header", {
        opacity: 0,
        y: 28,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: { trigger: ".bs-header", start: "top 88%" },
      });
      gsap.from(".bs-card", {
        opacity: 0,
        y: 50,
        duration: 0.65,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".bs-grid", start: "top 85%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-white">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="bs-header">
          <SectionHeader title="Best Selling Products" />
        </div>
        <div className="bs-grid grid grid-cols-2 md:grid-cols-4 gap-5">
          {BEST_SELLERS.map((product) => (
            <div key={product.id} className="bs-card">
              <ProductCard product={product} size="lg" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
