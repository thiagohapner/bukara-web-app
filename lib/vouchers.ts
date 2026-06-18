import { formatEur } from "@/lib/pricing";

/** Result returned by the `validate_voucher` RPC (and the applyVoucher action). */
export type VoucherValidation = {
  valid: boolean;
  reason?: string | null;
  discount?: number;
  voucher_id?: string;
  code?: string;
};

/** Codes are stored and matched normalized: trimmed + UPPERCASE. */
export function normalizeVoucherCode(code: string): string {
  return code.trim().toUpperCase();
}

/** Compact discount label for lists/badges, e.g. "-15%" or "-50,00 €". */
export function formatVoucherDiscount(type: "percentage" | "fixed_amount", value: number): string {
  return type === "percentage" ? `-${value}%` : `-${formatEur(value)}`;
}
