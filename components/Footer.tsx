import Link from "next/link";
import BukaraLogo from "./BukaraLogo";

const NAV_LINKS = [
  { label: "Produkte",   href: "/katalog" },
  { label: "Lösungen",   href: "/loesungen" },
  { label: "Angebote",   href: "/angebote" },
  { label: "Über uns",   href: "/ueber-uns" },
  { label: "Kontakt",    href: "/kontakt" },
];

const SERVICE_LINKS = [
  { label: "Schärfservice",    href: "/loesungen/schaerfservice" },
  { label: "Sonderwerkzeuge",  href: "/loesungen/sonderwerkzeug" },
  { label: "B2B Portal",       href: "https://b2b.bukara.de/", external: true },
];

const LEGAL_LINKS = [
  { label: "Impressum", href: "/impressum" },
  { label: "AGBs",      href: "/agbs" },
  { label: "Datenschutz", href: "/datenschutz" },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#022221" }} className="text-slate-300">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-10">

          {/* Company info */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <div className="mb-5 text-white">
              <BukaraLogo height={29} />
            </div>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed max-w-[280px]">
              Ihr Rundumpartner für Werkzeuge in der Holz- und Kunststoffbearbeitung. Präzision und Verlässlichkeit seit 1996.
            </p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white mb-1">Adresse</p>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              Bukara GmbH<br />
              Siemensstraße 24<br />
              72280 Dornstetten
            </p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white mb-1">E-Mail</p>
            <a href="mailto:info@bukara.de" className="text-sm text-slate-300 hover:text-white transition-colors mb-4 block" style={{ textDecoration: "none" }}>
              info@bukara.de
            </a>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white mb-1">Telefon</p>
            <a href="tel:+4974439661-0" className="text-sm text-slate-300 hover:text-white transition-colors" style={{ textDecoration: "none" }}>
              +49 7443 / 9661-0
            </a>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-white font-semibold text-sm mb-4">Navigation</p>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-slate-300 hover:text-white transition-colors duration-200" style={{ textDecoration: "none" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="text-white font-semibold text-sm mb-4">Leistungen</p>
            <ul className="space-y-2.5">
              {SERVICE_LINKS.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-300 hover:text-white transition-colors duration-200" style={{ textDecoration: "none" }}>
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-sm text-slate-300 hover:text-white transition-colors duration-200" style={{ textDecoration: "none" }}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-white font-semibold text-sm mb-4">Rechtliches</p>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-slate-300 hover:text-white transition-colors duration-200" style={{ textDecoration: "none" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-white font-semibold text-sm mb-4">Newsletter</p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Ihre E-Mail"
                className="w-full bg-white/10 text-white text-sm px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#00A597]/40 focus:border-[#00A597] transition-colors placeholder:text-slate-400"
              />
              <button className="btn-brand w-full justify-center">
                Anmelden
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2026 Bukara GmbH. Alle Rechte vorbehalten.</p>
          <div className="flex gap-5">
            <Link href="/impressum" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>Impressum</Link>
            <Link href="/agbs" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>AGBs</Link>
            <Link href="/datenschutz" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>Datenschutz</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
