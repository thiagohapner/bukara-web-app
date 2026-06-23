import { getSortimentCategories } from "@/lib/sortiment/data";
import CategoryShowcaseCarousel, {
  type CategoryCardItem,
} from "./CategoryShowcaseCarousel";

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

  const items: CategoryCardItem[] = categories.map((category) => ({
    slug: category.slug,
    name: LABEL_OVERRIDES[category.slug] ?? category.name,
    blurb: BLURBS[category.slug] ?? null,
    image: category.exampleImage,
  }));

  return <CategoryShowcaseCarousel items={items} />;
}
