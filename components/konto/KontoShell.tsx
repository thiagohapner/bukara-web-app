import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import Footer from "@/components/Footer";
import AccountNav from "@/components/konto/AccountNav";

// Account-area chrome — mirrors the request-form layout (aurora background,
// left rail + centered content column). The left rail carries the account menu
// instead of the forms' step nav.
export default function KontoShell({
  title,
  backHref,
  backLabel,
  children,
}: {
  title: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="min-h-screen form-aurora-bg">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-[70px] xl:gap-[110px] py-12 lg:min-h-[calc(100vh-108px)]">

            {/* Left rail — account menu */}
            <aside className="w-full lg:w-[240px] flex-shrink-0 flex flex-col lg:pt-1">
              <h2 className="text-[15px] font-medium text-slate-900 mb-5 px-3">Mein Konto</h2>
              <AccountNav />

              <div className="hidden lg:block mt-9 px-3">
                <div className="text-[15px] font-medium text-slate-900 mb-3">Noch Fragen?</div>
                <a href="tel:+4974439661-0" className="flex items-center gap-3 text-slate-900 text-sm mb-2.5" style={{ textDecoration: "none" }}>
                  <span className="icon-tile icon-tile--sm"><Phone className="w-4 h-4" strokeWidth={1.75} /></span>
                  +49 7443 / 9661-0
                </a>
                <a href="mailto:info@bukara.de" className="flex items-center gap-3 text-slate-900 text-sm" style={{ textDecoration: "none" }}>
                  <span className="icon-tile icon-tile--sm"><Mail className="w-4 h-4" strokeWidth={1.75} /></span>
                  info@bukara.de
                </a>
              </div>
            </aside>

            {/* Content column */}
            <div className="w-full lg:w-[620px] flex-shrink-0 min-w-0">
              {backHref && (
                <Link href={backHref} className="text-sm text-brand-600 hover:text-brand-700 inline-block mb-3">
                  ← {backLabel ?? "Zurück"}
                </Link>
              )}
              <h1 className="heading-h2 mb-8">{title}</h1>
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
