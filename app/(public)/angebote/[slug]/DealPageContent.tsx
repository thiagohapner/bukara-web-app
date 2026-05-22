"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import ProductAccordion from "@/components/ProductAccordion";
import CustomSelect from "@/components/CustomSelect";
import { useCart } from "@/components/CartContext";
import { type BukaraSku, type ProductSpec, type ProductMaterial, type ProductCuttingData } from "@/lib/data";
import { formatEur } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import OrderBenefits from "@/components/OrderBenefits";

// ─── Shared helpers ────────────────────────────────────────────────────────────

function Dots({ count }: { count: number }) {
  return (
    <div className="flex gap-[3px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: "block",
            width: 14,
            height: 5,
            borderRadius: 2,
            backgroundColor: i < count ? "#2E4A47" : "#CBD5E1",
          }}
        />
      ))}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface OfferRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  campaign_discount_percent: number;
}

interface BundleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  requires_variant_selection: boolean;
  is_anchor: boolean;
  skus: BukaraSku[];
}

function round2(n: number) { return Math.round(n * 100) / 100; }

function DealCheck() {
  return <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#00A597]" strokeWidth={2.5} />;
}

// ─── Main export (receives slug from server-component shell) ──────────────────

export default function DealPageContent({ dealSlug }: { dealSlug: string }) {
  const { addDeal, openDrawer } = useCart();

  const [gallery, setGallery] = useState<{ bg: string; label: string }>({ bg: "#e6eff5", label: "SET" });
  const [images, setImages] = useState<string[]>([]);
  const [offer, setOffer] = useState<OfferRow | null>(null);
  const [items, setItems] = useState<BundleItem[]>([]);
  const [selectedSkuIds, setSelectedSkuIds] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [addedState, setAddedState] = useState<"idle" | "added">("idle");
  const [loading, setLoading] = useState(true);
  const [specs, setSpecs] = useState<ProductSpec[]>([]);
  const [materials, setMaterials] = useState<ProductMaterial[]>([]);
  const [cuttingData, setCuttingData] = useState<ProductCuttingData[]>([]);

  useEffect(() => {
    async function load() {
      const { data: offerData } = await supabase
        .from("offers")
        .select("id, slug, title, subtitle, campaign_discount_percent, gallery_bg, gallery_label")
        .eq("slug", dealSlug)
        .single();
      if (!offerData) { setLoading(false); return; }
      setOffer({
        id: offerData.id,
        slug: offerData.slug,
        title: offerData.title,
        subtitle: offerData.subtitle,
        campaign_discount_percent: offerData.campaign_discount_percent,
      });
      setGallery({ bg: offerData.gallery_bg ?? "#e6eff5", label: offerData.gallery_label ?? "SET" });

      const [itemsRes, offerImagesRes] = await Promise.all([
        supabase.from("offer_items")
          .select("product_id, quantity, requires_variant_selection, is_anchor, sort_order")
          .eq("offer_id", offerData.id)
          .order("sort_order"),
        supabase.from("offer_images")
          .select("image_url")
          .eq("offer_id", offerData.id)
          .order("sort_order"),
      ]);
      setImages((offerImagesRes.data ?? []).map((r: { image_url: string }) => r.image_url));

      const rawItems = (itemsRes.data ?? []) as Array<{
        product_id: string;
        quantity: number;
        requires_variant_selection: boolean;
        is_anchor: boolean;
        sort_order: number;
      }>;

      const productIds = rawItems.map((i) => i.product_id);
      const [{ data: skuData }, { data: productNameData }] = await Promise.all([
        supabase.from("skus").select("*").in("product_id", productIds).eq("is_active", true).order("sort_order"),
        supabase.from("products").select("id, name").in("id", productIds),
      ]);
      const allSkus = (skuData ?? []) as BukaraSku[];
      const productNameMap = Object.fromEntries(
        (productNameData ?? []).map((p: { id: string; name: string }) => [p.id, p.name])
      );

      const bundleItems: BundleItem[] = rawItems.map((item) => ({
        product_id: item.product_id,
        product_name: productNameMap[item.product_id] ?? "",
        quantity: item.quantity,
        requires_variant_selection: item.requires_variant_selection,
        is_anchor: item.is_anchor,
        skus: allSkus.filter((s) => s.product_id === item.product_id),
      }));
      setItems(bundleItems);

      const defaults: Record<string, string> = {};
      bundleItems.forEach((item) => {
        if (item.requires_variant_selection && item.skus.length > 0) {
          defaults[item.product_id] = item.skus[0].id;
        }
      });
      setSelectedSkuIds(defaults);

      const primaryItem = bundleItems.find((i) => i.is_anchor);
      if (primaryItem) {
        const pid = primaryItem.product_id;
        const [{ data: specsD }, { data: matsD }, { data: cutD }] = await Promise.all([
          supabase.from("product_specs").select("*").eq("product_id", pid).order("sort_order"),
          supabase.from("product_materials").select("*").eq("product_id", pid).order("sort_order"),
          supabase.from("product_cutting_data").select("*").eq("product_id", pid).order("sort_order"),
        ]);
        setSpecs((specsD ?? []) as ProductSpec[]);
        setMaterials((matsD ?? []) as ProductMaterial[]);
        setCuttingData((cutD ?? []) as ProductCuttingData[]);
      }

      setLoading(false);
    }
    load();
  }, [dealSlug]);

  // ─── Pricing ──────────────────────────────────────────────────────────────

  function itemCampaignPrice(item: BundleItem): number {
    if (item.requires_variant_selection) {
      const sku = item.skus.find((s) => s.id === selectedSkuIds[item.product_id]) ?? item.skus[0];
      return (sku?.campaign_price ?? sku?.price ?? 0) * item.quantity;
    }
    const sku = item.skus[0];
    return (sku?.campaign_price ?? sku?.price ?? 0) * item.quantity;
  }

  function itemOriginalPrice(item: BundleItem): number {
    if (item.requires_variant_selection) {
      const sku = item.skus.find((s) => s.id === selectedSkuIds[item.product_id]) ?? item.skus[0];
      return (sku?.price ?? 0) * item.quantity;
    }
    const sku = item.skus[0];
    return (sku?.price ?? 0) * item.quantity;
  }

  const campaignTotal = round2(items.reduce((sum, item) => sum + itemCampaignPrice(item), 0));
  const originalTotal = round2(items.reduce((sum, item) => sum + itemOriginalPrice(item), 0));

  const anchorItem = items.find((i) => i.is_anchor);
  const anchorSkuId = anchorItem
    ? (selectedSkuIds[anchorItem.product_id] ?? anchorItem.skus[0]?.id ?? null)
    : null;
  const selectedAnchorSku = anchorItem
    ? (anchorItem.skus.find((s) => s.id === selectedSkuIds[anchorItem.product_id]) ?? anchorItem.skus[0] ?? null)
    : null;

  async function handleAddToCart() {
    if (!offer || loading) return;
    await addDeal(offer.id, anchorSkuId, quantity, campaignTotal);
    setAddedState("added");
    openDrawer();
    setTimeout(() => setAddedState("idle"), 1500);
  }

  function scrollToAccordion(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById("deal-accordion")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const discountPct = offer ? Math.round(Number(offer.campaign_discount_percent)) : 0;

  // ─── Accordion sections ───────────────────────────────────────────────────

  const accordionSections = [];

  const techItems = specs.filter((s) => s.spec_section === "technische_details");
  if (techItems.length > 0) {
    accordionSections.push({
      id: "technische-details",
      label: "Technische Details",
      content: (
        <div className="flex flex-col gap-2.5">
          {techItems.map((s) => (
            <p key={s.id} className="text-base text-slate-700 leading-snug">{s.spec_value}</p>
          ))}
        </div>
      ),
    });
  }

  const anwendungItems = specs.filter((s) => s.spec_section === "anwendung");
  if (anwendungItems.length > 0) {
    accordionSections.push({
      id: "anwendung",
      label: "Anwendung",
      content: (
        <div className="flex flex-col gap-2">
          {anwendungItems.map((s) => (
            <p key={s.id} className="text-base text-slate-700">{s.spec_value}</p>
          ))}
        </div>
      ),
    });
  }

  if (materials.length > 0) {
    accordionSections.push({
      id: "geeignet-fuer",
      label: "Geeignet für",
      content: (
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          {materials.map((mat, idx) => {
            const labels = ["Sehr gut geeignet", "Gut geeignet", "Geeignet"];
            return (
              <div key={mat.id} className="flex flex-col gap-1.5">
                <p className="text-base text-slate-900 leading-snug">{mat.material_name}</p>
                <Dots count={(idx % 3) + 1} />
                <p className="text-sm text-slate-400">{labels[idx % 3]}</p>
              </div>
            );
          })}
        </div>
      ),
    });
  }

  if (cuttingData.length > 0) {
    accordionSections.push({
      id: "schnittdaten",
      label: "Schnittdaten",
      content: (
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="pb-3 pr-6 text-left text-base text-slate-400 font-normal">ø</th>
              <th className="pb-3 pr-6 text-left text-base text-slate-400 font-normal">Vorschub</th>
              <th className="pb-3 text-left text-base text-slate-400 font-normal">Drehzahl</th>
            </tr>
          </thead>
          <tbody>
            {cuttingData.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="py-2.5 pr-6 text-base text-slate-900">{row.diameter}</td>
                <td className="py-2.5 pr-6 text-base text-slate-700">{row.feed_rate}</td>
                <td className="py-2.5 text-base text-slate-700">{row.rpm_range}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    });
  }

  return (
    <>
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-1">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Start</Link>
          <span>/</span>
          <Link href="/angebote" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Angebote</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">{offer?.title ?? "Angebot"}</span>
        </nav>
      </div>

      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-20">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-[5%] items-start">

          <div className="w-full lg:w-[55%] flex-shrink-0 lg:sticky lg:top-[72px]">
            <ProductGallery
              images={images}
              placeholderBg={gallery.bg}
              placeholderLabel={gallery.label}
              badge={discountPct > 0 ? `-${discountPct}%` : undefined}
            />
          </div>

          <div className="w-full lg:w-[40%] flex-shrink-0 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
              {offer?.title ?? ""}
            </h1>

            {selectedAnchorSku && (
              <p className="text-sm text-slate-400 mb-4">Artikel-Nr.: {selectedAnchorSku.artikel_nr}</p>
            )}

            <div className="flex items-baseline gap-3 mb-1">
              {loading ? (
                <span className="text-2xl font-extrabold text-slate-200">—</span>
              ) : (
                <>
                  <span className="text-2xl font-extrabold text-[#9B242A]">{formatEur(campaignTotal)}</span>
                  <span className="flex items-baseline gap-1">
                    <span className="text-base text-slate-400 line-through">{formatEur(originalTotal)}</span>
                    {originalTotal > campaignTotal && (
                      <span className="text-sm font-semibold text-[#9B242A]">
                        -{Math.round((1 - campaignTotal / originalTotal) * 100)}%
                      </span>
                    )}
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mb-4">zzgl. 19% MwSt.</p>

            {offer?.subtitle && (
              <p className="text-base text-slate-900 leading-relaxed mb-2">{offer.subtitle}</p>
            )}

            {accordionSections.length > 0 && (
              <a
                href="#deal-accordion"
                onClick={scrollToAccordion}
                className="inline-block text-base text-slate-900 underline underline-offset-2 mb-5 cursor-pointer"
              >
                Technische Details
              </a>
            )}

            {items.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                  Enthaltene Produkte
                </p>
                <ul className="flex flex-col gap-2">
                  {items.map((item) => (
                    <li key={item.product_id} className="flex items-start gap-2 text-sm text-slate-900">
                      <DealCheck />
                      {item.product_name}
                      {item.requires_variant_selection && ` (${item.skus.length} Ausführungen)`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="h-px bg-slate-100 mb-5" />

            {items.filter((i) => i.requires_variant_selection).map((item) => (
              <div key={item.product_id} className="mb-8">
                <p className="text-base font-bold text-slate-900 mb-2">Ausführung</p>
                <CustomSelect
                  value={selectedSkuIds[item.product_id] ?? ""}
                  onChange={(val) => setSelectedSkuIds((prev) => ({ ...prev, [item.product_id]: val }))}
                  options={item.skus.map((s) => ({
                    value: s.id,
                    label: `${s.variant_label} · ${formatEur(s.campaign_price ?? s.price)}`,
                  }))}
                />
              </div>
            ))}

            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center border border-slate-800 rounded-full select-none h-12">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 h-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                </button>
                <span className="min-w-[1.75rem] text-center text-sm font-semibold text-slate-900 px-1">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 h-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={loading || !offer}
                className="btn-black flex-1 justify-center"
                style={{ opacity: loading || !offer ? 0.6 : 1 }}
              >
                {addedState === "added" ? "✓ Hinzugefügt" : "In den Warenkorb"}
              </button>
            </div>

            <OrderBenefits />

            {accordionSections.length > 0 && (
              <div id="deal-accordion" className="mt-8 scroll-mt-24">
                <ProductAccordion sections={accordionSections} defaultOpenIds={["technische-details"]} />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
