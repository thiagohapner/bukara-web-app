export interface V2Product {
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

export interface V2Sku {
  id: string;
  product_id: string | null;
  merchant_id: string | null;
  identnummer: string;
  bukara_article_number: string;
  merchant_sku: string | null;
  variant_label: string | null;
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
  price_eur: number | null;
  campaign_price: number | null;
  stock_quantity: number;
  has_staffelpreis: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface V2SkuImage {
  id: string;
  sku_id: string;
  image_url: string;
  sort_order: number;
}

export interface V2SkuSpec {
  id: string;
  sku_id: string;
  spec_key: string;
  spec_value: string;
  spec_section: "technische_details" | "anwendung" | "maschinen";
  sort_order: number;
}

export interface V2SkuMachine {
  sku_id: string;
  machine_id: string;
  language: string;
  source: string;
}

export interface V2ProductApplication {
  product_id: string;
  tag: string;
}

export interface V2ProductCategory {
  product_id: string;
  category_id: string;
}

export interface V2ProductMaterial {
  product_id: string;
  material_name: string;
  score: 0 | 1 | 2 | 3;
  suitability: string;
  sort_order: number;
}

export interface V2Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order?: number;
}

export interface V2MaterialType {
  name: string;
  sort_order: number;
}

export interface V2Machine {
  id: string;
  name: string;
  machine_type_id: string | null;
}

export interface V2Merchant {
  id: string;
  name: string;
  slug: string;
}
