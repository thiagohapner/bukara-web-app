import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";
import KatalogProductContent from "./KatalogProductContent";
import type { V2Product, V2Sku, V2SkuImage, V2SkuSpec, V2ProductMaterial, V2ProductApplication } from "@/lib/v2/types";
import type { AccessoryItem } from "@/components/ProductAccessories";

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

  const [{ data: images }, { data: specs }, { data: mats }, { data: apps }, { data: accRows }] =
    await Promise.all([
      skuIds.length > 0
        ? supabaseAdminV2.from("sku_images").select("*").in("sku_id", skuIds).order("sort_order")
        : Promise.resolve({ data: [] }),
      skuIds.length > 0
        ? supabaseAdminV2.from("sku_specs").select("*").in("sku_id", skuIds).order("sort_order")
        : Promise.resolve({ data: [] }),
      supabaseAdminV2.from("product_materials").select("*").eq("product_id", product.id).order("sort_order"),
      supabaseAdminV2.from("product_applications").select("tag").eq("product_id", product.id),
      supabaseAdminV2
        .from("product_accessories")
        .select("id, accessory_product_id, sort_order")
        .eq("product_id", product.id)
        .order("sort_order"),
    ]);

  const accessoryRows = (accRows ?? []) as Array<{ id: string; accessory_product_id: string; sort_order: number }>;

  let accessories: AccessoryItem[] = [];
  if (accessoryRows.length > 0) {
    const accProductIds = accessoryRows.map((r) => r.accessory_product_id);

    const [{ data: accProducts }, { data: accSkus }, { data: accImages }] = await Promise.all([
      supabaseAdminV2
        .from("products")
        .select("id, slug, display_name, base_name, default_image_url")
        .in("id", accProductIds),
      supabaseAdminV2
        .from("skus")
        .select("id, product_id, variant_label, price_eur, campaign_price")
        .in("product_id", accProductIds)
        .eq("is_active", true)
        .order("sort_order"),
      supabaseAdminV2
        .from("sku_images")
        .select("sku_id, image_url, sort_order")
        .order("sort_order"),
    ]);

    type AccProduct = { id: string; slug: string; display_name: string | null; base_name: string | null; default_image_url: string | null };
    type AccSku = { id: string; product_id: string | null; variant_label: string | null; price_eur: number; campaign_price: number | null };
    type AccImage = { sku_id: string; image_url: string; sort_order: number };

    const accProductMap = Object.fromEntries(
      ((accProducts ?? []) as AccProduct[]).map((p) => [p.id, p])
    );

    const accSkusByProduct: Record<string, AccSku[]> = {};
    for (const s of (accSkus ?? []) as AccSku[]) {
      if (!s.product_id) continue;
      if (!accSkusByProduct[s.product_id]) accSkusByProduct[s.product_id] = [];
      accSkusByProduct[s.product_id].push(s);
    }

    const firstImageBySku: Record<string, string> = {};
    for (const img of (accImages ?? []) as AccImage[]) {
      if (!firstImageBySku[img.sku_id]) firstImageBySku[img.sku_id] = img.image_url;
    }

    accessories = accessoryRows
      .map((row) => {
        const acc = accProductMap[row.accessory_product_id];
        if (!acc) return null;
        const productSkus = accSkusByProduct[row.accessory_product_id] ?? [];
        const firstSkuId = productSkus[0]?.id;
        const image = (firstSkuId && firstImageBySku[firstSkuId]) || acc.default_image_url || null;
        return {
          id: row.id,
          accessory_product_id: row.accessory_product_id,
          sort_order: row.sort_order,
          slug: acc.slug,
          name: acc.display_name ?? acc.base_name ?? "",
          images: image ? [image] : [],
          skus: productSkus.map((s) => ({
            id: s.id,
            variant_label: s.variant_label,
            price_eur: s.price_eur,
            campaign_price: s.campaign_price,
          })),
        };
      })
      .filter((a): a is AccessoryItem => a !== null);
  }

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
          accessories={accessories}
        />
      </main>
      <Footer />
    </>
  );
}
