import Link from "next/link";
import Footer from "@/components/Footer";

// Shared centered layout for the auth pages. Presentational only (no hooks),
// so it can be used from both server and client pages. The site Navbar comes
// from the (public) layout; this renders the card + Footer.
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  width = "md",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: "md" | "lg";
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
            <span className="text-slate-700 font-medium">{title}</span>
          </nav>
        </div>

        <div className="flex justify-center px-4 sm:px-6 pt-8 pb-20">
          <div className={`w-full ${width === "lg" ? "max-w-xl" : "max-w-md"}`}>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-slate-500 text-base leading-relaxed mb-8">{subtitle}</p>
            )}
            {!subtitle && <div className="mb-8" />}
            {children}
            {footer && <div className="mt-6 text-sm text-slate-500">{footer}</div>}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
