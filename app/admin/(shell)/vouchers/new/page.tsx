import VoucherEditClient from "../[id]/VoucherEditClient";
import { loadVoucherOptions } from "../options";

export const dynamic = "force-dynamic";

export default async function NewVoucherPage() {
  const { products, seriesList, categories } = await loadVoucherOptions();
  return (
    <VoucherEditClient
      voucherId={null}
      initial={null}
      redemptionCount={0}
      products={products}
      seriesList={seriesList}
      categories={categories}
    />
  );
}
