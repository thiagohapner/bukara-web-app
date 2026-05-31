import { notFound } from "next/navigation";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";
import V2SkuEditClient from "./V2SkuEditClient";
import type { V2Sku, V2SkuSpec, V2SkuImage } from "@/lib/v2/types";

export const dynamic = "force-dynamic";

export default async function V2SkuEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [skuRes, specRes, imgRes, prodRes] = await Promise.all([
    supabaseAdminV2.from("skus").select("*").eq("id", id).single(),
    supabaseAdminV2.from("sku_specs").select("*").eq("sku_id", id).order("sort_order"),
    supabaseAdminV2.from("sku_images").select("*").eq("sku_id", id).order("sort_order"),
    supabaseAdminV2
      .from("products")
      .select("id, display_name, base_name")
      .order("base_name"),
  ]);

  if (!skuRes.data) notFound();

  return (
    <V2SkuEditClient
      skuId={id}
      initialData={{
        sku: skuRes.data as V2Sku,
        specs: (specRes.data ?? []) as V2SkuSpec[],
        images: (imgRes.data ?? []) as V2SkuImage[],
        allProducts: (prodRes.data ?? []) as Array<{
          id: string;
          display_name: string | null;
          base_name: string | null;
        }>,
      }}
    />
  );
}
