import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSortimentCategories } from "@/lib/sortiment/data";

// Data-driven home-page entry tiles. Categories with v2.categories.show_on_home = true
// (ordered by home_sort_order) each get a tile linking to their /sortiment landing page.
// Adding/removing a tile is a DB change only — never a code change.
export default async function SortimentTiles() {
  const categories = await getSortimentCategories();
  if (categories.length === 0) return null;

  return (
    <section className="py-8 bg-white">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight mb-8">
          Unser Sortiment
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/sortiment/${category.slug}`}
              style={{ textDecoration: "none" }}
              className="group flex flex-col gap-4 rounded-md border border-slate-100 bg-white p-4 hover:border-slate-300 transition-colors"
            >
              <div className="relative w-full aspect-square rounded-md overflow-hidden bg-[#E8EAE3]">
                {category.exampleImage && (
                  <Image
                    src={category.exampleImage}
                    alt={category.name}
                    fill
                    className="object-contain p-4"
                  />
                )}
              </div>
              <div className="flex flex-col justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-900 leading-snug">
                  {category.name}
                </h3>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 group-hover:text-slate-900 transition-colors">
                  Sortiment ansehen
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
