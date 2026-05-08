"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { NAV_LINKS } from "@/lib/data";
import BukaraLogo from "./BukaraLogo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="sticky top-0 z-50 bg-white border-b border-slate-200"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-6">

        {/* Logo */}
        <a href="/" className="flex-shrink-0 flex items-center" style={{ textDecoration: "none", color: "#00A597" }}>
          <BukaraLogo height={29} />
        </a>

        {/* Desktop nav links — centered */}
        <ul className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <a
                href="#"
                className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors duration-200 whitespace-nowrap"
                style={{ textDecoration: "none" }}
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        {/* Right — partnership badge + mobile hamburger */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Partnership badge */}
          <div className="hidden lg:inline-flex items-center gap-1.5 bg-white rounded-lg px-3 py-1.5" style={{ border: "1px solid #e8e8e8" }}>
            <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: "#022221" }}>Exklusiver Partner von</span>
            <Image
              src="/ITA_Logo.png"
              alt="ITA Tools"
              width={44}
              height={14}
              className="object-contain"
            />
          </div>

          {/* Hamburger (mobile) */}
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
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-96 border-t border-slate-100" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col px-6 py-4 gap-4 bg-white">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <a
                href="#"
                className="text-sm font-medium text-slate-700 hover:text-orange-500 transition-colors"
                style={{ textDecoration: "none" }}
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
