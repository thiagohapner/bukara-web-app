import { NextRequest, NextResponse } from "next/server";
import { getRecommendations, type RecSurface } from "@/lib/recommendations/service";

const VALID_SURFACES: RecSurface[] = ["pdp_similar", "pdp_cross_sell", "cart", "home_popular", "form_success"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const surface = searchParams.get("surface") as RecSurface | null;

  if (!surface || !VALID_SURFACES.includes(surface)) {
    return NextResponse.json(
      { error: `surface must be one of: ${VALID_SURFACES.join(", ")}` },
      { status: 400 }
    );
  }

  const anchor = searchParams.get("anchor");
  const exclude = searchParams.get("exclude");
  const limitParam = searchParams.get("limit");

  const result = await getRecommendations({
    surface,
    anchorProductIds: anchor ? anchor.split(",").filter(Boolean) : undefined,
    excludeProductIds: exclude ? exclude.split(",").filter(Boolean) : undefined,
    seedFilters: {
      material: searchParams.get("material")?.split(",").filter(Boolean) ?? undefined,
      application: searchParams.get("application")?.split(",").filter(Boolean) ?? undefined,
      machineId: searchParams.get("machineId") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
    },
    limit: limitParam ? Number(limitParam) : undefined,
  });

  return NextResponse.json(
    { surface, ...result, generatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
  );
}
