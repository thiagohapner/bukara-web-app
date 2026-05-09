"use client";

import Link from "next/link";
import Image from "next/image";
import { Deal } from "@/lib/data";

const IMAGE_COLORS_EVEN = "#e6eff5";
const IMAGE_COLORS_ODD = "#f5ede8";

const DEAL_ICON_LABELS = ["X99", "X99+HSK", "X99+TBN"];

interface DealCardProps {
  deal: Deal;
  index: number;
}

export default function DealCard({ deal, index }: DealCardProps) {
  const isEven = index % 2 === 0;
  const imageBg = isEven ? IMAGE_COLORS_EVEN : IMAGE_COLORS_ODD;
  const iconLabel = DEAL_ICON_LABELS[index] ?? "SET";

  const heroImage = deal.cardImage ?? null;

  const imageBlock = (
    <div
      className={`relative flex-shrink-0 flex items-center justify-center w-full sm:w-[42%] h-48 sm:h-auto overflow-hidden ${!isEven ? "sm:order-last" : ""}`}
      style={{ background: imageBg, minHeight: "260px" }}
    >
      {heroImage ? (
        <Image src={heroImage} alt={deal.title} fill className="object-cover" />
      ) : (
        <span
          className="text-5xl font-black tracking-tighter select-none text-center px-4"
          style={{ color: "rgba(0,165,151,0.15)" }}
        >
          {iconLabel}
        </span>
      )}
    </div>
  );

  const contentBlock = (
    <div className={`flex-1 p-8 sm:p-10 flex flex-col justify-center ${!isEven ? "sm:order-first" : ""}`}>
      {/* Badge */}
      <span className="inline-flex self-start text-[12px] font-bold bg-[#9B242A] text-white rounded-full px-3 py-1.5 leading-none tracking-wide mb-4">
        {deal.badge}
      </span>

      {/* Title & subtitle */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
        {deal.title}
      </h2>
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">{deal.subtitle}</p>

      {/* Included products */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Enthaltene Produkte
        </p>
        <ul className="flex flex-col gap-1.5">
          {deal.includedProducts.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-slate-900">
              <svg className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {p}
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div className="mb-2 flex items-baseline gap-3 flex-wrap">
        <div>
          <span className="text-xs text-slate-400 font-medium">Ab </span>
          <span className="text-2xl font-extrabold text-[#9B242A]">
            {deal.fromPrice.toFixed(2).replace(".", ",")} €
          </span>
        </div>
        <span className="text-sm text-slate-400 line-through">
          Statt {(deal.fromPrice / (1 - deal.discountPercent / 100)).toFixed(2).replace(".", ",")} €
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-7 leading-relaxed">
        inkl. {deal.discountPercent}% Kampagnenrabatt · Bei Bestellwert ab 500 € zusätzlich −10% und kostenloser Versand
      </p>

      {/* CTA */}
      <div>
        <Link
          href={`/angebote/${deal.slug}`}
          className="btn-orange inline-flex items-center gap-2"
          style={{ textDecoration: "none" }}
        >
          Zum Angebot
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="deal-card border border-slate-100 rounded-2xl overflow-hidden bg-white w-full flex flex-col sm:flex-row">
      {imageBlock}
      {contentBlock}
    </div>
  );
}
