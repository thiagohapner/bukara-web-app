"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Shared scroll-direction state for the header chrome. A single source of truth
// (one scroll listener) so the global Navbar and the catalog filter bar stay in
// sync: navbar hides on scroll-down and reveals on scroll-up, the filter bar
// stays pinned. Scoped to catalog views only.
const HeaderChromeContext = createContext<{ hidden: boolean; enabled: boolean }>({
  hidden: false,
  enabled: false,
});

export function useHeaderChrome() {
  return useContext(HeaderChromeContext);
}

// Catalog views: /katalog and /sortiment/<slug> (not the /katalog/<slug> PDP).
function isCatalogView(pathname: string): boolean {
  return pathname === "/katalog" || pathname.startsWith("/sortiment/");
}

export function HeaderChromeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const enabled = isCatalogView(pathname);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    if (!isCatalogView(pathname)) return;

    const THRESHOLD = 8; // ignore tiny scroll jitter
    const REVEAL_AT = 120; // always show the header near the top
    lastY.current = window.scrollY;
    let ticking = false;

    const apply = (y: number, dy: number) => {
      if (y < REVEAL_AT) setHidden(false);
      else if (Math.abs(dy) > THRESHOLD) setHidden(dy > 0); // scrolling down → hide
    };

    // Initialise from the current scroll position (async via rAF, so no
    // synchronous setState in the effect body).
    const initId = requestAnimationFrame(() => apply(window.scrollY, 0));

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        apply(y, y - lastY.current);
        lastY.current = y;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(initId);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  // On non-catalog routes the header is always shown, regardless of any leftover
  // internal state from a previous catalog view.
  return (
    <HeaderChromeContext.Provider value={{ hidden: enabled ? hidden : false, enabled }}>
      {children}
    </HeaderChromeContext.Provider>
  );
}
