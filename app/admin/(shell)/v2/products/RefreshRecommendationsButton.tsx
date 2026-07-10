"use client";

import { useState, useTransition } from "react";
import { refreshRecommendations } from "./recommendationsActions";

export default function RefreshRecommendationsButton() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");

  const onClick = () => {
    setStatus("idle");
    startTransition(async () => {
      const res = await refreshRecommendations();
      setStatus(res.ok ? "done" : "error");
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="btn-outline px-4 py-2 text-sm"
        style={{ opacity: isPending ? 0.6 : 1 }}
      >
        {isPending ? "Wird berechnet…" : "Empfehlungen neu berechnen"}
      </button>
      {status === "done" && <span className="text-xs text-teal-600 font-medium">✓ Aktualisiert</span>}
      {status === "error" && <span className="text-xs text-red-600 font-medium">Fehlgeschlagen</span>}
    </div>
  );
}
