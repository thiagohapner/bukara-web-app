"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, X, RotateCcw } from "lucide-react";
import CtaArrow from "./CtaArrow";
import ProductImage from "./ProductImage";
import { formatEur } from "@/lib/pricing";

type Step = "material" | "application" | "diameter" | "results";

type DiameterRange = { label: string; min: number; max: number | null };

const DIAMETERS: DiameterRange[] = [
  { label: "bis 6 mm", min: 0, max: 6 },
  { label: "6–10 mm", min: 6, max: 10 },
  { label: "10–16 mm", min: 10, max: 16 },
  { label: "über 16 mm", min: 16, max: null },
];

type RecommendProduct = {
  id: string;
  slug: string;
  display_name: string;
  badge: string | null;
  gallery_bg: string | null;
  image_url: string | null;
  best_sku: {
    variant_label: string | null;
    price_eur: number;
    campaign_price: number | null;
  };
};

/** Reads/creates a per-visit id so a completed chat's logged query rows can be
 * correlated back to one session — not tied to a signed-in customer. */
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "bukara-chat-session";
  let id = window.sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem(KEY, id);
  }
  return id;
}

function Chip({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-[44px] sm:min-h-0 inline-flex items-center px-4 py-2 rounded-pill border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
    >
      {children}
    </button>
  );
}

