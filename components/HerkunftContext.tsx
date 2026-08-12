"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Herkunft } from "@/lib/pricing";

const STORAGE_KEY = "bukara_herkunft";

type HerkunftContextValue = {
  herkunft: Herkunft;
  setHerkunft: (h: Herkunft) => void;
};

const HerkunftContext = createContext<HerkunftContextValue | null>(null);

export function useHerkunft(): HerkunftContextValue {
  const ctx = useContext(HerkunftContext);
  if (!ctx) throw new Error("useHerkunft must be used within HerkunftProvider");
  return ctx;
}

export function HerkunftProvider({ children }: { children: React.ReactNode }) {
  // Default „Deutschland“ — das Gros der Kunden, keine Layout-Verschiebung beim ersten Render.
  const [herkunft, setHerkunftState] = useState<Herkunft>("de");

  useEffect(() => {
    // Deferred read (matches CartContext's pattern) so the initial render
    // stays SSR-safe and this doesn't trip the sync-setState-in-effect rule.
    Promise.resolve().then(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "de" || stored === "ausland") setHerkunftState(stored);
    });
  }, []);

  const setHerkunft = useCallback((h: Herkunft) => {
    setHerkunftState(h);
    localStorage.setItem(STORAGE_KEY, h);
  }, []);

  return (
    <HerkunftContext.Provider value={{ herkunft, setHerkunft }}>
      {children}
    </HerkunftContext.Provider>
  );
}
