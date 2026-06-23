"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BukaraLogo from "./BukaraLogo";
import { useCart } from "./CartContext";
import { ShoppingBasket, Search, ShieldCheck, Gem } from "lucide-react";

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
    <div
      className="inline-flex items-center gap-1.5 bg-white rounded-xl px-3 py-1.5"
      style={{ border: "1px solid #e8e8e8" }}
    >
      <span
        className="text-[11px] font-medium whitespace-nowrap"
        style={{ color: "#022221" }}
      >
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

function SearchBar({
  className = "",
  onSubmitted,
}: {
  className?: string;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const [term, setTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    onSubmitted?.();
    router.push(`/katalog?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={handleSubmit} role="search" className={className}>
      <div className="relative flex items-center">
        <Search
          className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none"
          strokeWidth={2}
        />
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Suchen"
          aria-label="Produkte suchen"
          className="w-full h-12 pl-12 pr-4 rounded-full bg-slate-100 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#00A597]/40 transition"
        />
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
    <header>
      {/* Row 1 — top info strip (desktop/tablet only) */}
      <div className="hidden md:block" style={{ backgroundColor: "#F5F5F7" }}>
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
                    className="inline-flex items-center gap-1 no-underline hover:underline hover:text-[#00A597] transition-colors"
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

      {/* Sticky: main row + category row */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200">
        {/* Row 2 — main bar */}
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 flex items-center gap-4 lg:gap-6 h-[72px]">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center"
            style={{ textDecoration: "none", color: "#00A597" }}
            aria-label="Bukara — Startseite"
          >
            <BukaraLogo height={30} />
          </Link>

          {/* Search (desktop/tablet) */}
          <SearchBar className="hidden md:block flex-1 max-w-[560px]" />

          {/* Spacer to push the cart/hamburger right on mobile (no inline search) */}
          <div className="flex-1 md:hidden" />

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-5">
            <Link
              href="/loesungen/sonderwerkzeug"
              className="inline-flex items-center rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors whitespace-nowrap"
              style={{ textDecoration: "none" }}
            >
              Sonderlösung gestalten
            </Link>
            {MAIN_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
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
            className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <ShoppingBasket className="w-5 h-5 text-slate-700" strokeWidth={1.7} />
            {cartCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1 leading-none"
                style={{ backgroundColor: "#9B242A" }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Hamburger (mobile) */}
          <button
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* Row 3 — category nav (desktop) */}
        <div className="hidden lg:block border-t border-slate-100">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 flex items-center justify-between h-12 gap-6">
            <ul className="flex items-center gap-7">
              {categoryLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-slate-700 hover:text-[#00A597] transition-colors whitespace-nowrap"
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
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-[680px] border-t border-slate-100" : "max-h-0"}`}>
          <div className="px-4 sm:px-6 py-4 bg-white">
            <SearchBar className="md:hidden mb-4" onSubmitted={() => setMenuOpen(false)} />
            <ul className="flex flex-col gap-1">
              <li>
                <Link
                  href="/loesungen/sonderwerkzeug"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm font-semibold text-slate-900"
                  style={{ textDecoration: "none" }}
                >
                  Sonderlösung gestalten
                </Link>
              </li>
              {categoryLinks.map((link) => (
                <li key={`m-${link.label}`}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 text-sm font-medium text-slate-700 hover:text-[#00A597]"
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
                    className="block py-2 text-sm font-medium text-slate-700 hover:text-[#00A597]"
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
