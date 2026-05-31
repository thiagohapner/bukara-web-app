import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";
import KatalogProductContent from "./KatalogProductContent";
import type { V2Product, V2Sku, V2SkuImage, V2SkuSpec, V2ProductMaterial, V2ProductApplication } from "@/lib/v2/types";

export const dynamic = "force-dynamic";

export default async function KatalogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: product } = await supabaseAdminV2
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("has_public_page", true)
    .single();

  if (!product) notFound();

  const { data: skuData } = await supabaseAdminV2
    .from("skus")
    .select("*")
    .eq("product_id", product.id)
    .eq("is_active", true)
    .order("sort_order");

  const skuList = (skuData ?? []) as V2Sku[];
  const skuIds = skuList.map((s) => s.id);

  const [{ data: images }, { data: specs }, { data: mats }, { data: apps }] =
    skuIds.length > 0
      ? await Promise.all([
          supabaseAdminV2.from("sku_images").select("*").in("sku_id", skuIds).order("sort_order"),
          supabaseAdminV2.from("sku_specs").select("*").in("sku_id", skuIds).order("sort_order"),
          supabaseAdminV2.from("product_materials").select("*").eq("product_id", product.id).order("sort_order"),
          supabaseAdminV2.from("product_applications").select("tag").eq("product_id", product.id),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  return (
    <>
      <main className="min-h-screen bg-white">
        <KatalogProductContent
          product={product as V2Product}
          skus={skuList}
          skuImages={(images ?? []) as V2SkuImage[]}
          skuSpecs={(specs ?? []) as V2SkuSpec[]}
          materials={(mats ?? []) as V2ProductMaterial[]}
          applications={(apps ?? []) as V2ProductApplication[]}
        />
      </main>
      <Footer />
    </>
  );
}
