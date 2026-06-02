"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

const TILES = [
  {
    id: 1,
    badge: "Sonderwerkzeug",
    title: "Werkzeuge nach Ihren Spezifikationen",
    cta: "Jetzt anfragen",
    href: "/loesungen/sonderwerkzeug",
    image: "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/services/sonderwerkzeug/Frame%2065%20(4).png",
  },
  {
    id: 2,
    badge: "Standardsortiment",
    title: "Premium-Werkzeuge zu Top-Preisen",
    cta: "Produkte entdecken",
    href: "/katalog",
    image: "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/hero/main_image.png",
  },
  {
    id: 3,
    badge: "Schärfservice",
    title: "Bequemer Schärfservice — Deutschlandweit",
    cta: "Service anfragen",
    href: "/loesungen/schaerfservice",
    image: "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/services/schaerfservice/main_image_small.png",
  },
];

export default function PromoTiles() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".promo-tile", {
        opacity: 0,
        y: 40,
        scale: 0.97,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".promo-grid", start: "top 82%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-white">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="promo-grid grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TILES.map((tile) => (
            <Link
              key={tile.id}
              href={tile.href}
              style={{ textDecoration: "none" }}
              className="promo-tile relative rounded-lg overflow-hidden min-h-[200px] flex items-center justify-between px-7 py-7 group"
            >
              <div style={{ backgroundColor: "#F5F5F7" }} className="absolute inset-0" />

              {/* Text */}
              <div className="z-10 max-w-[55%]">
                <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: "#00A597" }}>
                  {tile.badge}
                </p>
                <h3 className="text-[17px] font-semibold leading-tight mb-4" style={{ color: "#022221" }}>
                  {tile.title}
                </h3>
                <span className="inline-flex items-center gap-2 text-sm font-semibold underline-offset-2 group-hover:underline" style={{ color: "#044749" }}>
                  {tile.cta}
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </span>
              </div>

              {/* Image */}
              <div className="w-[42%] h-[160px] relative flex-shrink-0 z-10 rounded-lg overflow-hidden">
                <Image
                  src={tile.image}
                  alt={tile.title}
                  fill
                  className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                  sizes="(max-width: 640px) 50vw, 20vw"
                />
              </div>

            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
