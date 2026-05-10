"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import { BUKARA_PRODUCTS, X99_VARIANTS, DEALS, type X99Variant } from "@/lib/data";
import { calculatePrice, formatEur } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";

const GALLERY_CONFIG: Record<string, { bg: string; label: string }> = {
  "x99-fraeser":                      { bg: "#e6eff5", label: "X99" },
  "thermo-schrumpffutter":             { bg: "#f5ede8", label: "HSK" },
  "turbonesting-turbinen-komplett-set": { bg: "#e8f7f6", label: "TBN" },
};

const PRODUCT_DEALS: Record<string, string[]> = {
  "x99-fraeser":                      ["x99-only", "x99-thermo-bundle", "x99-turbonesting-set"],
  "thermo-schrumpffutter":             ["x99-thermo-bundle"],
  "turbonesting-turbinen-komplett-set": ["x99-turbonesting-set"],
};

function inputClass(extra = "") {
  return `w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A597]/20 focus:border-[#00A597] transition-colors ${extra}`;
}

type FormState = {
  company: string;
  vat: string;
  contact: string;
  email: string;
  phone: string;
  message: string;
};

function CheckIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ProduktContent({ slug }: { slug: string }) {
  const router = useRouter();
  const product = BUKARA_PRODUCTS.find((p) => p.slug === slug)!;
  const relatedDeals = DEALS.filter((d) => (PRODUCT_DEALS[slug] ?? []).includes(d.slug));
  const gallery = GALLERY_CONFIG[slug] ?? { bg: "#e6eff5", label: slug.substring(0, 3).toUpperCase() };

  const [variants, setVariants] = useState<X99Variant[]>(product.hasVariants ? X99_VARIANTS : []);
  const [selectedId, setSelectedId] = useState<string>(product.hasVariants ? X99_VARIANTS[0].id : "");
  const [userHasSelected, setUserHasSelected] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ company: "", vat: "", contact: "", email: "", phone: "", message: "" });

  useEffect(() => {
    if (!product.hasVariants) return;
    supabase
      .from("product_variants")
      .select("id, sku, variant_name, original_price, campaign_price, sort_order")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setVariants(data as X99Variant[]);
          setSelectedId((data as X99Variant[])[0].id);
        }
      });
  }, [product.hasVariants]);

  const selectedVariant = product.hasVariants ? variants.find((v) => v.id === selectedId) ?? variants[0] : null;
  const variantCampaignPrice = selectedVariant?.campaign_price ?? product.campaignPrice ?? product.originalPrice ?? 0;
  const variantOriginalPrice = selectedVariant?.original_price ?? product.originalPrice ?? 0;

  const price = useMemo(() => calculatePrice({
    selectedVariantCampaignPrice: variantCampaignPrice,
    selectedVariantOriginalPrice: variantOriginalPrice,
    fixedItems: [],
    quantity,
    bulkDiscountThreshold: 500,
    bulkDiscountPercent: 10,
  }), [variantCampaignPrice, variantOriginalPrice, quantity]);

  const campaignSavings = Math.round((price.originalTotal - price.campaignTotal) * 100) / 100;
  const amountToThreshold = Math.max(0, 500 - price.campaignTotal);
  const discountPercent = price.originalTotal > 0 ? Math.round((campaignSavings / price.originalTotal) * 100) : 0;
  const minCampaignPrice = product.hasVariants && variants.length > 0
    ? Math.min(...variants.map(v => v.campaign_price))
    : variantCampaignPrice;
  const minOriginalPrice = product.hasVariants && variants.length > 0
    ? Math.min(...variants.map(v => v.original_price))
    : variantOriginalPrice;
  const SHIPPING_COST = 9.50;
  const mwst = Math.round(price.finalTotal * 0.19 * 100) / 100;
  const shippingCost = price.freeShippingApplied ? 0 : SHIPPING_COST;
  const gesamtsumme = Math.round((price.finalTotal + mwst + shippingCost) * 100) / 100;
  const originalGesamtsumme = Math.round((price.originalTotal * 1.19 + SHIPPING_COST) * 100) / 100;
  const totalSavings = Math.round((originalGesamtsumme - gesamtsumme) * 100) / 100;

  function fieldHandler(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    const { error } = await supabase.from("inquiries").insert({
      offer_id: null,
      product_name: product.name,
      selected_x99_variant_id: selectedVariant?.id ?? null,
      quantity,
      company_name: form.company,
      vat_number: form.vat || null,
      contact_name: form.contact,
      email: form.email,
      phone: form.phone || null,
      message: form.message || null,
      original_total: price.originalTotal,
      campaign_total: price.campaignTotal,
      bulk_discount_applied: price.bulkDiscountApplied,
      bulk_discount_amount: price.bulkDiscountAmount,
      final_total: price.finalTotal,
      free_shipping_applied: price.freeShippingApplied,
      status: "new",
    });
    setSubmitting(false);
    if (error) {
      setSubmitError("Ihre Anfrage konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut.");
    } else {
      router.push("/danke");
    }
  }

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10 pb-20">
      <div className="flex flex-col lg:flex-row gap-10 items-start">

        {/* Gallery */}
        <div className="w-full lg:w-[42%] flex-shrink-0 lg:sticky lg:top-[72px]">
          <ProductGallery
            images={product.images ?? []}
            placeholderBg={gallery.bg}
            placeholderLabel={gallery.label}
            badge={product.badge}
          />
        </div>

        {/* Content + form */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-1">
            {product.name}
          </h1>
          <p className="text-sm font-semibold text-slate-500 mb-4">{product.tagline}</p>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">{product.description}</p>

          <div className="flex items-baseline gap-3 mb-8">
            {product.hasVariants ? (
              !userHasSelected ? (
                <>
                  <span className="text-2xl font-extrabold text-[#9B242A]">ab {formatEur(minCampaignPrice)}</span>
                  <span className="text-base text-slate-400 line-through">ab {formatEur(minOriginalPrice)}</span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-extrabold text-[#9B242A]">{formatEur(variantCampaignPrice)}</span>
                  <span className="text-base text-slate-400 line-through">{formatEur(variantOriginalPrice)}</span>
                </>
              )
            ) : product.campaignPrice != null ? (
              <>
                <span className="text-2xl font-extrabold text-[#9B242A]">{formatEur(product.campaignPrice)}</span>
                <span className="text-base text-slate-400 line-through">{formatEur(product.originalPrice ?? 0)}</span>
              </>
            ) : product.originalPrice != null ? (
              <span className="text-2xl font-extrabold text-slate-900">{formatEur(product.originalPrice)}</span>
            ) : null}
          </div>

          <div className="h-px bg-slate-100 mb-8" />

          {/* Variant selector */}
          {product.hasVariants && variants.length > 0 && (
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                X99 Variante wählen
              </label>
              <select
                value={selectedId}
                onChange={(e) => { setSelectedId(e.target.value); setUserHasSelected(true); }}
                className={inputClass()}
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.variant_name} · {formatEur(v.campaign_price)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
              Menge
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-900 hover:border-[#00A597] hover:text-[#00A597] transition-colors text-lg font-bold select-none"
              >
                −
              </button>
              <span className="w-10 text-center text-base font-semibold text-slate-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-900 hover:border-[#00A597] hover:text-[#00A597] transition-colors text-lg font-bold select-none"
              >
                +
              </button>
            </div>
          </div>

          {/* Price summary */}
          <div className="mb-8 border border-slate-100 rounded-2xl p-6 bg-slate-50">

            {/* Preis */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-500">Preis</span>
              <span className="text-sm text-slate-500">{formatEur(price.originalTotal)}</span>
            </div>

            {/* Kampagnenrabatt */}
            {campaignSavings > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500">Kampagnenrabatt ({discountPercent}%)</span>
                <span className="text-sm text-slate-900 font-medium">−{formatEur(campaignSavings)}</span>
              </div>
            )}

            {/* Zusatzrabatt */}
            {price.bulkDiscountApplied && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500">Zusatzrabatt (10%)</span>
                <span className="text-sm text-slate-900 font-medium">−{formatEur(price.bulkDiscountAmount)}</span>
              </div>
            )}

            {/* Zwischensumme */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700">Zwischensumme</span>
              <span className="text-sm font-semibold text-slate-700">{formatEur(price.finalTotal)}</span>
            </div>

            <div className="border-t border-slate-200 my-3" />

            {/* MwSt */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-500">19% MwSt.</span>
              <span className="text-sm text-slate-500">{formatEur(mwst)}</span>
            </div>

            {/* Shipping */}
            {price.freeShippingApplied ? (
              <div className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "#00A597" }}>
                <CheckIcon />
                Kostenloser Versand
              </div>
            ) : (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500">Standard-Lieferung</span>
                <span className="text-sm text-slate-500">{formatEur(SHIPPING_COST)}</span>
              </div>
            )}

            <div className="border-t border-slate-200 my-3" />

            {/* Gesamtsumme */}
            <div className="flex justify-between items-baseline">
              <span className="text-base font-extrabold text-slate-900">Gesamtsumme inkl. MwSt.</span>
              <div className="flex flex-col items-end">
                <span className="text-base font-extrabold text-slate-900">{formatEur(gesamtsumme)}</span>
                {totalSavings > 0.005 && (
                  <span className="text-sm text-slate-400 line-through">{formatEur(originalGesamtsumme)}</span>
                )}
              </div>
            </div>

            {/* Savings badge */}
            {totalSavings > 0.005 && (
              <div className="mt-3 rounded-xl px-4 py-2.5 flex justify-between items-center" style={{ backgroundColor: "rgba(0,165,151,0.08)" }}>
                <span className="text-sm font-semibold" style={{ color: "#00A597" }}>Ihr Ersparnis</span>
                <span className="text-sm font-bold" style={{ color: "#00A597" }}>{formatEur(totalSavings)}</span>
              </div>
            )}

            {/* Threshold message */}
            {amountToThreshold > 0.005 && (
              <p className="mt-3 text-xs text-slate-500">
                Noch {formatEur(amountToThreshold)} bis zum Zusatzrabatt und kostenlosem Versand.
              </p>
            )}

          </div>

          <div className="h-px bg-slate-100 mb-8" />

          {/* Inquiry form */}
          <form onSubmit={handleSubmit} noValidate>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5">
              Ihre Kontaktdaten
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Firmenname <span className="text-orange-500">*</span>
                </label>
                <input type="text" required value={form.company} onChange={fieldHandler("company")} className={inputClass()} placeholder="Muster GmbH" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">USt-IdNr.</label>
                <input type="text" value={form.vat} onChange={fieldHandler("vat")} className={inputClass()} placeholder="DE123456789" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Ansprechpartner <span className="text-orange-500">*</span>
                </label>
                <input type="text" required value={form.contact} onChange={fieldHandler("contact")} className={inputClass()} placeholder="Max Mustermann" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  E-Mail <span className="text-orange-500">*</span>
                </label>
                <input type="email" required value={form.email} onChange={fieldHandler("email")} className={inputClass()} placeholder="anfrage@firma.de" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Telefon</label>
                <input type="tel" value={form.phone} onChange={fieldHandler("phone")} className={inputClass()} placeholder="+49 (0) 123 456789" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Nachricht</label>
                <textarea rows={4} value={form.message} onChange={fieldHandler("message")} className={inputClass("resize-none")} placeholder="Weitere Angaben oder Fragen zu Ihrer Anfrage..." />
              </div>
            </div>

            {submitError && <p className="text-sm text-red-500 mb-4">{submitError}</p>}

            <button type="submit" disabled={submitting} className="btn-orange" style={{ opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Wird gesendet…" : "Anfrage absenden"}
              {!submitting && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              )}
            </button>
          </form>

          {/* Deal chips */}
          {relatedDeals.length > 0 && (
            <div className="mt-10 pt-8 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                In folgenden Angeboten verfügbar
              </p>
              <div className="flex flex-wrap gap-2">
                {relatedDeals.map((deal) => (
                  <Link
                    key={deal.slug}
                    href={`/angebote/${deal.slug}`}
                    className="border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-900 hover:border-[#00A597] hover:text-[#00A597] transition-colors"
                    style={{ textDecoration: "none" }}
                  >
                    {deal.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ProduktDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const product = BUKARA_PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href="/produkte" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Produkte</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">{product.name}</span>
          </nav>
        </div>
        <ProduktContent slug={slug} />
      </main>
      <Footer />
    </>
  );
}
