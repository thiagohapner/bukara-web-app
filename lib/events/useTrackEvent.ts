"use client";

import { useCallback } from "react";
import { hasTrackingConsent } from "@/lib/consent";

const SID_COOKIE = "bukara_sid";
const SID_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 12 months

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// The session id cookie is only ever created once consent is granted — never
// on page load, never speculatively.
function ensureSessionId(): string {
  const existing = readCookie(SID_COOKIE);
  if (existing) return existing;
  const sid = crypto.randomUUID();
  document.cookie = `${SID_COOKIE}=${sid}; path=/; max-age=${SID_MAX_AGE_SECONDS}; SameSite=Lax`;
  return sid;
}

export type TrackableEvent = "view" | "add_to_cart";

/** Fire-and-forget product event logging, gated on tracking consent. */
export function useTrackEvent() {
  const trackEvent = useCallback((eventType: TrackableEvent, productId: string, opts?: { skuId?: string; surface?: string }) => {
    if (!hasTrackingConsent()) return;
    const sessionId = ensureSessionId();
    const body = JSON.stringify({
      sessionId,
      eventType,
      productId,
      skuId: opts?.skuId,
      surface: opts?.surface,
    });

    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/v2/events", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/v2/events", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  }, []);

  return { trackEvent };
}

/** Reads the session id cookie if consent was granted and it already exists (no side effects, no creation). */
export function getExistingSessionId(): string | null {
  if (!hasTrackingConsent()) return null;
  return readCookie(SID_COOKIE);
}
