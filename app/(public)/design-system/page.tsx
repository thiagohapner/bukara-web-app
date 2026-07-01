import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";
import ProductCard, { ProductCardData } from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";
import Testimonials from "@/components/Testimonials";
import { SERVICES } from "@/lib/data";
import { Users, LifeBuoy, Grid2x2Plus, Check, ChevronLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Design System — Bukara (internal)",
  robots: { index: false, follow: false },
};

const BRAND_RAMP = [
  ["25", "#F5FAFA"], ["50", "#EAF5F4"], ["75", "#E2F1F0"], ["100", "#D6EBE9"],
  ["200", "#B4DAD7"], ["300", "#84CDC7"], ["400", "#27D8CA"], ["500", "#01A497"],
  ["600", "#04857B"], ["700", "#07645D"], ["800", "#074843"], ["900", "#062F2C"],
  ["950", "#05211F"], ["975", "#041A19"],
] as const;

const NEUTRAL_RAMP = [
  ["25", "#F7FBFA"], ["50", "#E2EFED"], ["100", "#D0E1DE"], ["200", "#B2CDC9"],
  ["300", "#8AABA6"], ["400", "#6F938E"], ["500", "#567C76"], ["600", "#416963"],
  ["700", "#2B5751"],
] as const;

const SEMANTIC_COLORS = [
  ["Primary ink", "#022221"],
  ["Sale / badge red", "#9B242A"],
  ["Error", "#FF3C40"],
  ["Canvas", "#ffffff"],
  ["Canvas parchment", "#f5f5f7"],
  ["Surface dark", "#041A19"],
] as const;

const SHADOWS = ["xs", "sm", "md", "lg", "xl"] as const;

const RADII = [
  ["sm — buttons, inputs", "4px"],
  ["md — cards", "8px"],
  ["lg — panels, galleries", "12px"],
  ["xl — hero frames", "24px"],
  ["pill — chips, badges", "9999px"],
] as const;

const CHECKLIST_ITEMS = [
  "Deutschlandweit",
  "Kostenloser Abholservice",
  "Fertig in 1–2 Wochen",
  "Keine Mindestmenge",
  "Auch für Fremdwerkzeuge",
];

const MOCK_PRODUCTS: ProductCardData[] = [
  {
    slug: "beispiel-schaftfraeser",
    name: "VHM Schaftfräser Z3 10mm",
    badge: "Neu",
    galleryBg: "#EEEEEE",
    variantLabel: "10 x 25 x 75mm",
    fromCampaignPrice: 4490,
    fromOriginalPrice: 5990,
    hasStaffelpreis: true,
  },
  {
    slug: "beispiel-bohrer",
    name: "DIA Scharnierbohrer Set",
    galleryBg: "#EEEEEE",
    fromOriginalPrice: 12900,
  },
];

function Swatch({ label, hex }: { label: string; hex: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-16 rounded-md border border-neutral-100"
        style={{ backgroundColor: hex }}
      />
      <div className="text-xs text-neutral-600 font-normal">
        <div className="font-medium text-slate-900">{label}</div>
        <div>{hex}</div>
      </div>
    </div>
  );
}

