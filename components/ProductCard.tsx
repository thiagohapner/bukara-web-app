import Image from "next/image";
import Link from "next/link";
import { formatEur } from "@/lib/pricing";
import CardFlag, { CardFlagStack } from "@/components/CardFlag";

export interface ProductCardData {
  slug: string;
  name: string;
  badge?: string;
  image?: string;
  galleryBg: string;
  hasVariants?: boolean;
  variantLabel?: string;
  fromCampaignPrice?: number;
  fromOriginalPrice?: number;
  hasStaffelpreis?: boolean;
  hrefPrefix?: string;
  variant?: "grid" | "list";
}

export default function ProductCard({ card }: { card: ProductCardData }) {
  const showPrice = card.fromCampaignPrice != null || card.fromOriginalPrice != null;
  const isCampaign = card.fromCampaignPrice != null && card.fromOriginalPrice != null && card.fromCampaignPrice < card.fromOriginalPrice;

  if (card.variant === "list") {
    return (
      <Link href={`${card.hrefPrefix ?? "/produkte"}/${card.slug}`} style={{ textDecoration: "none", display: "block" }}>
        <div className="bg-white rounded-md overflow-hidden border border-neutral-50 group flex items-center gap-4 p-3">
          <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden" style={{ background: "#EEEEEE" }}>
            {card.badge && (
              <span className="absolute top-2 left-2 z-10 bg-sale text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                {card.badge}
              </span>
            )}
            {card.image ? (
              <Image src={card.image} alt={card.name} fill unoptimized className="object-contain" sizes="80px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-sm font-semibold tracking-tighter select-none" style={{ color: "rgba(1,164,151,0.18)" }}>
                  {card.name.substring(0, 3).toUpperCase()}
                </span>
              </div>
            )}
            {(isCampaign || card.hasStaffelpreis) && (
              <CardFlagStack size="list">
                {isCampaign && <CardFlag label="Deal" tone="deal" size="list" />}
                {card.hasStaffelpreis && <CardFlag label="Staffelpreise" size="list" />}
              </CardFlagStack>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-slate-900 mb-1 leading-snug">
              {card.name}
            </h3>
            {card.variantLabel && (
              <p className="text-sm text-neutral-500 mb-1 leading-snug">{card.variantLabel}</p>
            )}
            {showPrice && (
              <div>
                <div className={`text-[15px] font-bold ${isCampaign ? "text-sale" : "text-slate-900"}`}>
                  {card.hasVariants ? "ab " : ""}
                  {formatEur(card.fromCampaignPrice ?? card.fromOriginalPrice ?? 0)}
                </div>
                {isCampaign && (
                  <div className="text-xs text-neutral-500 mt-0.5">
                    Statt <span className="line-through">{formatEur(card.fromOriginalPrice!)}</span>{" "}
                    <span className="font-semibold text-sale">
                      -{Math.round((1 - card.fromCampaignPrice! / card.fromOriginalPrice!) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`${card.hrefPrefix ?? "/produkte"}/${card.slug}`} className="h-full" style={{ textDecoration: "none", display: "block" }}>
      <div className="product-card bg-white rounded-md overflow-hidden border border-neutral-50 group flex flex-col h-full">

        {/* Portrait image */}
        <div className="relative aspect-[10/11] overflow-hidden flex-shrink-0" style={{ background: "#EEEEEE" }}>
          {card.badge && (
            <span className="absolute top-3 left-3 z-10 bg-sale text-white text-[12px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
              {card.badge}
            </span>
          )}
          {card.image ? (
            <div className="absolute inset-0">
              <Image
                src={card.image}
                alt={card.name}
                fill
                unoptimized
                className="object-contain img-zoom"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl font-semibold tracking-tighter select-none" style={{ color: "rgba(1,164,151,0.18)" }}>
                {card.name.substring(0, 3).toUpperCase()}
              </span>
            </div>
          )}
          {(isCampaign || card.hasStaffelpreis) && (
            <CardFlagStack>
              {isCampaign && <CardFlag label="Deal" tone="deal" />}
              {card.hasStaffelpreis && <CardFlag label="Staffelpreise" />}
            </CardFlagStack>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-sm font-medium text-slate-900 mb-1 leading-snug line-clamp-2">
            {card.name}
          </h3>
          {card.variantLabel && (
            <p className="text-sm text-neutral-500 mb-2 leading-snug">{card.variantLabel}</p>
          )}
          {showPrice && (
            <div className="mt-auto">
              <div className={`text-[15px] font-bold ${isCampaign ? "text-sale" : "text-slate-900"}`}>
                {card.hasVariants ? "ab " : ""}
                {formatEur(card.fromCampaignPrice ?? card.fromOriginalPrice ?? 0)}
              </div>
              {isCampaign && (
                <div className="text-xs text-neutral-500 mt-0.5">
                  Statt <span className="line-through">{formatEur(card.fromOriginalPrice!)}</span>{" "}
                  <span className="font-semibold text-sale">
                    -{Math.round((1 - card.fromCampaignPrice! / card.fromOriginalPrice!) * 100)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </Link>
  );
}
