"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BukaraLogo from "./BukaraLogo";
import { useCart } from "./CartContext";
import { useHeaderChrome } from "./HeaderChrome";
import { ShoppingBasket, Search, ShieldCheck, Gem, PencilRuler } from "lucide-react";

// Row 1 — trust labels (one links to the Schärfservice page).
const TOP_INFO = [
  { label: "Bequem und sicher bezahlen", Icon: ShieldCheck },
  { label: "Deutschlandweiter Schärfservice", Icon: Gem, href: "/loesungen/schaerfservice" },
];

// Row 2 — text action links (besides search, the Sonderlösung button and cart).
const MAIN_LINKS = [
  { label: "Kontakt & Support", href: "/kontakt" },
  { label: "Über uns", href: "/ueber-uns" },
];

type ProductCategory = { name: string; slug: string };

// Short display labels for over-long DB category names — still link to the real slug.
const CATEGORY_LABEL_OVERRIDES: Record<string, string> = {
  "dp-vhw-werkzeuge-verbundwerkstoffe": "DP & VHW Werkzeuge",
};

const categoryLabel = (cat: ProductCategory) =>
  CATEGORY_LABEL_OVERRIDES[cat.slug] ?? cat.name;

function ItaBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 bg-white border border-neutral-100 rounded-sm px-3 py-1.5">
      <span className="text-[11px] font-normal text-slate-900 whitespace-nowrap">
        Exklusiver Partner von
      </span>
      <Image
        src="/ITA_Logo.png"
        alt="ITA Tools"
        width={44}
        height={14}
        className="object-contain"
      />
    </div>
  );
}

// Animated placeholder hint — fixed "Suchen nach " + a rotating trailing term.
const SEARCH_HINTS = [
  "Schaftfräser",
  "DIA Scharnierbohrer",
  "Schärfservice",
  "Vollhartmetall",
];

function SearchBar({
  className = "",
  onSubmitted,
}: {
  className?: string;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [hintIndex, setHintIndex] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = term.trim();
    if (!raw) return;
    const q = raw.toLowerCase();
    onSubmitted?.();
    // Special-case routing — explicit equality only, all else goes to the catalog.
    if (q === "schärfservice" || q === "schaerfservice") {
      router.push("/loesungen/schaerfservice");
      return;
    }
    if (q === "sonderwerkzeug") {
      router.push("/sonder-werkzeug");
      return;
    }
    router.push(`/katalog?q=${encodeURIComponent(raw)}`);
  };

  return (
    <form onSubmit={handleSubmit} role="search" className={className}>
      <div className="relative flex items-center">
        <Search
          className="absolute left-4 w-5 h-5 text-neutral-400 pointer-events-none"
          strokeWidth={2}
        />
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          aria-label="Produkte suchen"
          className="w-full h-12 pl-12 pr-4 rounded-full bg-neutral-50 text-[15px] text-slate-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-brand-500/30 transition-shadow duration-[240ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)]"
        />
        {/* Animated placeholder overlay — only while the input is empty */}
        {!term && (
          <div
            aria-hidden
            className="pointer-events-none absolute left-12 right-4 flex items-center overflow-hidden whitespace-nowrap text-[15px] text-neutral-400"
          >
            <span>Suchen nach&nbsp;</span>
            <span
              className="search-hint-word"
              onAnimationIteration={() =>
                setHintIndex((i) => (i + 1) % SEARCH_HINTS.length)
              }
            >
              {SEARCH_HINTS[hintIndex]}
            </span>
          </div>
        )}
      </div>
    </form>
  );
}

