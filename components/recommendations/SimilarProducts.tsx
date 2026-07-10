import { getRecommendations } from "@/lib/recommendations/service";
import RecommendationsCarousel from "@/components/recommendations/RecommendationsCarousel";

/** Server-rendered "Ähnliche Produkte" carousel for surfaces that already have the product id server-side (currently only /katalog/[slug], which is force-dynamic). */
export default async function SimilarProducts({ productId }: { productId: string }) {
  const { cards } = await getRecommendations({ surface: "pdp_similar", anchorProductIds: [productId] });
  return <RecommendationsCarousel title="Ähnliche Produkte" cards={cards} />;
}
