import { BRANDS } from "@/lib/data";

export default function BrandStrip() {
  const doubled = [...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS];

  return (
    <section className="py-12 bg-white border-y border-slate-100 overflow-hidden">
      <div className="marquee-track">
        {doubled.map((brand, i) => (
          <div
            key={i}
            className="px-10 flex items-center gap-2 whitespace-nowrap"
          >
            <div className="w-2 h-2 rounded-full bg-orange-400 opacity-60" />
            <span className="text-slate-400 font-semibold text-base tracking-wide">
              {brand}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
