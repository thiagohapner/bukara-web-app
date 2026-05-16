export const FREE_SHIPPING_THRESHOLD = 200;
export const BULK_DISCOUNT_THRESHOLD = 500;
export const BULK_DISCOUNT_PERCENT = 0.1;
export const BASE_SHIPPING_COST = 9.5;

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
  freeShippingApplied: boolean;
  net: number;
  vat: number;
  shipping: number;
  gross: number;
};

export function cartTotals(items: { unit_price: number; quantity: number }[]): CartTotals {
  const subtotal = round(items.reduce((s, i) => s + i.unit_price * i.quantity, 0));
  const freeShippingApplied = subtotal >= FREE_SHIPPING_THRESHOLD;
  const bulkDiscountApplied = subtotal >= BULK_DISCOUNT_THRESHOLD;
  const bulkDiscount = bulkDiscountApplied ? round(subtotal * BULK_DISCOUNT_PERCENT) : 0;
  const net = round(subtotal - bulkDiscount);
  const shipping = freeShippingApplied ? 0 : BASE_SHIPPING_COST;
  const vat = round(net * 0.19);
  const gross = round(net + vat + shipping);
  return { subtotal, bulkDiscount, bulkDiscountApplied, freeShippingApplied, net, vat, shipping, gross };
}
