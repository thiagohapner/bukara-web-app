"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductGallery from "@/components/ProductGallery";
import ProductAccordion from "@/components/ProductAccordion";
import OrderBenefits from "@/components/OrderBenefits";
import V2VariantPicker from "@/components/V2VariantPicker";
import ProductAccessories from "@/components/ProductAccessories";
import { useCart } from "@/components/CartContext";
import { formatEur, unitPriceForQuantity } from "@/lib/pricing";
import type { V2Product, V2Sku, V2SkuImage, V2SkuSpec, V2ProductMaterial, V2ProductApplication } from "@/lib/v2/types";
import type { AccessoryItem } from "@/components/ProductAccessories";

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

interface Props {
  product: V2Product;
  skus: V2Sku[];
  skuImages: V2SkuImage[];
  skuSpecs: V2SkuSpec[];
  materials: V2ProductMaterial[];
  applications: V2ProductApplication[];
  accessories?: AccessoryItem[];
}

export default function KatalogProductContent({
  product,
  skus,
  skuImages,
  skuSpecs,
  materials,
  applications,
  accessories = [],
}: Props) {
  const { addV2Item, openDrawer } = useCart();

  const [selectedSkuId, setSelectedSkuId] = useState<string>(skus[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [addedState, setAddedState] = useState<"idle" | "added">("idle");

  const selectedSku = skus.find((s) => s.id === selectedSkuId) ?? skus[0] ?? null;

  const productName = product.display_name ?? product.base_name ?? "";

  const currentImages = selectedSkuId
    ? skuImages.filter((img) => img.sku_id === selectedSkuId).map((img) => img.image_url)
    : [];
  const galleryImages = currentImages.length > 0
    ? currentImages
    : product.default_image_url
      ? [product.default_image_url]
      : [];

  const isStaffel = !!selectedSku?.has_staffelpreis;
  const basePrice = selectedSku?.price_eur ?? 0;
  const displayPrice = selectedSku?.campaign_price ?? basePrice;
  const cartPrice = isStaffel
    ? unitPriceForQuantity(basePrice, true, quantity)
    : displayPrice;
  const originalPrice = basePrice;
  const isCampaign = !isStaffel && selectedSku?.campaign_price != null && selectedSku.campaign_price < originalPrice;
  const stockQty = selectedSku?.stock_quantity ?? 999;
  const outOfStock = stockQty === 0;
  const lowStock = stockQty > 0 && stockQty < 10;

  const currentSpecs = selectedSkuId
    ? skuSpecs.filter((s) => s.sku_id === selectedSkuId)
    : skuSpecs.filter((s) => s.sku_id === skus[0]?.id);

  async function handleAddToCart() {
    if (!selectedSku || outOfStock) return;
    await addV2Item(selectedSku.id, quantity, cartPrice);
    setAddedState("added");
    openDrawer();
    setTimeout(() => setAddedState("idle"), 1500);
  }

  function scrollToAccordion(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById("pdp-accordion")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const accordionSections = [];

  function StaffelpreisTable() {
    const tiers = [
      { label: "1–4 Stück",   price: unitPriceForQuantity(basePrice, true, 1) },
      { label: "5–9 Stück",   price: unitPriceForQuantity(basePrice, true, 5) },
      { label: "ab 10 Stück", price: unitPriceForQuantity(basePrice, true, 10) },
    ];
    return (
      <div className="mb-6">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Staffelpreise</p>
        <table className="w-full text-sm border border-slate-100 rounded-lg overflow-hidden">
          <tbody>
            {tiers.map(({ label, price }) => (
              <tr key={label}>
                <td className="py-2 px-3 text-slate-500">{label}</td>
                <td className="py-2 px-3 text-right text-slate-500">{formatEur(price)} / Stk.</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function SpecRow({ s }: { s: { id: string; spec_key: string | null; spec_value: string } }) {
    if (s.spec_key && s.spec_key !== "details") {
      return (
        <div className="flex gap-4 text-base">
          <span className="text-slate-400 min-w-[140px] shrink-0">{s.spec_key}</span>
          <span className="text-slate-900">{s.spec_value}</span>
        </div>
      );
    }
    return <p className="text-base text-slate-700 leading-snug">{s.spec_value}</p>;
  }

  const techItems = currentSpecs.filter((s) => s.spec_section === "technische_details");
  if (techItems.length > 0) {
    accordionSections.push({
      id: "technische-details",
      label: "Technische Details",
      content: (
        <div className="flex flex-col gap-2.5">
          {techItems.map((s) => <SpecRow key={s.id} s={s} />)}
        </div>
      ),
    });
  }

  if (applications.length > 0) {
    accordionSections.push({
      id: "anwendung",
      label: "Anwendung",
      content: (
        <div className="flex flex-wrap gap-2">
          {applications.map((a) => (
            <span key={a.tag} className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-pill">
              {a.tag}
            </span>
          ))}
        </div>
      ),
    });
  }

  const anwendungItems = currentSpecs.filter((s) => s.spec_section === "anwendung");
  if (anwendungItems.length > 0) {
    accordionSections.push({
      id: "anwendung-details",
      label: "Anwendungsdetails",
      content: (
        <div className="flex flex-col gap-2">
          {anwendungItems.map((s) => <SpecRow key={s.id} s={s} />)}
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
          {maschinenItems.map((s) => <SpecRow key={s.id} s={s} />)}
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

  return (
    <>
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-1">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <Link href="/katalog" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Katalog</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">{productName}</span>
        </nav>
      </div>

      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-20">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-[5%] items-start">

          {/* Left: sticky gallery — 55% */}
          <div className="w-full lg:w-[55%] flex-shrink-0 lg:sticky lg:top-[72px]">
            <ProductGallery
              images={galleryImages}
              placeholderBg={product.gallery_bg ?? "#e6eff5"}
              placeholderLabel={(productName).substring(0, 3).toUpperCase()}
              badge={product.badge ?? undefined}
            />
          </div>

          {/* Right: info + accordions — 40% */}
          <div className="w-full lg:w-[40%] flex-shrink-0 min-w-0">

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
              {productName}
            </h1>

            {product.tagline && (
              <p className="text-slate-500 text-base mb-4">{product.tagline}</p>
            )}

            {selectedSku && (
              <p className="text-sm text-slate-400 mb-4">
                Bukara-Art.-Nr.: {selectedSku.bukara_article_number}
              </p>
            )}

            {selectedSku && (
              <div className="mb-4">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className={`text-2xl font-extrabold ${isCampaign ? "text-[#9B242A]" : "text-slate-900"}`}>
                    {formatEur(displayPrice)}
                  </span>
                  {isCampaign && (
                    <span className="flex items-baseline gap-1">
                      <span className="text-base text-slate-400 line-through">{formatEur(originalPrice)}</span>
                      <span className="text-sm font-semibold text-[#9B242A]">
                        -{Math.round((1 - displayPrice / originalPrice) * 100)}%
                      </span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">zzgl. 19% MwSt.</p>
              </div>
            )}

            {isStaffel && selectedSku && (
              <StaffelpreisTable />
            )}

            {product.description && (
              <p className="text-base text-slate-900 leading-relaxed mb-2">{product.description}</p>
            )}

            {accordionSections.length > 0 && (
              <a
                href="#pdp-accordion"
                onClick={scrollToAccordion}
                className="inline-block text-base text-slate-900 underline underline-offset-2 mb-8 cursor-pointer"
              >
                Technische Details
              </a>
            )}

            {skus.length > 1 && (
              <div className="mb-6">
                <V2VariantPicker
                  skus={skus}
                  selectedSkuId={selectedSkuId}
                  onSelect={(sku) => setSelectedSkuId(sku.id)}
                />
              </div>
            )}

            {lowStock && (
              <p className="text-sm font-medium mb-3" style={{ color: "#D97706" }}>
                Nur noch {stockQty} auf Lager
              </p>
            )}

            {selectedSku && (
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center border border-slate-800 rounded-sm select-none h-12">
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
                  disabled={outOfStock}
                  className="btn-black flex-1 justify-center"
                  style={{ opacity: outOfStock ? 0.6 : 1 }}
                >
                  {outOfStock ? "Derzeit nicht verfügbar" : addedState === "added" ? "✓ Hinzugefügt" : "In den Warenkorb"}
                </button>
              </div>
            )}

            <OrderBenefits />

            <ProductAccessories accessories={accessories} linkBase="/katalog" />

            {accordionSections.length > 0 && (
              <div id="pdp-accordion" className="mt-8 scroll-mt-24">
                <ProductAccordion sections={accordionSections} defaultOpenIds={["technische-details"]} />
              </div>
            )}

          </div>
        </div>
      </section>
    </>
  );
}
