// Fresh v2 types for the read-only admin CMS (Slice 1).
// Isolated on purpose: these match the LIVE v2 DB schema (description, nl_1,
// shank_length_mm, nullable price_eur, …). The shared lib/v2/types.ts is stale
// vs the DB (the sync was reverted in b94820c) and must not be touched here.

/** One row of the v2.admin_sku_overview view (the SKU-first table). */
export interface SkuOverviewRow {
  sku_id: string;
  product_id: string | null;
  merchant_id: string | null;
  merchant_name: string | null;
  merchant_code: string | null;
  bukara_article_number: string;
  merchant_sku: string | null;
  variant_label: string | null;
  price_eur: number | null;
  campaign_price: number | null;
  has_staffelpreis: boolean;
  stock_quantity: number;
  is_active: boolean;
  family_name: string | null;
  family_slug: string | null;
  thumbnail_url: string | null;
  sort_order: number;
  created_at: string;
}

/** Full SKU as stored in v2.skus (all dimension columns included). */
export interface SkuFull {
  id: string;
  product_id: string | null;
  merchant_id: string | null;
  identnummer: string;
  bukara_article_number: string;
  merchant_sku: string | null;
  variant_label: string | null;
  price_eur: number | null;
  campaign_price: number | null;
  has_staffelpreis: boolean;
  stock_quantity: number;
  is_active: boolean;
  sort_order: number;
  // dimensions
  diameter_mm: number | null;
  nl_mm: number | null;
  nl_1: number | null;
  gl_mm: number | null;
  shank_mm: number | null;
  shank_length_mm: number | null;
  teeth: number | null;
  tooth_form: string | null;
  spin_direction: "rechts" | "links" | null;
  coating_or_type: string | null;
  h_mm: number | null;
  bore_mm: number | null;
  corner_radius_mm: number | null;
  kerf_mm: number | null;
  plate_mm: number | null;
}

/** Family product as stored in v2.products. */
export interface ProductFamily {
  id: string;
  slug: string;
  base_name: string;
  display_name: string | null;
  description: string | null;
  series: string | null;
  is_active: boolean;
  has_public_page: boolean;
  default_image_url: string | null;
  badge: string | null;
  product_type: string | null;
  tagline: string | null;
  gallery_bg: string | null;
  gallery_label: string | null;
  sort_order: number;
}

export interface SkuImage {
  id: string;
  sku_id: string;
  image_url: string;
  sort_order: number;
}

export type SpecSection = "technische_details" | "anwendung" | "maschinen";

export interface SkuSpec {
  id: string;
  sku_id: string;
  spec_key: string;
  spec_value: string;
  spec_section: SpecSection;
  sort_order: number;
}

export interface ProductMaterial {
  product_id: string;
  material_name: string;
  score: number; // 0–3
  suitability: string | null;
  sort_order: number;
}

/** A machine the focused SKU is compatible with (joined from v2.machines). */
export interface SkuMachine {
  machine_id: string;
  brand: string | null;
  model: string | null;
}

/** Everything the read-only editor needs for one focused SKU. */
export interface VariantEditorData {
  sku: SkuFull;
  family: ProductFamily | null;
  familySkus: Pick<
    SkuFull,
    | "id"
    | "bukara_article_number"
    | "variant_label"
    | "diameter_mm"
    | "price_eur"
    | "campaign_price"
    | "is_active"
    | "sort_order"
  >[];
  categories: string[]; // category names
  applications: string[]; // tags
  materials: ProductMaterial[];
  images: SkuImage[];
  specs: SkuSpec[];
  machines: SkuMachine[];
}

/** Filters/sort/pagination accepted by the overview query. */
export type SkuSortKey =
  | "family_name"
  | "bukara_article_number"
  | "price_eur"
  | "stock_quantity"
  | "is_active";

export interface OverviewParams {
  page: number; // 1-based
  sort: SkuSortKey;
  dir: "asc" | "desc";
  search?: string;
  merchantId?: string;
  categoryId?: string;
  status?: "active" | "inactive";
  missingPrice?: boolean;
  missingImage?: boolean;
  unassigned?: boolean;
}

export interface OverviewResult {
  rows: SkuOverviewRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export const PAGE_SIZE = 50;

/** Material score → German label (matches storefront vocabulary). */
export function materialScoreLabel(score: number): string {
  switch (score) {
    case 3:
      return "sehr gut";
    case 2:
      return "gut";
    case 1:
      return "geeignet";
    default:
      return "nicht geeignet";
  }
}
