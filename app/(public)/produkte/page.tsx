"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import DealsPromo from "@/components/DealsPromo";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";

gsap.registerPlugin(ScrollTrigger);

export default function ProdukteePage() {
  const tilesRef = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState<ProductCardData[]>([]);

  useEffect(() => {
    async function load() {
      const { data: products } = await supabase
        .from("products")
        .select("id, slug, name, badge, gallery_bg, has_variants")
        .eq("has_public_page", true)
        .eq("is_active", true)
        .order("sort_order");
      if (!products || products.length === 0) return;

      const ids = products.map((p: { id: string }) => p.id);
      const [{ data: images }, { data: skus }] = await Promise.all([
        supabase.from("product_images").select("product_id, image_url").in("product_id", ids).order("sort_order"),
        supabase.from("skus").select("product_id, price, campaign_price").in("product_id", ids).eq("is_active", true),
      ]);

      const firstImage: Record<string, string> = {};
      for (const img of (images ?? []) as Array<{ product_id: string; image_url: string }>) {
        if (!firstImage[img.product_id]) firstImage[img.product_id] = img.image_url;
      }

      const minPrices: Record<string, { campaign: number; original: number }> = {};
      for (const sku of (skus ?? []) as Array<{ product_id: string; price: number; campaign_price: number | null }>) {
        const c = sku.campaign_price ?? sku.price;
        const o = sku.price;
        if (!minPrices[sku.product_id]) {
          minPrices[sku.product_id] = { campaign: c, original: o };
        } else {
          if (c < minPrices[sku.product_id].campaign) minPrices[sku.product_id].campaign = c;
          if (o < minPrices[sku.product_id].original) minPrices[sku.product_id].original = o;
        }
      }

      setCards(products.map((p: { id: string; slug: string; name: string; badge: string | null; gallery_bg: string | null; has_variants: boolean | null }) => ({
        slug: p.slug,
        name: p.name,
        badge: p.badge ?? undefined,
        image: firstImage[p.id],
        galleryBg: p.gallery_bg ?? "#e6eff5",
        hasVariants: p.has_variants ?? false,
        fromCampaignPrice: minPrices[p.id]?.campaign,
        fromOriginalPrice: minPrices[p.id]?.original,
      })));
    }
    load();
  }, []);

  useEffect(() => {
    if (cards.length === 0) return;
    const ctx = gsap.context(() => {
      const tiles = gsap.utils.toArray<HTMLElement>(".product-tile");
      gsap.from(tiles, {
        opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: tilesRef.current, start: "top 85%" },
      });
    });
    return () => ctx.revert();
  }, [cards]);

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
          <div ref={tilesRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div key={card.slug} className="product-tile">
                <ProductCard card={card} />
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
