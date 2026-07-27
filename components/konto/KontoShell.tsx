import Link from "next/link";
import Footer from "@/components/Footer";

// Minimal account-area chrome (Phase 1). A proper /konto sub-navigation
// arrives in Phase 2 alongside orders/inquiries/data.
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
      <main className="min-h-screen bg-white">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>
              Home
            </Link>
            <span>/</span>
            {backHref ? (
              <>
                <Link href={backHref} className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>
                  Konto
                </Link>
                <span>/</span>
                <span className="text-slate-700 font-medium">{title}</span>
              </>
            ) : (
              <span className="text-slate-700 font-medium">{title}</span>
            )}
          </nav>
        </div>

        <div className="max-w-[760px] mx-auto px-4 sm:px-6 pt-8 pb-20">
          {backHref && (
            <Link href={backHref} className="text-sm text-brand-600 hover:text-brand-700">
              ← {backLabel ?? "Zurück"}
            </Link>
          )}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mt-2 mb-8">
            {title}
          </h1>
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
