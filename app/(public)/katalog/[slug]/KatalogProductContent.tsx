"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductGallery from "@/components/ProductGallery";
import ProductAccordion from "@/components/ProductAccordion";
import OrderBenefits from "@/components/OrderBenefits";
import V2VariantPicker from "@/components/V2VariantPicker";
import { useCart } from "@/components/CartContext";
import { supabase } from "@/lib/supabase";
import { formatEur } from "@/lib/pricing";
import type { V2Product, V2Sku, V2SkuImage, V2SkuSpec, V2ProductMaterial, V2ProductApplication } from "@/lib/v2/types";

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

const SCORE_LABEL: Record<number, string> = {
  1: "Geeignet",
  2: "Gut geeignet",
  3: "Sehr gut geeignet",
};

export default function KatalogProductContent({ slug }: { slug: string }) {
  const { addItem, openDrawer } = useCart();

  const [product, setProduct] = useState<V2Product | null>(null);
  const [skus, setSkus] = useState<V2Sku[]>([]);
  const [skuImages, setSkuImages] = useState<V2SkuImage[]>([]);
  const [skuSpecs, setSkuSpecs] = useState<V2SkuSpec[]>([]);
  const [materials, setMaterials] = useState<V2ProductMaterial[]>([]);
  const [applications, setApplications] = useState<V2ProductApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSkuId, setSelectedSkuId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addedState, setAddedState] = useState<"idle" | "added">("idle");

  useEffect(() => {
    async function load() {
      const { data: prod } = await supabase
        .schema("v2")
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!prod) { setLoading(false); return; }
      setProduct(prod as V2Product);

      const { data: skuData } = await supabase
        .schema("v2")
        .from("skus")
        .select("*")
        .eq("product_id", prod.id)
        .eq("is_active", true)
        .order("sort_order");

      const skuList = (skuData ?? []) as V2Sku[];
      setSkus(skuList);
      if (skuList.length > 0) setSelectedSkuId(skuList[0].id);

      if (skuList.length === 0) { setLoading(false); return; }

      const skuIds = skuList.map((s) => s.id);
      const [
        { data: images },
        { data: specs },
        { data: mats },
        { data: apps },
      ] = await Promise.all([
        supabase.schema("v2").from("sku_images").select("*").in("sku_id", skuIds).order("sort_order"),
        supabase.schema("v2").from("sku_specs").select("*").in("sku_id", skuIds).order("sort_order"),
        supabase.schema("v2").from("product_materials").select("*").eq("product_id", prod.id).order("sort_order"),
        supabase.schema("v2").from("product_applications").select("tag").eq("product_id", prod.id),
      ]);

      setSkuImages((images ?? []) as V2SkuImage[]);
      setSkuSpecs((specs ?? []) as V2SkuSpec[]);
      setMaterials((mats ?? []) as V2ProductMaterial[]);
      setApplications((apps ?? []) as V2ProductApplication[]);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const selectedSku = skus.find((s) => s.id === selectedSkuId) ?? skus[0] ?? null;

  // Images for selected SKU
  const currentImages = selectedSkuId
    ? skuImages.filter((img) => img.sku_id === selectedSkuId).map((img) => img.image_url)
    : [];
  const galleryImages = currentImages.length > 0
    ? currentImages
    : product?.default_image_url
      ? [product.default_image_url]
      : [];

  // Price
  const unitPrice = selectedSku?.campaign_price ?? selectedSku?.price_eur ?? 0;
  const originalPrice = selectedSku?.price_eur ?? 0;
  const isCampaign = selectedSku?.campaign_price != null && selectedSku.campaign_price < originalPrice;
  const stockQty = selectedSku?.stock_quantity ?? 999;
  const outOfStock = stockQty === 0;
  const lowStock = stockQty > 0 && stockQty < 10;

  // Specs for selected SKU
  const currentSpecs = selectedSkuId
    ? skuSpecs.filter((s) => s.sku_id === selectedSkuId)
    : skuSpecs.filter((s) => s.sku_id === skus[0]?.id);

  async function handleAddToCart() {
    if (!selectedSku || outOfStock) return;
    await addItem(selectedSku.id, quantity, unitPrice);
    setAddedState("added");
    openDrawer();
    setTimeout(() => setAddedState("idle"), 1500);
  }

  // Accordion sections
  const accordionSections = [];

  const techItems = currentSpecs.filter((s) => s.spec_section === "technische_details");
  if (techItems.length > 0) {
    accordionSections.push({
      id: "technische-details",
      label: "Technische Details",
      content: (
        <div className="flex flex-col gap-2.5">
          {techItems.map((s) => (
            <div key={s.id} className="flex gap-4 text-base">
              <span className="text-slate-400 min-w-[140px] shrink-0">{s.spec_key}</span>
              <span className="text-slate-900">{s.spec_value}</span>
            </div>
          ))}
        </div>
      ),
    });
  }

  const anwendungItems = currentSpecs.filter((s) => s.spec_section === "anwendung");
  if (anwendungItems.length > 0) {
    accordionSections.push({
      id: "anwendung",
      label: "Anwendung",
      content: (
        <div className="flex flex-col gap-2">
          {anwendungItems.map((s) => (
            <div key={s.id} className="flex gap-4 text-base">
              <span className="text-slate-400 min-w-[140px] shrink-0">{s.spec_key}</span>
              <span className="text-slate-900">{s.spec_value}</span>
            </div>
          ))}
        </div>
      ),
    });
  }

  const maschinenItems = currentSpecs.filter((s) => s.spec_section === "maschinen");
  if (maschinenItems.length > 0) {
    accordionSections.push({
      id: "maschinen",
      label: "Geeignet für Maschinen",
      content: (
        <div className="flex flex-col gap-2">
          {maschinenItems.map((s) => (
            <div key={s.id} className="flex gap-4 text-base">
              <span className="text-slate-400 min-w-[140px] shrink-0">{s.spec_key}</span>
              <span className="text-slate-900">{s.spec_value}</span>
            </div>
          ))}
        </div>
      ),
    });
  }

  const suitableMaterials = materials.filter((m) => m.score > 0);
  if (suitableMaterials.length > 0) {
    accordionSections.push({
      id: "geeignet-fuer",
      label: "Geeignet für",
      content: (
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          {suitableMaterials.map((mat, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <p className="text-base text-slate-900 leading-snug">{mat.material_name}</p>
              <Dots count={mat.score} />
              <p className="text-sm text-slate-400">{SCORE_LABEL[mat.score] ?? mat.suitability}</p>
            </div>
          ))}
        </div>
      ),
    });
  }

  if (loading) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-slate-400 text-sm">Lädt…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-slate-500">Produkt nicht gefunden.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400 pt-5 pb-1">
        <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Home</Link>
        <span>/</span>
        <Link href="/katalog" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Katalog</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{product.display_name}</span>
      </nav>

      <div className="py-10 lg:grid lg:grid-cols-2 lg:gap-16">
        {/* Left: gallery */}
        <div>
          <ProductGallery
            images={galleryImages}
            placeholderBg={product.gallery_bg ?? "#e6eff5"}
            placeholderLabel={product.display_name.substring(0, 3).toUpperCase()}
            badge={product.badge ?? undefined}
          />
        </div>

        {/* Right: info */}
        <div className="mt-8 lg:mt-0">
          {/* Application tags */}
          {applications.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {applications.map((a) => (
                <span key={a.tag} className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full">
                  {a.tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight leading-snug mb-1">
            {product.display_name}
          </h1>
          {product.tagline && (
            <p className="text-slate-500 text-base mb-4">{product.tagline}</p>
          )}

          {/* Article number */}
          {selectedSku && (
            <p className="text-sm text-slate-400 mb-4">
              Art.-Nr.: {selectedSku.identnummer}
            </p>
          )}

          {/* Price */}
          {!loading && selectedSku && (
            <div className="mb-4">
              <div className="flex items-baseline gap-3 mb-1">
                <span className={`text-2xl font-extrabold ${isCampaign ? "text-[#9B242A]" : "text-slate-900"}`}>
                  {formatEur(unitPrice)}
                </span>
                {isCampaign && (
                  <span className="flex items-baseline gap-1">
                    <span className="text-base text-slate-400 line-through">{formatEur(originalPrice)}</span>
                    <span className="text-sm font-semibold text-[#9B242A]">
                      -{Math.round((1 - unitPrice / originalPrice) * 100)}%
                    </span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">zzgl. 19% MwSt.</p>
            </div>
          )}

          {/* Short description */}
          {product.short_description && (
            <p className="text-base text-slate-700 leading-relaxed mb-4">{product.short_description}</p>
          )}

          {/* Variant picker */}
          {skus.length > 1 && (
            <div className="mb-6">
              <V2VariantPicker
                skus={skus}
                selectedSkuId={selectedSkuId}
                onSelect={(sku) => setSelectedSkuId(sku.id)}
              />
            </div>
          )}

          {/* Stock warning */}
          {lowStock && (
            <p className="text-sm font-medium mb-3" style={{ color: "#D97706" }}>
              Nur noch {stockQty} auf Lager
            </p>
          )}

          {/* Add to cart */}
          {selectedSku && (
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
                disabled={outOfStock || loading}
                className="btn-black flex-1 justify-center"
                style={{ opacity: outOfStock || loading ? 0.6 : 1 }}
              >
                {outOfStock ? "Derzeit nicht verfügbar" : addedState === "added" ? "✓ Hinzugefügt" : "In den Warenkorb"}
              </button>
            </div>
          )}

          <OrderBenefits />
        </div>
      </div>

      {/* Accordion */}
      {accordionSections.length > 0 && (
        <div id="pdp-accordion" className="max-w-2xl pb-20">
          <ProductAccordion sections={accordionSections} defaultOpenIds={["technische-details"]} />
        </div>
      )}
    </div>
  );
}
