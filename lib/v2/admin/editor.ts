// Server-only module: imported only by Server Components (carries the
// service-role client). Never import from a "use client" file.
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";
import type {
  ProductFamily,
  ProductMaterial,
  SkuFull,
  SkuImage,
  SkuMachine,
  SkuSpec,
  VariantEditorData,
} from "./types";

const SKU_COLUMNS =
  "id, product_id, merchant_id, identnummer, bukara_article_number, merchant_sku, " +
  "variant_label, price_eur, campaign_price, has_staffelpreis, stock_quantity, is_active, sort_order, " +
  "diameter_mm, nl_mm, nl_1, gl_mm, shank_mm, shank_length_mm, teeth, tooth_form, spin_direction, " +
  "coating_or_type, h_mm, bore_mm, corner_radius_mm, kerf_mm, plate_mm";

const FAMILY_COLUMNS =
  "id, slug, base_name, display_name, description, series, is_active, has_public_page, " +
  "default_image_url, badge, product_type, tagline, gallery_bg, gallery_label, sort_order";

/**
 * Loads everything the read-only editor needs for one focused SKU: the SKU
 * itself, its family (if assigned), the family's sibling SKUs, family-level
 * taxonomy/materials, and the SKU's images, specs, and compatible machines.
 * Returns null only when the SKU id doesn't exist. Orphan SKUs (product_id
 * null) resolve with family = null and empty family-scoped collections.
 */
export async function getVariantEditorData(
  skuId: string,
): Promise<VariantEditorData | null> {
  const { data: skuRow } = await supabaseAdminV2
    .from("skus")
    .select(SKU_COLUMNS)
    .eq("id", skuId)
    .maybeSingle();

  if (!skuRow) return null;
  const sku = skuRow as unknown as SkuFull;
  const productId = sku.product_id;

  // SKU-scoped reads run unconditionally; family-scoped reads only when assigned.
  const [imagesRes, specsRes, machinesRes] = await Promise.all([
    supabaseAdminV2
      .from("sku_images")
      .select("id, sku_id, image_url, sort_order")
      .eq("sku_id", skuId)
      .order("sort_order", { ascending: true }),
    supabaseAdminV2
      .from("sku_specs")
      .select("id, sku_id, spec_key, spec_value, spec_section, sort_order")
      .eq("sku_id", skuId)
      .order("spec_section", { ascending: true })
      .order("sort_order", { ascending: true }),
    supabaseAdminV2
      .from("sku_machines")
      .select("machine_id, machines(brand, model)")
      .eq("sku_id", skuId),
  ]);

  const machineRows = (machinesRes.data ?? []) as unknown as {
    machine_id: string;
    machines: { brand: string | null; model: string | null } | null;
  }[];
  const machines: SkuMachine[] = machineRows.map((row) => ({
    machine_id: row.machine_id,
    brand: row.machines?.brand ?? null,
    model: row.machines?.model ?? null,
  }));
  // Sort machines by brand/model for stable display.
  machines.sort((a, b) =>
    `${a.brand ?? ""} ${a.model ?? ""}`.localeCompare(`${b.brand ?? ""} ${b.model ?? ""}`),
  );

  let family: ProductFamily | null = null;
  let familySkus: VariantEditorData["familySkus"] = [];
  let categories: string[] = [];
  let applications: string[] = [];
  let materials: ProductMaterial[] = [];

  if (productId) {
    const [familyRes, siblingRes, catRes, appRes, matRes] = await Promise.all([
      supabaseAdminV2.from("products").select(FAMILY_COLUMNS).eq("id", productId).maybeSingle(),
      supabaseAdminV2
        .from("skus")
        .select(
          "id, bukara_article_number, variant_label, diameter_mm, price_eur, campaign_price, is_active, sort_order",
        )
        .eq("product_id", productId)
        .order("sort_order", { ascending: true })
        .order("bukara_article_number", { ascending: true }),
      supabaseAdminV2
        .from("product_categories")
        .select("categories(name)")
        .eq("product_id", productId),
      supabaseAdminV2.from("product_applications").select("tag").eq("product_id", productId),
      supabaseAdminV2
        .from("product_materials")
        .select("product_id, material_name, score, suitability, sort_order")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true }),
    ]);

    family = (familyRes.data as unknown as ProductFamily | null) ?? null;
    familySkus = (siblingRes.data ?? []) as unknown as VariantEditorData["familySkus"];
    categories = ((catRes.data ?? []) as unknown as { categories: { name: string } | null }[])
      .map((r) => r.categories?.name)
      .filter((n): n is string => Boolean(n));
    applications = ((appRes.data ?? []) as unknown as { tag: string }[]).map((r) => r.tag);
    materials = (matRes.data ?? []) as unknown as ProductMaterial[];
  }

  return {
    sku,
    family,
    familySkus,
    categories,
    applications,
    materials,
    images: (imagesRes.data ?? []) as SkuImage[],
    specs: (specsRes.data ?? []) as SkuSpec[],
    machines,
  };
}
