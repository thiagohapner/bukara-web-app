import Image from "next/image";
import Link from "next/link";
import { formatEur } from "@/lib/pricing";

export interface ProductCardData {
  slug: string;
  name: string;
  badge?: string;
  image?: string;
  galleryBg: string;
  hasVariants?: boolean;
  fromCampaignPrice?: number;
  fromOriginalPrice?: number;
  categoryLabel?: string;
  hrefPrefix?: string;
}

export default function ProductCard({ card }: { card: ProductCardData }) {
  const showPrice = card.fromCampaignPrice != null || card.fromOriginalPrice != null;
  const isCampaign = card.fromCampaignPrice != null && card.fromOriginalPrice != null && card.fromCampaignPrice < card.fromOriginalPrice;

  return (
    <Link href={`${card.hrefPrefix ?? "/produkte"}/${card.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <div className="product-card bg-white rounded-2xl overflow-hidden border border-slate-100 group">

        {/* Portrait image */}
        <div className="relative aspect-[10/11] overflow-hidden" style={{ background: "#EEEEEE" }}>
          {card.badge && (
            <span className="absolute top-3 left-3 z-10 bg-[#9B242A] text-white text-[12px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
              {card.badge}
            </span>
          )}
          {card.image ? (
            <div className="absolute inset-0">
              <Image
                src={card.image}
                alt={card.name}
                fill
                className="object-contain img-zoom"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl font-black tracking-tighter select-none" style={{ color: "rgba(0,165,151,0.18)" }}>
                {card.name.substring(0, 3).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
            {card.categoryLabel ?? "Zerspanungswerkzeug"}
          </p>
          <h3 className="text-sm font-semibold text-slate-900 mb-2 leading-snug line-clamp-2">
            {card.name}
          </h3>
          {showPrice && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[15px] font-bold ${isCampaign ? "text-[#9B242A]" : "text-slate-900"}`}>
                {card.hasVariants ? "ab " : ""}
                {formatEur(card.fromCampaignPrice ?? card.fromOriginalPrice ?? 0)}
              </span>
              {isCampaign && (
                <span className="flex items-baseline gap-1">
                  <span className="text-xs text-slate-500 line-through">{formatEur(card.fromOriginalPrice!)}</span>
                  <span className="text-xs font-semibold text-[#9B242A]">
                    -{Math.round((1 - card.fromCampaignPrice! / card.fromOriginalPrice!) * 100)}%
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

      </div>
    </Link>
  );
}
