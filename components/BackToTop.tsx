"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

// Floating "Nach oben" button: appears once the user has scrolled down, and
// smoothly scrolls the window back to the top when clicked.
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll(); // sync initial state (e.g. on refresh while scrolled)
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Nach oben"
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" })}
      className={[
        "fixed bottom-6 right-6 z-40 inline-flex items-center gap-1.5",
        "rounded-pill bg-slate-900 text-white text-sm font-medium px-4 py-2.5",
        "shadow-lg hover:bg-slate-700 transition-all duration-200",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
      ].join(" ")}
    >
      Nach oben
      <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
    </button>
  );
}
