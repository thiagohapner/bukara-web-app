"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionHeader from "./SectionHeader";

const ARTICLES = [
  { id: 1, title: "Tips for improving your gaming experience at home", date: "Apr 1, 2025", image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&q=80", category: "Gaming" },
  { id: 2, title: "Tech gift guide finding the perfect gift for every occasion", date: "Apr 1, 2025", image: "https://images.unsplash.com/photo-1549637642-90187f64f420?w=600&q=80", category: "Gift Guide" },
  { id: 3, title: "Tips for setting up a home office for remote work success", date: "Apr 1, 2025", image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80", category: "Work" },
];

export default function NewsArticles() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".article-card", {
        opacity: 0,
        y: 50,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".articles-grid", start: "top 82%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-white">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <SectionHeader title="News & Articles" />
        <div className="articles-grid grid grid-cols-1 sm:grid-cols-3 gap-7">
          {ARTICLES.map((article) => (
            <article
              key={article.id}
              className="article-card group cursor-pointer"
            >
              <div className="rounded-2xl overflow-hidden mb-4 h-52 relative">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">
                  {article.category}
                </span>
                <span className="text-xs text-slate-400">{article.date}</span>
              </div>
              <h3 className="text-[15px] font-semibold text-slate-800 leading-snug group-hover:text-orange-500 transition-colors">
                {article.title}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
