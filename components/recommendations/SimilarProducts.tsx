import { getRecommendations } from "@/lib/recommendations/service";
import RecommendationsCarousel from "@/components/recommendations/RecommendationsCarousel";

/** Server-rendered "Weitere Produkte" carousel for /katalog/[slug] (force-dynamic). The viewed SKU's diameter re-ranks recommendations toward the visitor's size; the service guarantees at least 5 items. */
export default async function SimilarProducts({ productId, viewedDiameter }: { productId: string; viewedDiameter?: number | null }) {
  const { cards } = await getRecommendations({
    surface: "pdp_similar",
    anchorProductIds: [productId],
    viewedDiameter,
  });
  return <RecommendationsCarousel title="Weitere Produkte" cards={cards} />;
}
