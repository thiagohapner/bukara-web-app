"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BukaraLogo from "./BukaraLogo";
import { useCart } from "./CartContext";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

const activeDealsCount: number = 3;

const NAV_LINKS = [
  { label: "Produkte", href: "/produkte" },
  { label: "Angebote", href: "/angebote", badge: true },
  { label: "Lösungen", href: "/loesungen" },
  { label: "Über uns", href: "/ueber-uns" },
  { label: "B2B Portal", href: "https://b2b.bukara.de/" },
  { label: "Kontakt", href: "/kontakt" },
];

const AngeboteBadge = () => (
  <span
    className="inline-flex items-center justify-center rounded-full text-[10px] font-bold text-white leading-none px-1.5 py-0.5"
    style={{ backgroundColor: "#9B242A" }}
  >
    {activeDealsCount}
  </span>
);

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, openDrawer } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-6">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center" style={{ textDecoration: "none", color: "#00A597" }}>
          <BukaraLogo height={29} />
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          {NAV_LINKS.map((link) => {
            if (link.badge && activeDealsCount === 0) return null;
            const isExternal = link.href.startsWith("http");
            return (
              <li key={link.label}>
                {isExternal ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors duration-200 whitespace-nowrap"
                    style={{ textDecoration: "none" }}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors duration-200 whitespace-nowrap"
                    style={{ textDecoration: "none" }}
                  >
                    {link.label}
                    {link.badge && <AngeboteBadge />}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* Right — partnership badge + cart + hamburger */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden lg:inline-flex items-center gap-1.5 bg-white rounded-lg px-3 py-1.5" style={{ border: "1px solid #e8e8e8" }}>
            <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: "#022221" }}>Exklusiver Partner von</span>
            <Image src="/ITA_Logo.png" alt="ITA Tools" width={44} height={14} className="object-contain" />
          </div>

          {/* Cart icon */}
          <button
            type="button"
            aria-label="Warenkorb"
            onClick={openDrawer}
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <ShoppingCartIcon className="w-5 h-5 text-slate-700" strokeWidth={1.7} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1 leading-none" style={{ backgroundColor: "#9B242A" }}>
                {cartCount}
              </span>
            )}
          </button>

          <button
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-96 border-t border-slate-100" : "max-h-0"}`}>
        <ul className="flex flex-col px-6 py-4 gap-4 bg-white">
          {NAV_LINKS.map((link) => {
            if (link.badge && activeDealsCount === 0) return null;
            const isExternal = link.href.startsWith("http");
            return (
              <li key={link.label}>
                {isExternal ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-slate-700 hover:text-orange-500 transition-colors"
                    style={{ textDecoration: "none" }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-orange-500 transition-colors"
                    style={{ textDecoration: "none" }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                    {link.badge && <AngeboteBadge />}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
