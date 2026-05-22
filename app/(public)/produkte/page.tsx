import { Suspense } from "react";
import ProdukteCatalog from "./ProdukteCatalog";

export default function ProdukteePage() {
  return (
    <Suspense>
      <ProdukteCatalog />
    </Suspense>
  );
}
