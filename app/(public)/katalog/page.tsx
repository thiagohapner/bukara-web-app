import { Suspense } from "react";
import { getCatalogData } from "@/lib/katalog/data";
import KatalogCatalog from "./KatalogCatalog";

// Cached static render, refreshed every 5 min and on-demand from the admin
// product/SKU save actions via revalidateTag("catalog").
export const revalidate = 300;

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
