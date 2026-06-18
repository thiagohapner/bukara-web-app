"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/Footer";
import DealCard, { type DealCardData } from "@/components/DealCard";
import { type BukaraSku } from "@/lib/data";
import { supabase } from "@/lib/supabase";

gsap.registerPlugin(ScrollTrigger);

function round2(n: number) { return Math.round(n * 100) / 100; }

export default function AngebotePage() {
  const [deals, setDeals] = useState<DealCardData[]>([]);

  useEffect(() => {
    async function load() {
      const { data: offersData } = await supabase
        .from("offers")
        .select("id, slug, title, subtitle, campaign_discount_percent, linked_product_slug, card_image_url")
        .eq("is_active", true)
        .order("sort_order");
      const offers = offersData ?? [];
      if (offers.length === 0) return;

      const offerIds = offers.map((o: { id: string }) => o.id);
      const { data: itemsData } = await supabase
        .from("offer_items")
        .select("offer_id, product_id, quantity, requires_variant_selection, sort_order")
        .in("offer_id", offerIds)
        .order("sort_order");
      const allItems = itemsData ?? [];

      const productIds = [...new Set(allItems.map((i: { product_id: string }) => i.product_id))];

      const [{ data: skuData }, { data: productNameData }] = await Promise.all([
        supabase.from("skus").select("*").in("product_id", productIds).eq("is_active", true).order("sort_order"),
        supabase.from("products").select("id, name").in("id", productIds),
      ]);
      const allSkus = (skuData ?? []) as BukaraSku[];
      const productNameMap = Object.fromEntries(
        (productNameData ?? []).map((p: { id: string; name: string }) => [p.id, p.name])
      );

      const computed: DealCardData[] = offers.map((offer: {
        id: string;
        slug: string;
        title: string;
        subtitle: string;
        campaign_discount_percent: number;
        linked_product_slug: string | null;
        card_image_url: string | null;
      }) => {
        const items = allItems.filter((i: { offer_id: string }) => i.offer_id === offer.id);
        let fromCampaignPrice = 0;
        let fromOriginalPrice = 0;
        const includedProducts: string[] = [];

        items.forEach((item: { product_id: string; quantity: number; requires_variant_selection: boolean }) => {
          const skus = allSkus.filter((s) => s.product_id === item.product_id);
          const name = productNameMap[item.product_id];
          if (name) includedProducts.push(name);

          if (item.requires_variant_selection) {
            const minC = skus.length > 0 ? Math.min(...skus.map((s) => s.campaign_price ?? s.price)) : 0;
            const minO = skus.length > 0 ? Math.min(...skus.map((s) => s.price)) : 0;
            fromCampaignPrice += minC * item.quantity;
            fromOriginalPrice += minO * item.quantity;
          } else {
            const first = skus[0];
            fromCampaignPrice += (first?.campaign_price ?? first?.price ?? 0) * item.quantity;
            fromOriginalPrice += (first?.price ?? 0) * item.quantity;
          }
        });

        return {
          slug: offer.slug,
          href: offer.linked_product_slug
            ? `/produkte/${offer.linked_product_slug}`
            : `/angebote/${offer.slug}`,
          title: offer.title,
          subtitle: offer.subtitle,
          discountPercent: Number(offer.campaign_discount_percent),
          fromCampaignPrice: round2(fromCampaignPrice),
          fromOriginalPrice: round2(fromOriginalPrice),
          includedProducts,
          cardImage: offer.card_image_url ?? undefined,
        };
      });

      setDeals(computed);
    }
    load();
  }, []);

  useEffect(() => {
    if (deals.length === 0) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".deal-card");
      cards.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0, y: 40, duration: 0.65, ease: "power3.out", delay: i * 0.12,
          scrollTrigger: { trigger: card, start: "top 88%" },
        });
      });
    });
    return () => ctx.revert();
  }, [deals]);

  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href="/katalog" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Produkte</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Angebote</span>
          </nav>
        </div>

        <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
          {deals.map((deal, i) => (
            <DealCard key={deal.slug} deal={deal} index={i} />
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
