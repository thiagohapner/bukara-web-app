"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/Footer";
import { BUKARA_PRODUCTS } from "@/lib/data";
import DealsPromo from "@/components/DealsPromo";
import ProductCard from "@/components/ProductCard";

gsap.registerPlugin(ScrollTrigger);

export default function ProdukteePage() {
  const tilesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tiles = gsap.utils.toArray<HTMLElement>(".product-tile");
      gsap.from(tiles, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: tilesRef.current,
          start: "top 85%",
        },
      });

    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <main className="min-h-screen bg-white">

        {/* Breadcrumb */}
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Produkte</span>
          </nav>
        </div>

        {/* Angebote banner */}
        <section className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-10">
          <DealsPromo variant="full" />
        </section>

        {/* Product grid */}
        <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-12 pb-20">
          <div
            ref={tilesRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {BUKARA_PRODUCTS.map((product, i) => (
              <div key={product.slug} className="product-tile">
                <ProductCard product={product} index={i} />
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
