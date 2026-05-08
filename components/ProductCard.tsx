import Image from "next/image";
import type { Product } from "@/lib/data";

interface Props {
  product: Product;
  size?: "md" | "lg";
}

export default function ProductCard({ product, size = "md" }: Props) {
  return (
    <div className="product-card bg-white rounded-2xl overflow-hidden border border-slate-100 cursor-pointer group">
      {/* Image area */}
      <div className={`relative overflow-hidden bg-slate-50 ${size === "lg" ? "h-56" : "h-44"}`}>
        {product.badge && (
          <span className="absolute top-3 left-3 z-10 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            {product.badge}
          </span>
        )}
        {product.originalPrice && !product.badge && (
          <span className="absolute top-3 left-3 z-10 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            SALE
          </span>
        )}
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="img-zoom object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {/* Quick add */}
        <button className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-250 hover:bg-orange-500 hover:text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
          {product.category}
        </p>
        <h3 className="text-sm font-semibold text-slate-800 mb-2 leading-snug line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-slate-900">
            ${product.price.toFixed(2)}{" "}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </span>
          {product.originalPrice && (
            <span className="text-xs text-slate-400 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