function Block({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="py-14 border-b border-neutral-50">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <h2 className="heading-h3 mb-2">{title}</h2>
        {description && (
          <p className="text-sm text-neutral-500 max-w-2xl mb-8">{description}</p>
        )}
        {children}
      </div>
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="bg-white">
      <div className="bg-brand-25 border-b border-neutral-100">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10">
          <p className="text-xs font-normal uppercase tracking-wide text-brand-600 mb-2">
            Internal — not indexed, not linked from nav
          </p>
          <h1 className="heading-h1 mb-3">Bukara Design System</h1>
          <p className="text-base text-neutral-600 max-w-2xl">
            Live reference for the tokens in <code>app/globals.css</code> and the
            rules in <code>DESIGN_SYSTEM.md</code>. The header/footer on this page
            are the real production components — this is what &quot;on brand&quot;
            looks like today, plus where it still isn&apos;t consistently applied.
          </p>
        </div>
      </div>

      <Block
        title="Brand ramp"
        description="--color-brand-{25…975}. 500 is the exact brand hex (#01A497) and the only color allowed for primary actions, active links, and focus states."
      >
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-4">
          {BRAND_RAMP.map(([step, hex]) => (
            <Swatch key={step} label={`brand-${step}`} hex={hex} />
          ))}
        </div>
      </Block>

      <Block
        title="Neutral ramp"
        description="--color-neutral-{25…700}. Green-tinted — use these for borders, dividers, icons, and quiet text instead of Tailwind's default slate/gray."
      >
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-4">
          {NEUTRAL_RAMP.map(([step, hex]) => (
            <Swatch key={step} label={`neutral-${step}`} hex={hex} />
          ))}
        </div>
      </Block>

      <Block title="Semantic colors">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {SEMANTIC_COLORS.map(([label, hex]) => (
            <Swatch key={label} label={label} hex={hex} />
          ))}
        </div>
      </Block>

      <Block
        title="Typography"
        description="Font family: Geist. Every size — display down to nav links — defaults to weight 400 (regular); hierarchy comes from size/letter-spacing/color, not boldness. Most templates on the live site still use 600–900; see DESIGN_SYSTEM.md §8 for the migration list."
      >
        <div className="flex flex-col gap-6">
          <div>
            <div className="heading-xxl">Display XXL / 56 / 400</div>
            <p className="text-xs text-neutral-500 mt-1">.heading-xxl — stat/hero numbers only</p>
          </div>
          <div>
            <div className="heading-xl">Display XL / 48 / 400</div>
            <p className="text-xs text-neutral-500 mt-1">.heading-xl — reserved, not currently used on any live page</p>
          </div>
          <div>
            <div className="heading-l">Display L / 44 / 400</div>
            <p className="text-xs text-neutral-500 mt-1">.heading-l — big promo banner headlines. Bukara addition, doesn&apos;t exist in the Stripe reference — sits between Display XL and H1/H2.</p>
          </div>
          <div>
            <div className="heading-h2">H2 / 32 / 400</div>
            <p className="text-xs text-neutral-500 mt-1">.heading-h2 — reserved for larger/hero-adjacent headings, used sparingly</p>
          </div>
          <div>
            <div className="heading-h3">H3 / 26 / 400</div>
            <p className="text-xs text-neutral-500 mt-1">.heading-h3 — default for section headers, PDP product names, page titles, and similar, unless stated otherwise</p>
          </div>
          <p className="body-text max-w-xl">
            Body / 16 / 400 — Bequem und sicher bezahlen, deutschlandweiter
            Schärfservice, exklusiver Partner von ITA Tools.
          </p>
          <p className="text-sm font-normal text-neutral-600">Nav link / 14 / 400</p>
        </div>
      </Block>

      <Block title="Radius scale">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {RADII.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-2">
              <div
                className="h-16 bg-brand-50 border border-brand-100"
                style={{ borderRadius: value === "9999px" ? "9999px" : value }}
              />
              <div className="text-xs text-neutral-600">
                <div className="font-medium text-slate-900">{label}</div>
                <div>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block
        title="Shadows"
        description="Double-layer, brand-teal-tinted (rgba(4,72,67,…)) — not Tailwind's default grey shadow scale."
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {SHADOWS.map((s) => (
            <div key={s} className="flex flex-col items-center gap-3">
              <div
                className="h-20 w-20 rounded-lg bg-white"
                style={{ boxShadow: `var(--shadow-${s})` }}
              />
              <span className="text-xs text-neutral-600">shadow-{s}</span>
            </div>
          ))}
        </div>
      </Block>

      <Block
        title="Motion"
        description="Two tracks only — hover these to feel the difference. Nav/UI: 240ms standard ease. Buttons: 300ms emphasis ease."
      >
        <div className="flex flex-wrap items-center gap-6">
          <span
            role="link"
            tabIndex={0}
            className="text-sm font-normal text-slate-900 hover:text-brand-500 transition-colors duration-[240ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)] cursor-pointer"
          >
            Nav link (240ms standard)
          </span>
          <button
            type="button"
            className="rounded-sm border border-slate-800 px-4 py-2.5 text-sm font-normal text-slate-900 hover:bg-brand-25 hover:border-brand-600 transition-colors duration-[300ms] ease-[cubic-bezier(0.25,1.00,0.50,1.00)]"
          >
            Button (300ms emphasis)
          </button>
        </div>
      </Block>

      <Block
        title="Buttons"
        description="Shared classes from app/globals.css — reuse these instead of one-off Tailwind button styles."
      >
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" className="btn-brand">Primary — .btn-brand</button>
          <button type="button" className="btn-black">Secondary — .btn-black</button>
          <button type="button" className="btn-outline">Tertiary — .btn-outline</button>
        </div>
      </Block>

      <Block
        title="Dark aurora hero banner"
        description="Sonderlösungen/Schärfservice homepage banners (components/BannerSonderwerkzeuge.tsx, darkHero slides): deep brand-teal surface, eyebrow → .heading-l (Display L) in white → .body-text--on-dark → two-tier CTA (flat .btn-brand + arrow link), .checklist--on-dark, no shadow, rounded-md. The live component adds an animated aurora glow (components/BannerAurora.tsx), not shown in this static mock. The X99 banner is untouched — still .heading-xl, dark image bg, drop shadow."
      >
        <div
          className="rounded-md overflow-hidden border px-10 py-10 max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-8 items-center"
          style={{ background: "var(--color-surface-dark)", borderColor: "var(--color-border-dark)" }}
        >
          <div>
            <p className="eyebrow text-brand-300 mb-3">Schärfservice</p>
            <h3 className="heading-l m-0" style={{ color: "var(--color-text-dark-heading)" }}>
              Nachschliff, der Standzeit verlängert
            </h3>
            <p className="body-text body-text--on-dark mt-4 max-w-[420px]">
              Präzise, schnell, bundesweit.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="btn-brand">Schärfauftrag starten</span>
              <span className="inline-flex items-center gap-1 text-sm" style={{ color: "var(--color-text-dark-link)" }}>
                Mehr erfahren <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </span>
            </div>
          </div>
          <div className="checklist checklist--on-dark">
            {["Bundesweit", "Fertig in 1–2 Wochen", "Auch für Fremdwerkzeuge", "Keine Mindestmenge"].map((t) => (
              <div key={t} className="checklist-item">
                <span className="checklist-badge"><Check className="w-3 h-3" strokeWidth={3} /></span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </Block>

      <Block
        title="Icon tiles"
        description="Square icon container for trust badges, contact links, and feature callouts — .icon-tile / .icon-tile--sm / .icon-tile--lg."
      >
        <div className="flex flex-wrap items-center gap-6">
          <div className="icon-tile"><Users className="w-5 h-5" strokeWidth={1.75} /></div>
          <div className="icon-tile"><LifeBuoy className="w-5 h-5" strokeWidth={1.75} /></div>
          <div className="icon-tile"><Grid2x2Plus className="w-5 h-5" strokeWidth={1.75} /></div>
          <div className="icon-tile icon-tile--sm"><Users className="w-4 h-4" strokeWidth={1.75} /></div>
          <div className="icon-tile icon-tile--lg"><Users className="w-6 h-6" strokeWidth={1.75} /></div>
        </div>
      </Block>

      <Block
        title="Checklist"
        description="Circular brand checkmark + label — .checklist / .checklist-item / .checklist-badge, for benefit lists (sidebars, promo panels)."
      >
        <div className="checklist bg-brand-25 border border-neutral-100 rounded-md p-6 max-w-sm">
          {CHECKLIST_ITEMS.map((item) => (
            <div key={item} className="checklist-item">
              <span className="checklist-badge"><Check className="w-3 h-3" strokeWidth={3} /></span>
              {item}
            </div>
          ))}
        </div>
      </Block>

      <Block
        title="Form elements"
        description="Extracted from the Schärfservice form redesign (design-system/schaerfservice-reference/) — not wired into the live form yet, reference for that future rebuild."
      >
        <div className="flex flex-col gap-8 max-w-xl">
          <div>
            <p className="text-xs text-neutral-500 mb-2">.form-label + .form-input</p>
            <label className="form-label" htmlFor="ds-demo-input">Firma</label>
            <input id="ds-demo-input" className="form-input" placeholder="Muster GmbH" readOnly />
          </div>

          <div>
            <p className="text-xs text-neutral-500 mb-2">.form-pill (multi-select)</p>
            <div className="flex flex-wrap gap-2.5">
              <span className="form-pill form-pill--selected">Bohrer</span>
              <span className="form-pill">DP &amp; HW Werkzeuge</span>
              <span className="form-pill">Vollhartmetall Fräser</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-neutral-500 mb-2">.form-option-card + .form-option-badge (single-select)</p>
            <div className="flex flex-col gap-2">
              <div className="form-option-card form-option-card--selected">
                <span className="form-option-badge form-option-badge--selected"><Check className="w-3 h-3" strokeWidth={3} /></span>
                <span className="text-base font-normal">Büro</span>
              </div>
              <div className="form-option-card">
                <span className="form-option-badge"><Check className="w-3 h-3" strokeWidth={3} /></span>
                <span className="text-base font-normal">Warenannahme</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs text-neutral-500 mb-2">.form-chip (date/time picker trigger)</p>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="form-chip form-chip--active">3 Jul 2026</span>
              <span className="text-sm text-neutral-500">von</span>
              <span className="form-chip">08:30</span>
              <span className="text-sm text-neutral-500">bis</span>
              <span className="form-chip">18:00</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-neutral-500 mb-2">.form-step-label + .form-progress-track/.form-progress-fill</p>
            <div className="flex items-center gap-3">
              <span className="form-step-label">Schritt 2 von 6</span>
              <span className="form-progress-track">
                <span className="form-progress-fill" style={{ width: "33%" }} />
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-neutral-500 mb-2">Back/next navigation + .kbd hint</p>
            <div className="flex items-center gap-3">
              <button type="button" aria-label="Zurück" className="w-12 h-12 flex-shrink-0 border border-neutral-100 bg-white rounded-sm cursor-pointer flex items-center justify-center text-neutral-600">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button type="button" className="btn-brand">
                Weiter <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-xs text-neutral-500 flex items-center gap-1.5">
                drücken Sie <span className="kbd">Enter ↵</span>
              </span>
            </div>
          </div>
        </div>
      </Block>

      <Block title="Section header (real component)" description="components/SectionHeader.tsx, used as-is on the homepage.">
        <SectionHeader title="Beliebte Produkte" viewAllHref="#" />
      </Block>

      <Block title="Product cards (real component)" description="components/ProductCard.tsx with sample data — grid variant.">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 max-w-3xl">
          {MOCK_PRODUCTS.map((card) => (
            <ProductCard key={card.slug} card={card} />
          ))}
        </div>
      </Block>

      <Block title="Service card (real component)" description="components/ServiceCard.tsx, rendered with live SERVICES data.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
          {SERVICES.slice(0, 2).map((service, i) => (
            <ServiceCard key={service.slug} service={service} index={i} />
          ))}
        </div>
      </Block>

      <div className="py-14">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          <h2 className="heading-h3 mb-8">Testimonials (real section)</h2>
        </div>
        <Testimonials />
      </div>
    </main>
  );
}
