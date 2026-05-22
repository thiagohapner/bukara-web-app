"use client";

import Link from "next/link";
import Image from "next/image";
import { formatEur } from "@/lib/pricing";
import { Check, ArrowRight } from "lucide-react";

const IMAGE_BG_EVEN = "#e6eff5";
const IMAGE_BG_ODD  = "#f5ede8";
const ICON_LABELS   = ["X99", "X99+HSK", "X99+TBN"];

export interface DealCardData {
  slug: string;
  href: string;
  title: string;
  subtitle: string;
  discountPercent: number;
  fromCampaignPrice: number;
  fromOriginalPrice: number;
  includedProducts: string[];
  cardImage?: string;
}

interface Props {
  deal: DealCardData;
  index: number;
}

export default function DealCard({ deal, index }: Props) {
  const isEven    = index % 2 === 0;
  const imageBg   = isEven ? IMAGE_BG_EVEN : IMAGE_BG_ODD;
  const iconLabel = ICON_LABELS[index] ?? "SET";

  const imageBlock = (
    <div
      className={`relative flex-shrink-0 flex items-center justify-center w-full sm:w-[42%] h-48 sm:h-auto overflow-hidden ${!isEven ? "sm:order-last" : ""}`}
      style={{ background: imageBg, minHeight: "260px" }}
    >
      {deal.discountPercent > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-[#9B242A] text-white text-[12px] font-bold px-2.5 py-1 rounded-full tracking-wide">
          -{deal.discountPercent}%
        </span>
      )}
      {deal.cardImage ? (
        <Image src={deal.cardImage} alt={deal.title} fill className="object-cover" />
      ) : (
        <span className="text-5xl font-black tracking-tighter select-none text-center px-4" style={{ color: "rgba(0,165,151,0.15)" }}>
          {iconLabel}
        </span>
      )}
    </div>
  );

  const contentBlock = (
    <div className={`flex-1 p-8 sm:p-10 flex flex-col justify-center ${!isEven ? "sm:order-first" : ""}`}>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
        {deal.title}
      </h2>
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">{deal.subtitle}</p>

      <div className="mb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Enthaltene Produkte
        </p>
        <ul className="flex flex-col gap-1.5">
          {deal.includedProducts.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-slate-900">
              <Check className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
              {p}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-2 flex items-baseline gap-3 flex-wrap">
        <div>
          <span className="text-xs text-slate-400 font-medium">Ab </span>
          <span className="text-2xl font-extrabold text-[#9B242A]">{formatEur(deal.fromCampaignPrice)}</span>
        </div>
        <span className="flex items-baseline gap-1">
          <span className="text-sm text-slate-400 line-through">{formatEur(deal.fromOriginalPrice)}</span>
          {deal.discountPercent > 0 && (
            <span className="text-sm font-semibold text-[#9B242A]">-{deal.discountPercent}%</span>
          )}
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-7 leading-relaxed">
        Ab 200 € kostenloser Versand · Ab 500 € zusätzlich −10%
      </p>

      <div>
        <Link href={deal.href} className="btn-orange inline-flex items-center gap-2" style={{ textDecoration: "none" }}>
          Zum Angebot
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
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
