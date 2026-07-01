import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";
import ProductCard, { ProductCardData } from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";
import Testimonials from "@/components/Testimonials";
import { SERVICES } from "@/lib/data";

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
] as const;

const SHADOWS = ["xs", "sm", "md", "lg", "xl"] as const;

const RADII = [
  ["sm — buttons, inputs", "4px"],
  ["md — cards", "8px"],
  ["lg — panels, galleries", "12px"],
  ["xl — hero frames", "24px"],
  ["pill — chips, badges", "9999px"],
] as const;

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
        description="Font family: Geist. Display/heading tokens are weight 300 (light) — most templates on the live site still use 600–900; see DESIGN_SYSTEM.md §8 for the migration list."
      >
        <div className="flex flex-col gap-6">
          <div className="heading-xxl">Display XXL / 56 / 300</div>
          <div className="heading-xl">Display XL / 48 / 300</div>
          <div className="heading-h2">H2 / 32 / 300</div>
          <div className="heading-h3">H3 / 26 / 300</div>
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
          <button type="button" className="btn-orange">Primary — .btn-orange</button>
          <button type="button" className="btn-black">Secondary — .btn-black</button>
          <button type="button" className="btn-outline">Tertiary — .btn-outline</button>
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