export default function Navbar({
  productCategories = [],
}: {
  productCategories?: ProductCategory[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, openDrawer } = useCart();
  const { hidden, enabled } = useHeaderChrome();
  // Don't hide the chrome while the mobile menu is open.
  const navHidden = hidden && !menuOpen;

  // Row 3 — Top-Angebote · DB categories · Mehr.
  const categoryLinks = [
    { label: "Top-Angebote", href: "/angebote" },
    ...productCategories.map((cat) => ({
      label: categoryLabel(cat),
      href: `/sortiment/${cat.slug}`,
    })),
    { label: "Mehr", href: "/katalog" },
  ];

  return (
    <header
      className={
        enabled
          ? `sticky top-0 z-50 transition-transform duration-300 will-change-transform ${
              navHidden ? "-translate-y-full" : "translate-y-0"
            }`
          : undefined
      }
    >
      {/* Row 1 — top info strip (desktop/tablet only) */}
      <div className="hidden md:block bg-brand-25">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          <ul
            className="flex items-center gap-8 h-9 text-[11px] font-bold"
            style={{ color: "#2d4a47" }}
          >
            {TOP_INFO.map(({ label, Icon, href }) => (
              <li key={label} className="inline-flex items-center">
                {href ? (
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1 no-underline hover:underline hover:text-brand-500 transition-[color] duration-[240ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)]"
                    style={{ color: "inherit" }}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                    {label}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                    {label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main row + category row. On catalog views the whole <header> is the
          sticky/translating element (so it reappears on scroll-up); elsewhere
          this inner block stays sticky as before. */}
      <div className={enabled ? "bg-white border-b border-neutral-100" : "sticky top-0 z-50 bg-white border-b border-neutral-100"}>
        {/* Row 2 — main bar */}
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 flex items-center gap-4 lg:gap-6 h-[72px]">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center text-brand-500"
            style={{ textDecoration: "none" }}
            aria-label="Bukara — Startseite"
          >
            <BukaraLogo height={30} />
          </Link>

          {/* Search (desktop/tablet) */}
          <SearchBar className="hidden md:block w-[448px] max-w-full" />

          {/* Spacer to push the cart/hamburger right on mobile (no inline search) */}
          <div className="flex-1 md:hidden" />

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-5">
            <Link
              href="/sonder-werkzeug"
              className="inline-flex items-center gap-2 rounded-sm border border-slate-800 px-4 py-2.5 text-sm font-normal text-slate-900 hover:bg-brand-25 hover:border-brand-600 transition-colors duration-[300ms] ease-[cubic-bezier(0.25,1.00,0.50,1.00)] whitespace-nowrap"
              style={{ textDecoration: "none" }}
            >
              <PencilRuler className="w-4 h-4" strokeWidth={2} />
              Sonderlösung gestalten
            </Link>
            {MAIN_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-normal text-slate-900 hover:text-brand-500 transition-colors duration-[240ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)] whitespace-nowrap"
                style={{ textDecoration: "none" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Cart */}
          <button
            type="button"
            aria-label="Warenkorb"
            onClick={openDrawer}
            className="relative ml-auto w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-25 transition-colors duration-[240ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)] flex-shrink-0"
          >
            <ShoppingBasket className="w-5 h-5 text-neutral-600" strokeWidth={1.7} />
            {cartCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1 leading-none"
                style={{ backgroundColor: "var(--color-sale)" }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Hamburger (mobile) */}
          <button
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-full hover:bg-brand-25 transition-colors duration-[240ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)] flex-shrink-0"
          >
            <span className={`block w-5 h-0.5 bg-neutral-600 transition-all duration-[300ms] ease-[cubic-bezier(0.25,1.00,0.50,1.00)] ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-neutral-600 transition-all duration-[300ms] ease-[cubic-bezier(0.25,1.00,0.50,1.00)] ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-neutral-600 transition-all duration-[300ms] ease-[cubic-bezier(0.25,1.00,0.50,1.00)] ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* Row 3 — category nav (desktop) */}
        <div className="hidden lg:block border-t border-neutral-50">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 flex items-center justify-between h-12 gap-6">
            <ul className="flex items-center gap-7">
              {categoryLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-normal text-neutral-600 hover:text-brand-500 transition-colors duration-[240ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)] whitespace-nowrap"
                    style={{ textDecoration: "none" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex-shrink-0">
              <ItaBadge />
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-[calc(100dvh-72px)] border-t border-neutral-50" : "max-h-0"}`}>
          <div className="px-4 sm:px-6 py-4 bg-white max-h-[calc(100dvh-72px)] overflow-y-auto">
            <SearchBar className="md:hidden mb-4" onSubmitted={() => setMenuOpen(false)} />
            <ul className="flex flex-col gap-1">
              <li>
                <Link
                  href="/sonder-werkzeug"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center gap-2 py-2 text-sm font-normal text-slate-900"
                  style={{ textDecoration: "none" }}
                >
                  <PencilRuler className="w-4 h-4" strokeWidth={2} />
                  Sonderlösung gestalten
                </Link>
              </li>
              {categoryLinks.map((link) => (
                <li key={`m-${link.label}`}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 text-sm font-normal text-neutral-600 hover:text-brand-500"
                    style={{ textDecoration: "none" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {MAIN_LINKS.map((link) => (
                <li key={`m-${link.href}`}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 text-sm font-normal text-neutral-600 hover:text-brand-500"
                    style={{ textDecoration: "none" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <ItaBadge />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
