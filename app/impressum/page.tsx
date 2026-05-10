import Link from "next/link";
import Footer from "@/components/Footer";

export default function ImpressumPage() {
  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6 pt-5 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Impressum</span>
          </nav>
        </div>

        <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Impressum</h1>
          <p className="text-sm text-slate-400 mb-10">Angaben gemäß § 5 DDG</p>

          <section className="mb-8">
            <p className="text-sm text-slate-900 font-semibold mb-1">BuKaRa GmbH</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Siemensstraße 24<br />
              72280 Dornstetten
            </p>
          </section>

          <section className="mb-8">
            <p className="text-sm text-slate-600 leading-relaxed">
              Tel.: <a href="tel:+4974439661-0" className="hover:text-slate-900 transition-colors" style={{ textDecoration: "none" }}>+49 7443 / 9661-0</a><br />
              E-Mail: <a href="mailto:info@bukara.de" className="hover:text-slate-900 transition-colors" style={{ textDecoration: "none" }}>info@bukara.de</a><br />
              Web: <a href="https://www.bukara.de" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors" style={{ textDecoration: "none" }}>www.bukara.de</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-2">Vertreten durch</h2>
            <p className="text-sm text-slate-600">Geschäftsführer: Stefan Burkhardt, Felix Burkhardt</p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-2">Registereintrag</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Handelsregister: Stuttgart<br />
              Registernummer: HRB 440532<br />
              Sitz der Gesellschaft: Dornstetten
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-2">USt-IdNr.</h2>
            <p className="text-sm text-slate-600">DE812024805</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