/**
 * Werkzeug-Lotse: a free, rule-based product-recommendation chat. Asks
 * Material → Anwendung → Durchmesser and calls the existing
 * /api/v2/recommend endpoint — no LLM, no external API cost. Each completed
 * query is logged (best-effort) via /api/v2/chat/log so /admin/v2/chat can
 * surface material/application combinations with zero results — the
 * feedback loop that makes it "get more precise over time" without ever
 * training a model.
 *
 * Desktop: a card anchored bottom-right. Mobile (<640px): a full-height
 * bottom sheet, matching the CartDrawer.tsx scroll-lock pattern. The
 * launcher sits at bottom-24 (96px), stacked above BackToTop.tsx's
 * bottom-6/right-6 button so the two never overlap.
 */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("material");
  const [materials, setMaterials] = useState<string[]>([]);
  const [applications, setApplications] = useState<string[]>([]);
  const [facetsLoading, setFacetsLoading] = useState(false);
  const [facetsError, setFacetsError] = useState(false);
  const [material, setMaterial] = useState<string | null>(null);
  const [application, setApplication] = useState<string | null>(null);
  const [diameter, setDiameter] = useState<DiameterRange | null>(null);
  const [results, setResults] = useState<RecommendProduct[] | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const sessionId = useRef<string>("");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionId.current = getSessionId();
  }, []);

  // Lock background scroll while open — same approach as CartDrawer.tsx.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [step, results, facetsLoading]);

  function reset() {
    setStep("material");
    setMaterial(null);
    setApplication(null);
    setDiameter(null);
    setResults(null);
  }

  function handleOpen() {
    setOpen(true);
    reset();
    if (materials.length === 0 && !facetsLoading) {
      setFacetsLoading(true);
      setFacetsError(false);
      fetch("/api/v2/chat/facets")
        .then((r) => {
          if (!r.ok) throw new Error("facets failed");
          return r.json();
        })
        .then((data: { materials: string[]; applications: string[] }) => {
          setMaterials(data.materials);
          setApplications(data.applications);
        })
        .catch(() => setFacetsError(true))
        .finally(() => setFacetsLoading(false));
    }
  }

  async function pickDiameter(d: DiameterRange) {
    setDiameter(d);
    setStep("results");
    setResultsLoading(true);
    const params = new URLSearchParams();
    if (material) params.set("material", material);
    if (application) params.set("application", application);
    params.set("minDiameter", String(d.min));
    if (d.max != null) params.set("maxDiameter", String(d.max));
    params.set("limit", "3");

    try {
      const res = await fetch(`/api/v2/recommend?${params.toString()}`);
      const data: { products?: RecommendProduct[] } = await res.json();
      const products = data.products ?? [];
      setResults(products);
      // Best-effort, fire-and-forget — never blocks or breaks the chat UI.
      fetch("/api/v2/chat/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId.current,
          material,
          application,
          minDiameter: d.min,
          maxDiameter: d.max,
          resultCount: products.length,
        }),
      }).catch(() => {});
    } catch {
      setResults([]);
    } finally {
      setResultsLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Werkzeug-Lotse öffnen"
        className={`fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-teal-700 transition-colors ${
          open ? "hidden" : ""
        }`}
      >
        <MessageCircle className="w-6 h-6" strokeWidth={2} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 sm:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="fixed z-50 bg-white border border-neutral-100 flex flex-col overflow-hidden
              inset-x-0 bottom-0 h-[88dvh] rounded-t-2xl shadow-2xl
              sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[560px] sm:w-[360px] sm:rounded-xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 flex-shrink-0">
              <div className="icon-tile">
                <MessageCircle className="w-4 h-4" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">Werkzeug-Lotse</p>
                <p className="text-xs text-neutral-500">Findet den passenden Artikel</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Schließen"
                className="ml-auto w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* Body */}
            <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
              <Bubble>Hallo! Für welches Material suchen Sie ein Werkzeug?</Bubble>

              {facetsLoading && <p className="text-sm text-neutral-400 ml-1">Lädt …</p>}
              {facetsError && (
                <p className="text-sm text-neutral-500 ml-1">
                  Die Auswahl konnte nicht geladen werden. Bitte Chat neu öffnen oder{" "}
                  <Link href="/katalog" className="underline">
                    direkt im Katalog
                  </Link>{" "}
                  suchen.
                </p>
              )}

              {step === "material" && materials.length > 0 && (
                <div className="flex flex-wrap gap-2 ml-1">
                  {materials.map((m) => (
                    <Chip
                      key={m}
                      onClick={() => {
                        setMaterial(m);
                        setStep("application");
                      }}
                    >
                      {m}
                    </Chip>
                  ))}
                </div>
              )}

              {material && (
                <>
                  <UserBubble>{material}</UserBubble>
                  <Bubble>Verstanden — {material}. Welche Bearbeitung planen Sie?</Bubble>
                </>
              )}

              {step === "application" && (
                <div className="flex flex-wrap gap-2 ml-1">
                  {applications.map((a) => (
                    <Chip
                      key={a}
                      onClick={() => {
                        setApplication(a);
                        setStep("diameter");
                      }}
                    >
                      {a}
                    </Chip>
                  ))}
                </div>
              )}

              {application && (
                <>
                  <UserBubble>{application}</UserBubble>
                  <Bubble>Und welcher Durchmesser wird benötigt?</Bubble>
                </>
              )}

              {step === "diameter" && (
                <div className="flex flex-wrap gap-2 ml-1">
                  {DIAMETERS.map((d) => (
                    <Chip key={d.label} onClick={() => pickDiameter(d)}>
                      {d.label}
                    </Chip>
                  ))}
                </div>
              )}

              {diameter && <UserBubble>{diameter.label}</UserBubble>}

              {step === "results" && (
                <>
                  {resultsLoading && <p className="text-sm text-neutral-400 ml-1">Suche passende Artikel …</p>}
                  {!resultsLoading && results && results.length === 0 && (
                    <Bubble>
                      Dazu habe ich leider keinen passenden Artikel gefunden. Gerne meldet sich ein Kollege
                      persönlich —{" "}
                      <Link href="/kontakt" className="underline">
                        Kontakt aufnehmen
                      </Link>
                      .
                    </Bubble>
                  )}
                  {!resultsLoading && results && results.length > 0 && (
                    <>
                      <Bubble>Diese Artikel passen:</Bubble>
                      <div className="flex flex-col gap-2 ml-1">
                        {results.map((p) => {
                          const price = p.best_sku.campaign_price ?? p.best_sku.price_eur;
                          return (
                            <div
                              key={p.id}
                              className="flex items-center gap-3 bg-white border border-neutral-100 rounded-lg p-2.5"
                            >
                              <div
                                className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0"
                                style={{ background: p.gallery_bg ?? "#EEEEEE" }}
                              >
                                <ProductImage
                                  src={p.image_url ?? ""}
                                  alt={p.display_name}
                                  fill
                                  unoptimized
                                  className="object-contain"
                                  sizes="48px"
                                  fallback={<div className="w-full h-full" />}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{p.display_name}</p>
                                <p className="text-sm font-semibold text-slate-900">{formatEur(price)}</p>
                              </div>
                              <Link
                                href={`/produkte/${p.slug}`}
                                onClick={() => setOpen(false)}
                                className="btn-black btn-arrow flex-shrink-0 !py-2 !px-3 !text-xs"
                              >
                                Ansehen
                                <CtaArrow />
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-100 px-4 py-3 flex-shrink-0">
              <button
                type="button"
                onClick={reset}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-slate-900 bg-neutral-50 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                Neu starten
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 max-w-[85%]">
      <div className="bg-neutral-50 border border-neutral-100 rounded-lg rounded-bl-sm px-3 py-2 text-sm text-slate-800 leading-snug">
        {children}
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="bg-slate-900 text-white rounded-lg rounded-br-sm px-3 py-2 text-sm leading-snug max-w-[85%]">
        {children}
      </div>
    </div>
  );
}
