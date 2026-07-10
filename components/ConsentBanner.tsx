"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent } from "@/lib/consent";

/** Minimal cookie-consent banner gating the anonymous view/add-to-cart tracking used to power recommendations (see lib/events/useTrackEvent.ts). Declining or dismissing leaves recommendations purely content-based. */
export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsent() === null);
  }, []);

  if (!visible) return null;

  const decide = (value: "granted" | "declined") => {
    setConsent(value);
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-neutral-200 bg-white px-4 py-4 sm:px-6 shadow-[var(--shadow-md)]">
      <div className="max-w-[1320px] mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-neutral-600 flex-1">
          Wir verwenden ein anonymes Sitzungs-Cookie, um Ihnen relevantere Produktempfehlungen zu zeigen — keine
          personenbezogenen Daten. Mehr dazu in unserer{" "}
          <Link href="/datenschutz" className="underline hover:text-slate-900">
            Datenschutzerklärung
          </Link>
          .
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button type="button" onClick={() => decide("declined")} className="btn-outline text-sm">
            Nur notwendige
          </button>
          <button type="button" onClick={() => decide("granted")} className="btn-black text-sm">
            Akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
