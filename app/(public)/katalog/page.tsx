import { Suspense } from "react";
import { getCatalogData } from "@/lib/katalog/data";
import KatalogCatalog from "./KatalogCatalog";

// Cached static render, refreshed daily and on-demand from the admin
// product/SKU save actions via revalidateTag("catalog"). The on-demand purge
// keeps content fresh; the long timer is just a fallback to minimize ISR writes.
export const revalidate = 86400;

export const metadata = {
  title: "Produktkatalog | Bukara GmbH",
  description: "Zerspanungswerkzeuge – alle Produkte und Varianten.",
};

export default async function KatalogPage() {
  const { cards, categories, allApplicationTags } = await getCatalogData();

  return (
    <Suspense>
      <KatalogCatalog
        initialCards={cards}
        allCategories={categories}
        allApplicationTags={allApplicationTags}
      />
    </Suspense>
  );
}
