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

export type VoucherStatus = "active" | "scheduled" | "expired" | "disabled" | "used_up";

export const VOUCHER_STATUS_LABEL: Record<VoucherStatus, string> = {
  active: "Aktiv",
  scheduled: "Geplant",
  expired: "Abgelaufen",
  disabled: "Deaktiviert",
  used_up: "Aufgebraucht",
};

/** Derive the lifecycle status shown in the CMS (mirrors the validate_voucher gates). */
export function voucherStatus(
  v: { active: boolean; valid_from: string; valid_until: string; max_redemptions: number | null },
  redemptions: number,
  now: number = Date.now(),
): VoucherStatus {
  if (!v.active) return "disabled";
  if (v.max_redemptions != null && redemptions >= v.max_redemptions) return "used_up";
  if (now < new Date(v.valid_from).getTime()) return "scheduled";
  if (now > new Date(v.valid_until).getTime()) return "expired";
  return "active";
}

