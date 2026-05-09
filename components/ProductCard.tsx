import Image from "next/image";
import Link from "next/link";
import type { BukaraProduct } from "@/lib/data";

const PLACEHOLDER_BG = ["#e6eff5", "#f5ede8", "#e8f7f6"];

interface Props {
  product: BukaraProduct;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const bg = PLACEHOLDER_BG[index % PLACEHOLDER_BG.length];

  return (
    <Link href={`/produkte/${product.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <div className="product-card bg-white rounded-2xl overflow-hidden border border-slate-100 group">

        {/* Portrait image */}
        <div className="relative aspect-[3/4] overflow-hidden" style={{ background: bg }}>
          {product.badge && (
            <span className="absolute top-3 left-3 z-10 bg-[#9B242A] text-white text-[12px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
              {product.badge}
            </span>
          )}
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover img-zoom"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl font-black tracking-tighter select-none" style={{ color: "rgba(0,165,151,0.18)" }}>
                {product.name.substring(0, 3).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
            Zerspanungswerkzeug
          </p>
          <h3 className="text-sm font-semibold text-slate-900 mb-2 leading-snug line-clamp-2">
            {product.name}
          </h3>
          {(product.campaignPrice != null || product.originalPrice != null || product.hasVariants) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[15px] font-bold ${(product.hasVariants || product.campaignPrice != null) ? "text-[#9B242A]" : "text-slate-900"}`}>
                {product.hasVariants ? "ab " : ""}
                {product.hasVariants
                  ? "55,72"
                  : (product.campaignPrice ?? product.originalPrice)!.toFixed(2).replace(".", ",")} €
              </span>
              {product.hasVariants ? (
                <span className="text-xs text-slate-500 line-through">79,60 €</span>
              ) : (
                product.campaignPrice != null && product.originalPrice != null && (
                  <span className="text-xs text-slate-500 line-through">
                    {product.originalPrice.toFixed(2).replace(".", ",")} €
                  </span>
                )
              )}
            </div>
          )}
        </div>

      </div>
    </Link>
  );
}
