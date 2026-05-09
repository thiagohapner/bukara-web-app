import BukaraLogo from "./BukaraLogo";

const FOOTER_COLS = {
  Pages: ["About us", "Categories", "Shop", "Contact us"],
  Resource: ["Blogs", "FAQ", "Reviews"],
  Utilities: ["Style Guide", "Error 404", "Changelog", "Return Policy"],
  Connected: ["Instagram", "Facebook", "YouTube", "Twitter"],
};

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#022221" }} className="text-slate-300">
      {/* Main footer */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-10">

          {/* Where abouts */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="mb-5 text-white">
              <BukaraLogo height={29} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white mb-1">Where abouts</p>
            <p className="text-sm text-slate-300 mb-5 leading-relaxed">4517 Washington Ave. Manchester,<br />Kentucky 39495</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white mb-1">Mailbox</p>
            <p className="text-sm text-slate-300 mb-5">hello@bukara.de</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white mb-1">Contact</p>
            <p className="text-sm text-slate-300">+49 (0) 555-0111</p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_COLS).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-white font-semibold text-sm mb-4">{heading}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-300 hover:text-white transition-colors duration-200"
                      style={{ textDecoration: "none" }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <p className="text-white font-semibold text-sm mb-4">Newsletter</p>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Ihr Name"
                className="w-full bg-white/10 text-white text-sm px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#00A597]/40 focus:border-[#00A597] transition-colors placeholder:text-slate-400"
              />
              <input
                type="email"
                placeholder="Ihre E-Mail"
                className="w-full bg-white/10 text-white text-sm px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#00A597]/40 focus:border-[#00A597] transition-colors placeholder:text-slate-400"
              />
              <button className="btn-orange w-full justify-center">
                Anmelden
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2025 Bukara. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
