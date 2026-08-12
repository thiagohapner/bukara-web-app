export const FREE_SHIPPING_THRESHOLD = 200;
export const BULK_DISCOUNT_THRESHOLD = 500;
export const BULK_DISCOUNT_PERCENT = 0.1;
export const BASE_SHIPPING_COST = 9.5;
export const BASE_SHIPPING_COST_AUSLAND = 15;

/** Herkunft des Kunden — steuert MwSt.-Ausweis und Versandkosten. */
export type Herkunft = "de" | "ausland";

// Grobe Formatprüfung für eine ausländische USt-IdNr. (Reverse-Charge,
// §13b UStG): zwei Buchstaben Länderkürzel (≠ DE) + 2–12 alphanumerische
// Zeichen. Keine Prüfung gegen das EU-MIAS-Register — nur Formatvalidierung.
const FOREIGN_VAT_ID_PATTERN = /^[A-Z]{2}[A-Z0-9]{2,12}$/;

export function isValidForeignVatId(vatId: string | null | undefined): boolean {
  if (!vatId) return false;
  const normalized = vatId.trim().toUpperCase().replace(/\s+/g, "");
  if (normalized.startsWith("DE")) return false;
  return FOREIGN_VAT_ID_PATTERN.test(normalized);
}

export type PriceInput = {
  selectedVariantCampaignPrice: number;
  selectedVariantOriginalPrice: number;
  fixedItems: Array<{ originalPrice: number; campaignPrice: number }>;
  quantity: number;
  bulkDiscountThreshold: number;
  bulkDiscountPercent: number;
};

export type PriceResult = {
  originalTotal: number;
  campaignTotal: number;
  bulkDiscountApplied: boolean;
  bulkDiscountAmount: number;
  finalTotal: number;
  freeShippingApplied: boolean;
};

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export function unitPriceForQuantity(basePrice: number, hasStaffelpreis: boolean, qty: number): number {
  if (!hasStaffelpreis) return basePrice;
  if (qty >= 10) return round(basePrice * 0.90);
  if (qty >= 5)  return basePrice;
  return round(basePrice * 1.20); // 1–4
}

export function calculatePrice(input: PriceInput): PriceResult {
  const fixedOriginal = input.fixedItems.reduce((s, i) => s + i.originalPrice, 0);
  const fixedCampaign = input.fixedItems.reduce((s, i) => s + i.campaignPrice, 0);

  const originalTotal = round((input.selectedVariantOriginalPrice + fixedOriginal) * input.quantity);
  const campaignTotal = round((input.selectedVariantCampaignPrice + fixedCampaign) * input.quantity);

  const bulkDiscountApplied = campaignTotal >= input.bulkDiscountThreshold;
  const bulkDiscountAmount = bulkDiscountApplied
    ? round(campaignTotal * (input.bulkDiscountPercent / 100))
    : 0;
  const finalTotal = round(campaignTotal - bulkDiscountAmount);

  return {
    originalTotal,
    campaignTotal,
    bulkDiscountApplied,
    bulkDiscountAmount,
    finalTotal,
    freeShippingApplied: campaignTotal >= FREE_SHIPPING_THRESHOLD,
  };
}

export function formatEur(n: number): string {
  return n.toFixed(2).replace(".", ",") + " €";
}

export type CartTotals = {
  subtotal: number;
  bulkDiscount: number;
  bulkDiscountApplied: boolean;
  voucherDiscount: number;
  freeShippingApplied: boolean;
  herkunft: Herkunft;
  vatExempt: boolean;
  net: number;
  vat: number;
  shipping: number;
  gross: number;
};

export function cartTotals(
  items: { unit_price: number; quantity: number }[],
  voucherDiscount = 0,
  options: { herkunft?: Herkunft; vatId?: string | null } = {},
): CartTotals {
  const herkunft = options.herkunft ?? "de";
  const isAusland = herkunft === "ausland";
  // Reverse-Charge (§13b UStG): MwSt. entfällt nur für ausländische
  // Geschäftskunden mit gültiger USt-IdNr. — ohne Nachweis bleibt die
  // deutsche MwSt. bestehen, auch bei Lieferung ins Ausland.
  const vatExempt = isAusland && isValidForeignVatId(options.vatId);

  const subtotal = round(items.reduce((s, i) => s + i.unit_price * i.quantity, 0));
  const freeShippingApplied = subtotal >= FREE_SHIPPING_THRESHOLD;
  const bulkDiscountApplied = subtotal >= BULK_DISCOUNT_THRESHOLD;
  const bulkDiscount = bulkDiscountApplied ? round(subtotal * BULK_DISCOUNT_PERCENT) : 0;
  // Voucher stacks after the automatic bulk discount; never drive net below zero.
  const voucher = round(Math.min(Math.max(voucherDiscount, 0), Math.max(subtotal - bulkDiscount, 0)));
  const net = round(subtotal - bulkDiscount - voucher);
  const shipping = freeShippingApplied ? 0 : (isAusland ? BASE_SHIPPING_COST_AUSLAND : BASE_SHIPPING_COST);
  // Versandkosten sind Teil der Bemessungsgrundlage und werden vor der MwSt. addiert.
  const vat = vatExempt ? 0 : round((net + shipping) * 0.19);
  const gross = round(net + shipping + vat);
  return {
    subtotal, bulkDiscount, bulkDiscountApplied, voucherDiscount: voucher, freeShippingApplied,
    herkunft, vatExempt, net, vat, shipping, gross,
  };
}
