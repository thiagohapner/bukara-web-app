import Image from "next/image";
import Link from "next/link";
import { getSortimentCategories } from "@/lib/sortiment/data";

// Short display labels for over-long DB category names (still link to the real slug).
const LABEL_OVERRIDES: Record<string, string> = {
  "dp-vhw-werkzeuge-verbundwerkstoffe": "DP & VHW Werkzeuge",
};

// One-line descriptors per category (authored — V2Category has no short blurb field).
const BLURBS: Record<string, string> = {
  bohrer: "Dübel-, Durchgangs- & Scharnierbohrer.",
  "dp-hw-werkzeuge": "Diamant- & Hartmetall-Fräser.",
  "vollhartmetall-fraeser": "Schlicht-, Schrupp- & Profilfräser.",
  "dp-vhw-werkzeuge-verbundwerkstoffe": "Werkzeuge für Verbundwerkstoffe.",
  kreissaegeblaetter: "Sägeblätter für Holz & Platten.",
};

export default async function CategoryShowcase() {
  const categories = await getSortimentCategories();
  if (categories.length === 0) return null;

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-12">
      <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-8">
        Entdecke unsere Kategorien.
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/sortiment/${category.slug}`}
            className="group block"
            style={{ textDecoration: "none" }}
          >
            <div
              className="relative aspect-[4/3] rounded-2xl overflow-hidden"
              style={{ background: "#F1F3F5" }}
            >
              {category.exampleImage && (
                <Image
                  src={category.exampleImage}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
                  className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <div className="mt-4 text-center px-2">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
                {LABEL_OVERRIDES[category.slug] ?? category.name}
              </h3>
              {BLURBS[category.slug] && (
                <p className="mt-1 text-sm text-slate-500 leading-snug">
                  {BLURBS[category.slug]}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
