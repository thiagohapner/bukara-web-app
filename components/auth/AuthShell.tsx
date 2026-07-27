import Footer from "@/components/Footer";

// Shared layout for the auth pages — the request-form aurora background with a
// single, centered content column (no left rail; the form is the focus).
// Presentational only (no hooks), usable from server and client pages.
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
      <main className="min-h-screen form-aurora-bg">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          <div className="flex justify-center py-12 lg:py-16 lg:min-h-[calc(100vh-108px)] lg:items-center">
            <div className={`w-full ${width === "lg" ? "max-w-[520px]" : "max-w-[420px]"}`}>
              <h1 className="heading-h2 mb-2">{title}</h1>
              {subtitle && <p className="text-slate-500 leading-relaxed mb-8">{subtitle}</p>}
              {!subtitle && <div className="mb-8" />}
              {children}
              {footer && <div className="mt-6 text-sm text-slate-500">{footer}</div>}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
