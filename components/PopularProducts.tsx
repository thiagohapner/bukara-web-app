import { unstable_cache } from "next/cache";
import { getRecommendations } from "@/lib/recommendations/service";
import RecommendationsCarousel from "@/components/recommendations/RecommendationsCarousel";

// Rides the same "catalog" tag + daily cadence as the rest of the catalog data
// (see lib/katalog/data.ts) so this costs no extra ISR writes. Renders nothing
// until product_events accumulate enough traffic to populate popular_products
// (see the nightly refresh_popular_products() job) — no hardcoded fallback list,
// by design: an empty section beats a stale-looking one.
const fetchPopular = unstable_cache(
  async () => getRecommendations({ surface: "home_popular", limit: 8 }),
  ["home-popular-products-v1"],
  { tags: ["catalog"], revalidate: 86400 },
);

export default async function PopularProducts() {
  const { cards } = await fetchPopular();
  return <RecommendationsCarousel title="Beliebt bei anderen Kunden" cards={cards} />;
}
