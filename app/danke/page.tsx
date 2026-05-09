"use client";

import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

export default function DankePage() {
  const router = useRouter();
  return (
    <>
      <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-24">
        <div className="flex flex-col items-center text-center max-w-md">
          {/* Check icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-8"
            style={{ background: "rgba(0,165,151,0.08)" }}
          >
            <svg
              className="w-10 h-10"
              style={{ color: "#00A597" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
            Vielen Dank für Ihre Anfrage.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-10">
            Wir haben Ihre Anfrage erhalten und melden uns in Kürze mit Ihrem finalen Angebot.
          </p>

          <button
            onClick={() => router.back()}
            className="btn-outline inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Zurück
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
