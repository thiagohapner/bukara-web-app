"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Footer from "@/components/Footer";
import { DEALS, X99_VARIANTS, type X99Variant } from "@/lib/data";
import { calculatePrice, formatEur } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";
import ProductGallery from "@/components/ProductGallery";

const DEAL_GALLERY: Record<string, { bg: string; label: string }> = {
  "x99-only":           { bg: "#e6eff5", label: "X99" },
  "x99-thermo-bundle":  { bg: "#f5ede8", label: "X99+HSK" },
  "x99-turbonesting-set": { bg: "#e8f7f6", label: "X99+TBN" },
};

function CheckIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function inputClass(extra = "") {
  return `w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A597]/20 focus:border-[#00A597] transition-colors ${extra}`;
}

type FormState = {
  company: string;
  vat: string;
  contact: string;
  email: string;
  phone: string;
  message: string;
};

function DealContent({ dealSlug }: { dealSlug: string }) {
  const router = useRouter();
  const deal = DEALS.find((d) => d.slug === dealSlug)!;
  const gallery = DEAL_GALLERY[dealSlug] ?? { bg: "#e6eff5", label: "SET" };;

  const [variants, setVariants] = useState<X99Variant[]>(X99_VARIANTS);
  const [selectedId, setSelectedId] = useState<string>(X99_VARIANTS[0].id);
  const [userHasSelected, setUserHasSelected] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [offerDbId, setOfferDbId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    company: "", vat: "", contact: "", email: "", phone: "", message: "",
  });

  useEffect(() => {
    async function load() {
      const [varResult, offerResult] = await Promise.all([
        supabase
          .from("product_variants")
          .select("id, sku, variant_name, original_price, campaign_price, sort_order")
          .eq("is_active", true)
          .order("sort_order"),
        supabase.from("offers").select("id").eq("slug", dealSlug).single(),
      ]);
      if (varResult.data && varResult.data.length > 0) {
        setVariants(varResult.data as X99Variant[]);
        setSelectedId((varResult.data as X99Variant[])[0].id);
      }
      if (offerResult.data) {
        setOfferDbId(offerResult.data.id);
      }
    }
    load();
  }, [dealSlug]);

  const selectedVariant = variants.find((v) => v.id === selectedId) ?? variants[0];

  const price = useMemo(() => {
    if (!selectedVariant) return null;
    return calculatePrice({
      selectedVariantCampaignPrice: selectedVariant.campaign_price,
      selectedVariantOriginalPrice: selectedVariant.original_price,
      fixedItems: deal.fixedItems,
      quantity,
      bulkDiscountThreshold: 500,
      bulkDiscountPercent: 10,
    });
  }, [selectedVariant, quantity, deal.fixedItems]);

  const amountToThreshold = price ? Math.max(0, 500 - price.campaignTotal) : 0;
  const campaignSavings = price ? round2(price.originalTotal - price.campaignTotal) : 0;
  const fixedCampaignTotal = deal.fixedItems.reduce((s, i) => s + i.campaignPrice, 0);
  const fixedOriginalTotal = deal.fixedItems.reduce((s, i) => s + i.originalPrice, 0);
  const minCampaignPrice = variants.length > 0
    ? Math.min(...variants.map(v => v.campaign_price)) + fixedCampaignTotal
    : fixedCampaignTotal;
  const minOriginalPrice = variants.length > 0
    ? variants.reduce((min, v) => v.campaign_price < min.campaign_price ? v : min, variants[0]).original_price + fixedOriginalTotal
    : fixedOriginalTotal;
  const selectedCampaignTotal = selectedVariant
    ? round2(selectedVariant.campaign_price + fixedCampaignTotal)
    : minCampaignPrice;
  const selectedOriginalTotal = selectedVariant
    ? round2(selectedVariant.original_price + fixedOriginalTotal)
    : minOriginalPrice;
  const SHIPPING_COST = 9.50;
  const mwst = price ? round2(price.finalTotal * 0.19) : 0;
  const shippingCost = price && !price.freeShippingApplied ? SHIPPING_COST : 0;
  const gesamtsumme = price ? round2(price.finalTotal + mwst + shippingCost) : 0;
  const originalGesamtsumme = price ? round2(price.originalTotal * 1.19 + SHIPPING_COST) : 0;
  const totalSavings = round2(originalGesamtsumme - gesamtsumme);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVariant || !price) return;
    setSubmitting(true);
    setSubmitError(null);
    const { error } = await supabase.from("inquiries").insert({
      offer_id: offerDbId,
      selected_x99_variant_id: selectedVariant.id,
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

  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10 pb-20">
      <div className="flex flex-col lg:flex-row gap-10 items-start">

      {/* Gallery */}
      <div className="w-full lg:w-[42%] flex-shrink-0 lg:sticky lg:top-[72px]">
        <ProductGallery
          images={deal.images ?? []}
          placeholderBg={gallery.bg}
          placeholderLabel={gallery.label}
        />
      </div>

      {/* Content + form */}
      <div className="flex-1 min-w-0">
      {/* Badge + title */}
      <span className="inline-flex text-[12px] font-bold bg-[#9B242A] text-white rounded-full px-3 py-1.5 leading-none tracking-wide mb-4">
        {deal.badge}
      </span>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
        {deal.title}
      </h1>
      <p className="text-slate-500 text-sm mb-4 leading-relaxed">{deal.subtitle}</p>

      <div className="flex items-baseline gap-3 mb-8">
        {!userHasSelected ? (
          <>
            <span className="text-2xl font-extrabold text-[#9B242A]">ab {formatEur(minCampaignPrice)}</span>
            <span className="text-base text-slate-400 line-through">ab {formatEur(minOriginalPrice)}</span>
          </>
        ) : (
          <>
            <span className="text-2xl font-extrabold text-[#9B242A]">{formatEur(selectedCampaignTotal)}</span>
            <span className="text-base text-slate-400 line-through">{formatEur(selectedOriginalTotal)}</span>
          </>
        )}
      </div>

      {/* Included products */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Enthaltene Produkte
        </p>
        <ul className="flex flex-col gap-2">
          {deal.includedProducts.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-slate-900">
              <span className="text-orange-500"><CheckIcon /></span>
              {p}
            </li>
          ))}
        </ul>
      </div>

      <div className="h-px bg-slate-100 mb-8" />

      {/* Variant selector */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
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

      {/* Quantity */}
      <div className="mb-8">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Menge
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 hover:border-[#00A597] hover:text-[#00A597] transition-colors text-lg font-bold select-none"
          >
            −
          </button>
          <span className="w-10 text-center text-base font-semibold text-slate-900">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 hover:border-[#00A597] hover:text-[#00A597] transition-colors text-lg font-bold select-none"
          >
            +
          </button>
        </div>
      </div>

      {/* Price summary */}
      {price && (
        <div className="mb-8 border border-slate-100 rounded-2xl p-6 bg-slate-50">

          {/* Preis */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-500">Preis</span>
            <span className="text-sm text-slate-500">{formatEur(price.originalTotal)}</span>
          </div>

          {/* Kampagnenrabatt */}
          {campaignSavings > 0 && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-500">Kampagnenrabatt ({deal.discountPercent}%)</span>
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
            <p className="mt-3 text-xs text-slate-400">
              Noch {formatEur(amountToThreshold)} bis zum Zusatzrabatt und kostenlosem Versand.
            </p>
          )}

        </div>
      )}

      <div className="h-px bg-slate-100 mb-8" />

      {/* Inquiry form */}
      <form onSubmit={handleSubmit} noValidate>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">
          Ihre Kontaktdaten
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Firmenname <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.company}
              onChange={field("company")}
              className={inputClass()}
              placeholder="Muster GmbH"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              USt-IdNr.
            </label>
            <input
              type="text"
              value={form.vat}
              onChange={field("vat")}
              className={inputClass()}
              placeholder="DE123456789"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Ansprechpartner <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.contact}
              onChange={field("contact")}
              className={inputClass()}
              placeholder="Max Mustermann"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              E-Mail <span className="text-orange-500">*</span>
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={field("email")}
              className={inputClass()}
              placeholder="anfrage@firma.de"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Telefon</label>
            <input
              type="tel"
              value={form.phone}
              onChange={field("phone")}
              className={inputClass()}
              placeholder="+49 (0) 123 456789"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Nachricht</label>
            <textarea
              rows={4}
              value={form.message}
              onChange={field("message")}
              className={inputClass("resize-none")}
              placeholder="Weitere Angaben oder Fragen zu Ihrer Anfrage..."
            />
          </div>
        </div>

        {submitError && (
          <p className="text-sm text-red-500 mb-4">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-orange"
          style={{ opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? "Wird gesendet…" : "Anfrage absenden"}
          {!submitting && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </form>
      </div>{/* end content col */}
      </div>{/* end flex row */}
    </section>
  );
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function AngebotDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const deal = DEALS.find((d) => d.slug === slug);
  if (!deal) notFound();

  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>
              Start
            </Link>
            <span>/</span>
            <Link href="/produkte" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>
              Produkte
            </Link>
            <span>/</span>
            <Link href="/angebote" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>
              Angebote
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">{deal.title}</span>
          </nav>
        </div>
        <DealContent dealSlug={slug} />
      </main>
      <Footer />
    </>
  );
}
