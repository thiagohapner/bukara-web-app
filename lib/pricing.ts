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
    freeShippingApplied: bulkDiscountApplied,
  };
}

export function formatEur(n: number): string {
  return n.toFixed(2).replace(".", ",") + " €";
}
