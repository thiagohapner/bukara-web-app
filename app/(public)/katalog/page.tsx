import { Suspense } from "react";
import KatalogCatalog from "./KatalogCatalog";

export const metadata = {
  title: "Produktkatalog | Bukara GmbH",
  description: "Zerspanungswerkzeuge – alle Produkte und Varianten.",
};

export default function KatalogPage() {
  return (
    <Suspense>
      <KatalogCatalog />
    </Suspense>
  );
}
