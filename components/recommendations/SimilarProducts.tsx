import { getRecommendations } from "@/lib/recommendations/service";
import RecommendationsCarousel from "@/components/recommendations/RecommendationsCarousel";

/** Server-rendered "Ähnliche Produkte" carousel for /katalog/[slug] (force-dynamic). The viewed SKU's diameter re-ranks recommendations toward the visitor's size. */
export default async function SimilarProducts({ productId, viewedDiameter }: { productId: string; viewedDiameter?: number | null }) {
  const { cards } = await getRecommendations({
    surface: "pdp_similar",
    anchorProductIds: [productId],
    viewedDiameter,
  });
  return <RecommendationsCarousel title="Ähnliche Produkte" cards={cards} />;
}
