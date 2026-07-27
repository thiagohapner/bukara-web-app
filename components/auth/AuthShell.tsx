import { Phone, Mail } from "lucide-react";
import Footer from "@/components/Footer";

// Shared layout for the auth pages — mirrors the request-form layout (aurora
// background, left rail + centered content column). Presentational only (no
// hooks), usable from server and client pages. Logged-out, so the left rail
// carries a brief intro + contact rather than the account menu.
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
          <div className="flex flex-col lg:flex-row lg:justify-center gap-8 lg:gap-[70px] xl:gap-[120px] py-12 lg:min-h-[calc(100vh-108px)] lg:items-center">

            {/* Left rail — intro + contact */}
            <aside className="w-full lg:w-[260px] flex-shrink-0 flex flex-col">
              <h2 className="text-[15px] font-medium text-slate-900 mb-2">Bukara Konto</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Ihre Bestellungen und Anfragen an einem Ort — mit schnellerem
                Checkout beim nächsten Einkauf.
              </p>

              <div className="hidden lg:block mt-9">
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
            <div className={`w-full flex-shrink-0 min-w-0 ${width === "lg" ? "lg:w-[520px]" : "lg:w-[440px]"}`}>
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
