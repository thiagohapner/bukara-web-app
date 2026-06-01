"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { useCart } from "@/components/CartContext";
import { cartTotals, formatEur } from "@/lib/pricing";
import { submitOrder } from "@/app/actions/submitOrder";
import { FileText, Clock, Check, Phone, Mail, ArrowRight } from "lucide-react";

function inputClass(extra = "") {
  return `w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A597]/20 focus:border-[#00A597] transition-colors ${extra}`;
}

type FormState = {
  firmenname: string;
  ust_idnr: string;
  ansprechpartner: string;
  email: string;
  telefon: string;
  nachricht: string;
};

function TrustItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <span style={{ color: "#00A597" }}>{icon}</span>
      {text}
    </div>
  );
}

function OrderSummary() {
  const { items } = useCart();
  const totals = cartTotals(items);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm mb-4">Ihr Warenkorb ist leer.</p>
        <Link href="/katalog" className="btn-orange" style={{ textDecoration: "none" }}>
          Produkte entdecken
        </Link>
      </div>
    );
  }

  const campaignSavings = items.reduce((sum, item) => {
    const original = item.sku?.price ?? item.unit_price;
    return sum + (original - item.unit_price) * item.quantity;
  }, 0);
  const totalSavings = Math.round((campaignSavings + totals.bulkDiscount) * 100) / 100;

  return (
    <>
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5">
          Ihre Bestellung
        </p>

        <ul className="flex flex-col gap-4 mb-6">
          {items.map((item) => {
            const isDeal = item.deal_id !== null;
            const name = isDeal
              ? (item.deal?.title ?? "Angebot")
              : (item.sku?.product?.name ?? item.v2Sku?.product?.display_name ?? item.v2Sku?.product?.base_name ?? "Produkt");
            const variantLabel = isDeal ? item.selected_sku?.variant_label : (item.sku?.variant_label ?? item.v2Sku?.variant_label);
            const artikelNr = isDeal ? item.selected_sku?.artikel_nr : (item.sku?.artikel_nr ?? item.v2Sku?.identnummer);
            const hasStaffel = item.v2Sku?.has_staffelpreis ?? false;
            return (
              <li key={item.id} className="flex justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{name}</p>
                  {variantLabel && <p className="text-xs text-slate-500 mt-0.5">{variantLabel}</p>}
                  {artikelNr && <p className="text-[11px] text-slate-400 mt-0.5">Art.-Nr.: {artikelNr}</p>}
                  {hasStaffel && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.quantity >= 10
                        ? "Mengenstaffel: ab 10 Stück −10%"
                        : item.quantity >= 5
                          ? "Mengenstaffel: 5–9 Stück Standardpreis"
                          : "Mengenstaffel: 1–4 Stück +20% Mindermengenzuschlag"}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-0.5">× {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                  {formatEur(item.unit_price * item.quantity)}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-slate-200 pt-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Zwischensumme</span>
            <span>{formatEur(totals.subtotal)}</span>
          </div>
          {totals.bulkDiscountApplied && (
            <div className="flex justify-between font-medium" style={{ color: "#00A597" }}>
              <span>Zusatzrabatt (10%)</span>
              <span>−{formatEur(totals.bulkDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-500">
            <span>19% MwSt.</span>
            <span>{formatEur(totals.vat)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Versand</span>
            <span>
              {totals.shipping === 0
                ? <span style={{ color: "#00A597" }} className="font-medium">Kostenlos</span>
                : formatEur(totals.shipping)}
            </span>
          </div>
          {totalSavings > 0 && (
            <div className="flex justify-between font-semibold rounded-xl px-3 py-2.5" style={{ background: "#e8f7f6", color: "#00A597" }}>
              <span>Ihr Ersparnis</span>
              <span>−{formatEur(totalSavings)}</span>
            </div>
          )}
          <div className="h-px bg-slate-200 my-1" />
          <div className="flex justify-between font-extrabold text-slate-900 text-base">
            <span>Gesamt inkl. MwSt.</span>
            <span>{formatEur(totals.gross)}</span>
          </div>
        </div>
      </div>

      {/* Contact block */}
      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
        <p className="text-sm font-semibold text-slate-900 mb-1">Noch Fragen?</p>
        <p className="text-xs text-slate-500 mb-3">Wir beraten Sie gerne – persönlich und unverbindlich.</p>
        <a
          href="tel:+4974439661-0"
          className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 mb-2 transition-colors"
          style={{ textDecoration: "none" }}
        >
          <Phone className="w-4 h-4 flex-shrink-0" />
          +49 7443 / 9661-0
        </a>
        <a
          href="mailto:info@bukara.de"
          className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 transition-colors"
          style={{ textDecoration: "none" }}
        >
          <Mail className="w-4 h-4 flex-shrink-0" />
          info@bukara.de
        </a>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartId, items, clearAll } = useCart();
  const [form, setForm] = useState<FormState>({
    firmenname: "", ust_idnr: "", ansprechpartner: "", email: "", telefon: "", nachricht: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firmenname.trim() || !form.ansprechpartner.trim() || !form.email.trim()) {
      setSubmitError("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }
    if (items.length === 0) {
      setSubmitError("Ihr Warenkorb ist leer.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    if (!cartId) {
      setSubmitting(false);
      setSubmitError("Warenkorb nicht gefunden. Bitte laden Sie die Seite neu.");
      return;
    }

    const result = await submitOrder(cartId, form);

    if ("error" in result) {
      setSubmitting(false);
      setSubmitError(result.error + " Bitte versuchen Sie es erneut.");
      return;
    }

    const { orderId, submitted_at: submittedAt, totals: serverTotals, emailItems } = result;
    const order = { id: orderId, submitted_at: submittedAt };

    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order",
          data: { order: { ...order, ...form }, items: emailItems, totals: serverTotals },
        }),
      });
    } catch (err) {
      console.error("[email] order:", err);
    }

    if (cartId) await clearAll(cartId);
    router.push("/danke?type=order");
  }

  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Bestellübersicht</span>
          </nav>
        </div>

        <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10 pb-20">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">Bestellübersicht</h1>

          {/* Trust bar */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8 pb-6 border-b border-slate-100">
            <TrustItem
              text="Bequem per Rechnung bezahlen"
              icon={<FileText className="w-4 h-4" />}
            />
            <TrustItem
              text="Auftragsbestätigung innerhalb von 24 Std."
              icon={<Clock className="w-4 h-4" />}
            />
            <TrustItem
              text="Geprüfte Qualität & zuverlässiger Versand"
              icon={<Check className="w-4 h-4" />}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-start">

            {/* Order summary + contact */}
            <div className="w-full lg:w-[42%] flex-shrink-0 lg:sticky lg:top-[72px]">
              <OrderSummary />
            </div>

            {/* Form */}
            <div className="flex-1 min-w-0">
              <form onSubmit={handleSubmit} noValidate>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5">
                  Ihre Kontaktdaten
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Firmenname <span className="text-[#9B242A]">*</span>
                    </label>
                    <input type="text" required value={form.firmenname} onChange={field("firmenname")} className={inputClass()} placeholder="Muster GmbH" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">USt-IdNr.</label>
                    <input type="text" value={form.ust_idnr} onChange={field("ust_idnr")} className={inputClass()} placeholder="DE123456789" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Ansprechpartner <span className="text-[#9B242A]">*</span>
                    </label>
                    <input type="text" required value={form.ansprechpartner} onChange={field("ansprechpartner")} className={inputClass()} placeholder="Max Mustermann" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      E-Mail <span className="text-[#9B242A]">*</span>
                    </label>
                    <input type="email" required value={form.email} onChange={field("email")} className={inputClass()} placeholder="anfrage@firma.de" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Telefon</label>
                    <input type="tel" value={form.telefon} onChange={field("telefon")} className={inputClass()} placeholder="+49 (0) 123 456789" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Nachricht</label>
                    <textarea rows={4} value={form.nachricht} onChange={field("nachricht")} className={inputClass("resize-none")} placeholder="Weitere Angaben zu Ihrer Anfrage..." />
                  </div>
                </div>

                {submitError && <p className="text-sm text-red-500 mb-4">{submitError}</p>}

                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="btn-black w-full justify-center"
                  style={{ opacity: submitting || items.length === 0 ? 0.7 : 1 }}
                >
                  {submitting ? "Wird gesendet…" : "Bestellung aufgeben"}
                  {!submitting && (
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  )}
                </button>

                <p className="text-[11px] text-slate-400 mt-3 text-center">
                  Zahlung bequem auf Rechnung nach Lieferung.
                </p>
                <p className="text-[11px] text-slate-400 mt-1 text-center">
                  Mit dem Absenden stimmen Sie zu, dass wir Sie bezüglich Ihrer Anfrage kontaktieren dürfen.
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
