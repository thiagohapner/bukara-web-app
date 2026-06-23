import { getCatalogData } from "@/lib/katalog/data";
import type { ProductCardData } from "./ProductCard";
import SelectedProductsCarousel from "./SelectedProductsCarousel";

// MVP curation: a hand-picked mix of real catalog products (by SKU slug), in display order.
// Each slug is verified to exist in v2.catalog_sku_cards. Missing slugs are silently skipped.
const SELECTED_SLUGS = [
  "vhw-highspeedfraeser-x99-d9-52-nl25-4-gl76-2-s9-52", // X99 NeXcut (flagship)
  "hw-zylinderkopfbohrer-hbh1-d15-d15-gl57-5-s10x26-rechts", // Scharnierbohrer
  "hw-duebelbohrer-bbh5-ohne-rueckenfuehrung-d5-nl27-gl57-5-links", // 2-Nut-Dübelbohrer
  "dp-schaftfraeser-dtad10-15-d10-nl9-5-15-gl63-s12-z1-1-h2-5-rechts", // Diamant Fräser Z1+1
  "vhw-schruppfraeser-sf01d6-itiv-d6-nl32-gl70-s6-z3-rechtsl-positiv", // VHW Schruppfräser Z3
  "vhw-schlichtfraeser-sp01d3-itiv-d3-nl6-gl60-s3-z1-rechtsl-positiv", // VHW Schlichtfräser (Alu)
  "hw-kreissaegeblatt-p04300-x-3-2-2-2-x-30-fzph03-300-x-3-2-2-2-x-30-z20-fz", // Kreissägeblatt Holz
  "praezisionsspannzange-er-16-din-6499-d10-l28-d17-er-16-din-6499", // Spannzange ER16
];

export default async function SelectedProducts() {
  const { cards } = await getCatalogData();
  const bySlug = new Map(cards.map((c) => [c.slug, c]));
  const selected = SELECTED_SLUGS
    .map((slug) => bySlug.get(slug))
    .filter((c): c is (typeof cards)[number] => Boolean(c)) as ProductCardData[];

  if (selected.length === 0) return null;

  return <SelectedProductsCarousel cards={selected} />;
}
