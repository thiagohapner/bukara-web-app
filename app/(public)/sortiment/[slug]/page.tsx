import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import KatalogCatalog from "../../katalog/KatalogCatalog";
import { getSortimentCategories, getSortimentPageData } from "@/lib/sortiment/data";

const SITE_URL = "https://www.bukara.de";

// Cached static render, refreshed every 5 min and on-demand via revalidateTag("catalog").
export const revalidate = 300;

// Pre-render only the approved sub-catalog categories (show_on_home = true).
// Unknown slugs are still resolved on-demand and 404 via notFound().
export async function generateStaticParams() {
  const categories = await getSortimentCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSortimentPageData(slug);
  if (!data) return {};

  const { category } = data;
  const title = category.seo_title ?? `${category.name} | Bukara GmbH`;

  return {
    title,
    // Omit description entirely when no copy is set (no invented text).
    ...(category.seo_description ? { description: category.seo_description } : {}),
    // Filtered query variants (?material=…, ?sort=…) canonicalize back to the clean base path.
    alternates: { canonical: `/sortiment/${slug}` },
  };
}

export default async function SortimentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getSortimentPageData(slug);
  if (!data) notFound();

  const { category, initialCards, allCategories, allApplicationTags, categoryCards } = data;
  const heading = category.seo_title ?? category.name;

  // BreadcrumbList + ItemList — factual fields only (name, url, image from the DB).
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Start", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Sortiment" },
          {
            "@type": "ListItem",
            position: 3,
            name: category.name,
            item: `${SITE_URL}/sortiment/${slug}`,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: heading,
        numberOfItems: categoryCards.length,
        itemListElement: categoryCards.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          url: `${SITE_URL}/katalog/${c.slug}`,
          ...(c.image ? { image: c.image } : {}),
        })),
      },
    ],
  };

  // Server-rendered page header (breadcrumb + H1 + optional intro), passed to the
  // reused client catalog so it replaces the default "Home / Katalog" breadcrumb.
  const header = (
    <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-1">
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors" style={{ textDecoration: "none" }}>
          Start
        </Link>
        <span>/</span>
        <span>Sortiment</span>
        <span>/</span>
        <span className="text-slate-700 font-medium">{category.name}</span>
      </nav>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mt-4">
        {heading}
      </h1>
      {category.seo_description && (
        <p className="text-slate-600 text-sm leading-relaxed mt-3 max-w-3xl">
          {category.seo_description}
        </p>
      )}
    </div>
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense>
        <KatalogCatalog
          initialCards={initialCards}
          allCategories={allCategories}
          allApplicationTags={allApplicationTags}
          basePath={`/sortiment/${slug}`}
          lockedCategory={{ kategorie: "", sub: slug }}
          header={header}
        />
      </Suspense>
    </>
  );
}
