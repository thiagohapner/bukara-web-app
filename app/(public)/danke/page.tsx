"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
import { CheckIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

const MESSAGES: Record<string, string> = {
  contact: "Wir haben Ihre Nachricht erhalten und melden uns in Kürze bei Ihnen.",
  order: "Wir haben Ihre Bestellung erhalten und melden uns in Kürze mit der Auftragsbestätigung.",
  schaerfen: "Wir haben Ihren Auftrag erhalten und melden uns in Kürze mit der Abholbestätigung.",
  sonderwerkzeug: "Wir haben Ihren Auftrag erhalten und melden uns in Kürze bei Ihnen.",
};
const DEFAULT_MESSAGE = "Wir haben Ihre Anfrage erhalten und melden uns in Kürze mit Ihrem finalen Angebot.";

function DankeContent() {
  const params = useSearchParams();
  const message = MESSAGES[params.get("type") ?? ""] ?? DEFAULT_MESSAGE;

  return (
    <div className="flex flex-col items-center text-center max-w-md">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-8"
        style={{ background: "rgba(0,165,151,0.08)" }}
      >
        <CheckIcon className="w-10 h-10" style={{ color: "#00A597" }} strokeWidth={2.5} />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
        Vielen Dank für Ihre Anfrage.
      </h1>
      <p className="text-slate-500 text-sm leading-relaxed mb-10">
        {message}
      </p>

      <Link
        href="/"
        className="btn-outline inline-flex items-center gap-2"
        style={{ textDecoration: "none" }}
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Zur Startseite
      </Link>
    </div>
  );
}

export default function DankePage() {
  return (
    <>
      <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-24">
        <Suspense>
          <DankeContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
