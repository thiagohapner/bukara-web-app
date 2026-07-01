"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { cartTotals, formatEur, unitPriceForQuantity, FREE_SHIPPING_THRESHOLD, BULK_DISCOUNT_THRESHOLD } from "@/lib/pricing";
import type { CartItem } from "@/lib/cart";
import { X, ShoppingBasket, Trash2, ArrowRight } from "lucide-react";

function QtyButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 hover:border-[#00A597] hover:text-[#00A597] transition-colors text-base font-semibold select-none"
    >
      {children}
    </button>
  );
}

function itemDisplayFields(item: CartItem) {
  const isDeal = item.deal_id !== null;
  return {
    isDeal,
    name: isDeal
      ? (item.deal?.title ?? "Angebot")
      : (item.sku?.product?.name ?? item.v2Sku?.product?.display_name ?? item.v2Sku?.product?.base_name ?? "Produkt"),
    variantLabel: isDeal
      ? (item.selected_sku?.variant_label ?? null)
      : (item.sku?.variant_label ?? item.v2Sku?.variant_label ?? null),
    artikelNr: isDeal
      ? (item.selected_sku?.artikel_nr ?? null)
      : (item.sku?.artikel_nr ?? item.v2Sku?.identnummer ?? null),
    stockQty: item.sku?.stock_quantity ?? item.v2Sku?.stock_quantity ?? 999,
    hasStaffel: item.v2Sku?.has_staffelpreis ?? false,
    basePrice: item.v2Sku?.price_eur ?? item.sku?.price ?? item.unit_price,
  };
}

function tierLabel(qty: number): string {
  if (qty >= 10) return "Mengenstaffel: ab 10 Stück −10%";
  if (qty >= 5)  return "Mengenstaffel: 5–9 Stück Standardpreis";
  return "Mengenstaffel: 1–4 Stück +20% Mindermengenzuschlag";
}

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, updateItem, removeCartItem } = useCart();
  const totals = cartTotals(items);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!isDrawerOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={closeDrawer}
        aria-hidden
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-extrabold text-slate-900">
            Warenkorb
            {items.length > 0 && (
              <span className="ml-2 text-sm font-medium text-slate-500">
                ({items.reduce((s, i) => s + i.quantity, 0)})
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Schließen"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBasket className="w-12 h-12 text-slate-200" strokeWidth={1.5} />
              <p className="text-slate-500 text-sm">Ihr Warenkorb ist leer.</p>
              <Link
                href="/katalog"
                onClick={closeDrawer}
                className="btn-brand text-sm"
                style={{ textDecoration: "none" }}
              >
                Produkte entdecken
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-5">
              {items.map((item) => {
                const { name, variantLabel, artikelNr, stockQty, hasStaffel, basePrice } = itemDisplayFields(item);
                const lineTotal = item.unit_price * item.quantity;

                return (
                  <li key={item.id} className="flex gap-4">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{name}</p>
                      {variantLabel && (
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{variantLabel}</p>
                      )}
                      {artikelNr && (
                        <p className="text-[11px] text-slate-400 mt-0.5">Art.-Nr.: {artikelNr}</p>
                      )}
                      {hasStaffel && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{tierLabel(item.quantity)}</p>
                      )}
                      {stockQty < 10 && stockQty > 0 && (
                        <p className="text-[11px] font-medium mt-1" style={{ color: "#D97706" }}>
                          Nur noch {stockQty} auf Lager
                        </p>
                      )}
                      {/* Qty controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <QtyButton onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeCartItem(item.id)}>
                          {item.quantity === 1 ? (
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                          ) : "−"}
                        </QtyButton>
                        <span className="text-sm font-semibold text-slate-900 w-5 text-center">{item.quantity}</span>
                        <QtyButton onClick={() => updateItem(item.id, item.quantity + 1)}>+</QtyButton>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCartItem(item.id)}
                        className="text-xs text-slate-500 hover:text-slate-900 transition-colors mt-1.5 font-medium"
                      >
                        Vom Warenkorb entfernen
                      </button>
                      {hasStaffel && item.quantity === 4 && (
                        <p className="text-[11px] mt-1" style={{ color: "#00A597" }}>
                          Noch 1 Stück bis zum Standardpreis
                        </p>
                      )}
                      {hasStaffel && item.quantity === 9 && (
                        <p className="text-[11px] mt-1" style={{ color: "#00A597" }}>
                          Noch 1 Stück für −10% Mengenrabatt
                        </p>
                      )}
                    </div>
                    {/* Price */}
                    <div className="flex flex-col items-end justify-between">
                      <p className="text-sm font-semibold text-slate-900">{formatEur(lineTotal)}</p>
                      {item.quantity > 1 && (
                        <p className="text-[11px] text-slate-400">
                          {formatEur(hasStaffel ? unitPriceForQuantity(basePrice, true, item.quantity) : item.unit_price)} / Stk.
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Summary + CTAs */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-5 flex flex-col gap-3">
            {/* Pricing rows */}
            <div className="flex flex-col gap-1.5 text-sm">
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
                <span>{totals.shipping === 0 ? <span style={{ color: "#00A597" }} className="font-medium">Kostenlos</span> : formatEur(totals.shipping)}</span>
              </div>
              <div className="h-px bg-slate-100 my-1" />
              <div className="flex justify-between font-extrabold text-slate-900 text-base">
                <span>Gesamt inkl. MwSt.</span>
                <span>{formatEur(totals.gross)}</span>
              </div>
              {!totals.freeShippingApplied && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Noch {formatEur(FREE_SHIPPING_THRESHOLD - totals.subtotal)} bis zum kostenlosen Versand.
                </p>
              )}
              {totals.freeShippingApplied && !totals.bulkDiscountApplied && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ✓ Kostenloser Versand! Noch {formatEur(BULK_DISCOUNT_THRESHOLD - totals.subtotal)} bis zum 10% Zusatzrabatt.
                </p>
              )}
            </div>

            {/* CTAs */}
            <Link
              href="/warenkorb/checkout"
              onClick={closeDrawer}
              className="btn-black w-full text-center"
              style={{ textDecoration: "none" }}
            >
              Zur Bestellung
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
            <button
              type="button"
              onClick={closeDrawer}
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors text-center"
            >
              Weiter einkaufen
            </button>
          </div>
        )}
      </div>
    </>
  );
}
