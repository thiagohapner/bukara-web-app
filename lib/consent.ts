const CONSENT_KEY = "bukara_consent";
const CONSENT_CHANGE_EVENT = "bukara-consent-change";

export type ConsentValue = "granted" | "declined";

/**
 * Tracking consent (TTDSG): product view/add-to-cart events are only recorded
 * after the visitor explicitly accepts via the consent banner. Declining, or
 * not yet deciding, means no session cookie is ever set and no events are
 * written — recommendations stay purely content-based for that visitor.
 */
export function getConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === "granted" || v === "declined" ? v : null;
}

export function setConsent(value: ConsentValue): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

export function hasTrackingConsent(): boolean {
  return getConsent() === "granted";
}

export function onConsentChange(handler: () => void): () => void {
  window.addEventListener(CONSENT_CHANGE_EVENT, handler);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handler);
}
