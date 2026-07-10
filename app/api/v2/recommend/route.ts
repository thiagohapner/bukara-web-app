import { NextRequest, NextResponse } from "next/server";
import { findProductsByAttributes } from "@/lib/recommendations/attributeFinder";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const material = searchParams.get("material");
  const minScore = searchParams.get("minScore") ? Number(searchParams.get("minScore")) : null;
  const application = searchParams.get("application");
  const machineId = searchParams.get("machineId");
  const categoryId = searchParams.get("categoryId");
  const minDiameter = searchParams.get("minDiameter") ? Number(searchParams.get("minDiameter")) : null;
  const maxDiameter = searchParams.get("maxDiameter") ? Number(searchParams.get("maxDiameter")) : null;
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;

  const hasFilter = material || application || machineId || categoryId || minDiameter != null || maxDiameter != null || minPrice != null || maxPrice != null;
  if (!hasFilter) {
    return NextResponse.json(
      { error: "At least one filter parameter is required (material, application, machineId, categoryId, minDiameter, maxDiameter, minPrice, maxPrice)" },
      { status: 400 }
    );
  }

  const products = await findProductsByAttributes({
    material, minScore, application, machineId, categoryId,
    minDiameter, maxDiameter, minPrice, maxPrice, limit,
  });

  return NextResponse.json({ products });
}
