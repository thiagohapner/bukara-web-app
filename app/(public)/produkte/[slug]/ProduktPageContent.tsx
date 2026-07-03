"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import ProductAccordion from "@/components/ProductAccordion";
import CustomSelect from "@/components/CustomSelect";
import ProductAccessories, { type AccessoryItem } from "@/components/ProductAccessories";
import OrderBenefits from "@/components/OrderBenefits";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/components/CartContext";
import {
  type BukaraSku, type ProductSpec, type ProductMaterial, type ProductCuttingData, type ProductAccessory,
} from "@/lib/data";
import { formatEur } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

interface PDPProps {
  productName: string;
  description: string;
  skus: BukaraSku[];
  specs: ProductSpec[];
  materials: ProductMaterial[];
  cuttingData: ProductCuttingData[];
  accessories: AccessoryItem[];
  loading: boolean;
}

// ─── Price + cart block ───────────────────────────────────────────────────────

function PriceAndCart({
  description,
  skus,
  accessories,
  loading,
}: {
  description: string;
  skus: BukaraSku[];
  accessories: AccessoryItem[];
  loading: boolean;
}) {
  const { addItem, openDrawer } = useCart();
  const [selectedSkuId, setSelectedSkuId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addedState, setAddedState] = useState<"idle" | "added">("idle");

  useEffect(() => {
    if (skus.length > 0 && !selectedSkuId) setSelectedSkuId(skus[0].id);
  }, [skus, selectedSkuId]);

  const selectedSku = skus.find((s) => s.id === selectedSkuId) ?? skus[0] ?? null;
  const unitPrice = selectedSku?.campaign_price ?? selectedSku?.price ?? 0;
  const originalPrice = selectedSku?.price ?? 0;
  const stockQty = selectedSku?.stock_quantity ?? 999;
  const outOfStock = stockQty === 0;
  const lowStock = stockQty > 0 && stockQty < 10;

  async function handleAddToCart() {
    if (!selectedSku || outOfStock) return;
    await addItem(selectedSku.id, quantity, unitPrice);
    setAddedState("added");
    openDrawer();
    setTimeout(() => setAddedState("idle"), 1500);
  }

  function scrollToAccordion(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById("pdp-accordion")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {selectedSku && (
        <p className="text-sm text-neutral-400 mb-4">Artikel-Nr.: {selectedSku.artikel_nr}</p>
      )}

      {!loading && skus.length > 0 && (
        <div className="mb-4">
          <div className="flex items-baseline gap-3 mb-1">
            <span className={`text-2xl font-bold ${selectedSku?.campaign_price != null ? "text-sale" : "text-slate-900"}`}>{formatEur(unitPrice)}</span>
            {selectedSku?.campaign_price != null && originalPrice > unitPrice && (
              <span className="flex items-baseline gap-1">
                <span className="text-base text-neutral-400 line-through">{formatEur(originalPrice)}</span>
                <span className="text-sm font-semibold text-sale">
                  -{Math.round((1 - unitPrice / originalPrice) * 100)}%
                </span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400">zzgl. 19% MwSt.</p>
        </div>
      )}

      {description && (
        <p className="text-base text-slate-900 leading-relaxed mb-2">{description}</p>
      )}

      <a
        href="#pdp-accordion"
        onClick={scrollToAccordion}
        className="inline-block text-base text-slate-900 underline underline-offset-2 mb-8 cursor-pointer"
      >
        Technische Details
      </a>

      {skus.length > 1 && (
        <div className="mb-8">
          <p className="text-base font-bold text-slate-900 mb-2">Ausführung</p>
          <CustomSelect
            value={selectedSkuId}
            onChange={setSelectedSkuId}
            options={skus.map((s) => ({
              value: s.id,
              label: `${s.variant_label} · ${formatEur(s.campaign_price ?? s.price)}`,
            }))}
          />
        </div>
      )}

      {lowStock && (
        <p className="text-sm font-medium mb-3" style={{ color: "#D97706" }}>
          Nur noch {stockQty} auf Lager
        </p>
      )}

      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center border border-slate-800 rounded-sm select-none h-12">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 h-full flex items-center justify-center text-neutral-400 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <span className="min-w-[1.75rem] text-center text-sm font-semibold text-slate-900 px-1">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 h-full flex items-center justify-center text-neutral-400 hover:text-slate-900 transition-colors"
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
          {outOfStock
            ? "Derzeit nicht verfügbar"
            : addedState === "added"
              ? "✓ Hinzugefügt"
              : "In den Warenkorb"}
        </button>
      </div>
      <OrderBenefits />

      <ProductAccessories accessories={accessories} />
    </>
  );
}

// ─── PDP layout ───────────────────────────────────────────────────────────────

function PDPContent({ productName, description, skus, specs, materials, cuttingData, accessories, loading }: PDPProps) {
  const accordionSections = [];

  const techItems = specs.filter((s) => s.spec_section === "technische_details");
  if (techItems.length > 0) {
    accordionSections.push({
      id: "technische-details",
      label: "Technische Details",
      content: (
        <div className="flex flex-col gap-2.5">
          {techItems.map((s) => (
            <p key={s.id} className="text-base text-neutral-700 leading-snug">{s.spec_value}</p>
          ))}
        </div>
      ),
    });
  }

  const anwendungItems = specs.filter((s) => s.spec_section === "anwendung");
  const maschinenItems = specs.filter((s) => s.spec_section === "maschinen");
  if (anwendungItems.length > 0) {
    accordionSections.push({
      id: "anwendung",
      label: "Anwendung",
      content: (
        <div className="flex flex-col gap-2">
          {anwendungItems.map((s) => (
            <p key={s.id} className="text-base text-neutral-700">{s.spec_value}</p>
          ))}
        </div>
      ),
    });
  }
  if (maschinenItems.length > 0) {
    accordionSections.push({
      id: "maschinen",
      label: "Geeignet für Maschinen",
      content: (
        <div className="flex flex-col gap-2">
          {maschinenItems.map((s) => (
            <p key={s.id} className="text-base text-neutral-700">{s.spec_value}</p>
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
          {materials
            .filter(mat => mat.suitability !== "nicht geeignet")
            .map((mat) => {
              const dotCount =
                mat.suitability === "sehr gut geeignet" ? 3 :
                mat.suitability === "gut geeignet" ? 2 : 1;
              const label = mat.suitability.charAt(0).toUpperCase() + mat.suitability.slice(1);
              return (
                <div key={mat.id} className="flex flex-col gap-1.5">
                  <p className="text-base text-slate-900 leading-snug">{mat.material_name}</p>
                  <Dots count={dotCount} />
                  <p className="text-sm text-neutral-400">{label}</p>
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
              <th className="pb-3 pr-6 text-left text-base text-neutral-400 font-normal">ø</th>
              <th className="pb-3 pr-6 text-left text-base text-neutral-400 font-normal">Vorschub</th>
              <th className="pb-3 text-left text-base text-neutral-400 font-normal">Drehzahl</th>
            </tr>
          </thead>
          <tbody>
            {cuttingData.map((row) => (
              <tr key={row.id} className="border-t border-neutral-100">
                <td className="py-2.5 pr-6 text-base text-slate-900">{row.diameter}</td>
                <td className="py-2.5 pr-6 text-base text-neutral-700">{row.feed_rate}</td>
                <td className="py-2.5 text-base text-neutral-700">{row.rpm_range}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    });
  }

  return (
    <div className="w-full lg:w-[40%] flex-shrink-0 min-w-0">
      <h1 className="heading-h3 mb-2">
        {productName}
      </h1>
      <PriceAndCart description={description} skus={skus} accessories={accessories} loading={loading} />
      {accordionSections.length > 0 && (
        <div id="pdp-accordion" className="mt-8 scroll-mt-24">
          <ProductAccordion sections={accordionSections} defaultOpenIds={["technische-details"]} />
        </div>
      )}
    </div>
  );
}

// ─── Main export (receives slug from server-component shell) ──────────────────

export default function ProduktPageContent({ slug }: { slug: string }) {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [galleryBg, setGalleryBg] = useState("#e6eff5");
  const [galleryLabel, setGalleryLabel] = useState("");
  const [badge, setBadge] = useState<string | undefined>(undefined);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [skus, setSkus] = useState<BukaraSku[]>([]);
  const [specs, setSpecs] = useState<ProductSpec[]>([]);
  const [materials, setMaterials] = useState<ProductMaterial[]>([]);
  const [cuttingData, setCuttingData] = useState<ProductCuttingData[]>([]);
  const [accessories, setAccessories] = useState<AccessoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: productRow } = await supabase
        .from("products")
        .select("id, name, badge, gallery_bg, gallery_label, long_description")
        .eq("slug", slug)
        .single();

      if (!productRow) { setLoading(false); return; }

      setProductName(productRow.name);
      setDescription(productRow.long_description ?? "");
      setGalleryBg(productRow.gallery_bg ?? "#e6eff5");
      setGalleryLabel(productRow.gallery_label ?? slug.substring(0, 3).toUpperCase());
      setBadge(productRow.badge ?? undefined);

      const productId: string = productRow.id;

      const [skuRes, specRes, matRes, cutRes, accRes, imagesRes] = await Promise.all([
        supabase.from("skus").select("*").eq("product_id", productId).eq("is_active", true).order("sort_order"),
        supabase.from("product_specs").select("*").eq("product_id", productId).order("sort_order"),
        supabase.from("product_materials").select("*").eq("product_id", productId).order("sort_order"),
        supabase.from("product_cutting_data").select("*").eq("product_id", productId).order("sort_order"),
        supabase.from("product_accessories").select("*").eq("product_id", productId).order("sort_order"),
        supabase.from("product_images").select("image_url").eq("product_id", productId).order("sort_order"),
      ]);

      setSkus((skuRes.data ?? []) as BukaraSku[]);
      setSpecs((specRes.data ?? []) as ProductSpec[]);
      setMaterials((matRes.data ?? []) as ProductMaterial[]);
      setCuttingData((cutRes.data ?? []) as ProductCuttingData[]);
      setProductImages((imagesRes.data ?? []).map((r: { image_url: string }) => r.image_url));

      const accRows = (accRes.data ?? []) as ProductAccessory[];
      if (accRows.length > 0) {
        const accProductIds = accRows.map((r) => r.accessory_product_id);
        const [{ data: accProductsData }, { data: accImagesData }, { data: accSkuData }] = await Promise.all([
          supabase.from("products").select("id, slug, name").in("id", accProductIds),
          supabase.from("product_images").select("product_id, image_url").in("product_id", accProductIds).order("sort_order"),
          supabase.from("skus").select("*").in("product_id", accProductIds).eq("is_active", true).order("sort_order"),
        ]);

        const accProductMap = Object.fromEntries(
          (accProductsData ?? []).map((p: { id: string; slug: string; name: string }) => [p.id, p])
        );
        const accFirstImage: Record<string, string> = {};
        for (const img of (accImagesData ?? []) as Array<{ product_id: string; image_url: string }>) {
          if (!accFirstImage[img.product_id]) accFirstImage[img.product_id] = img.image_url;
        }

        setAccessories(accRows.map((row) => {
          const acc = accProductMap[row.accessory_product_id] as { id: string; slug: string; name: string } | undefined;
          return {
            id: row.id,
            accessory_product_id: row.accessory_product_id,
            sort_order: row.sort_order,
            slug: acc?.slug ?? "",
            name: acc?.name ?? "",
            images: accFirstImage[row.accessory_product_id] ? [accFirstImage[row.accessory_product_id]] : [],
            skus: ((accSkuData ?? []) as BukaraSku[])
              .filter((s) => s.product_id === row.accessory_product_id)
              .map((s) => ({ id: s.id, variant_label: s.variant_label, price_eur: s.price, campaign_price: s.campaign_price })),
          };
        }));
      }

      setLoading(false);
    }
    load();
  }, [slug]);

  const props: PDPProps = { productName, description, skus, specs, materials, cuttingData, accessories, loading };

  return (
    <>
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-1">
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Link href="/" className="hover:text-neutral-600 transition-colors" style={{ textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <Link href="/produkte" className="hover:text-neutral-600 transition-colors" style={{ textDecoration: "none" }}>Produkte</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">{productName || "…"}</span>
        </nav>
      </div>
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-20">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-[5%] items-start">
          <div className="w-full lg:w-[55%] flex-shrink-0 lg:sticky lg:top-[72px]">
            <ProductGallery
              images={productImages}
              placeholderBg={galleryBg}
              placeholderLabel={galleryLabel}
              badge={badge}
            />
          </div>
          <PDPContent {...props} />
        </div>
      </section>
    </>
  );
}
