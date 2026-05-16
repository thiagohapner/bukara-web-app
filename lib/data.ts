export interface BukaraService {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  badge?: string;
  type: "schaerfen" | "sonderwerkzeug";
  highlights: string[];
  priceLabel: string;
  images?: string[];
}

export const SERVICES: BukaraService[] = [
  {
    slug: "schaerfservice",
    name: "Schärfservice",
    tagline: "Professionelles Schärfen. Deutschlandweit.",
    description:
      "Nutzen Sie unseren schnellen und unkomplizierten Werkzeugservice (Nachschärfen, Reparatur, Instandsetzung) – für nahezu alle Werkzeugarten. Unser Abholservice ist für Sie selbstverständlich kostenlos — für sehr kleine Aufträge unter 150 € fällt lediglich eine einmalige Pauschale von 15 € an.",
    badge: "Service",
    type: "schaerfen",
    highlights: [
      "Bukara-Werkzeuge & Fremdwerkzeuge",
      "Deutschlandweite Abholung & Rückgabe",
      "Fertig in 1–2 Wochen",
      "Faire Preise, keine Mindestmenge",
    ],
    priceLabel: "Auf Anfrage",
    images: [
      "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/services/schaerfservice/main_image_small.png",
      "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/services/schaerfservice/A3679582.png",
    ],
  },
  {
    slug: "sonderwerkzeug",
    name: "Sonderwerkzeuge",
    tagline: "Maßgefertigt nach Ihren Spezifikationen.",
    description:
      "Wir fertigen Werkzeuge individuell nach Ihren Zeichnungen und Anforderungen. Ob Einzel- oder Serienproduktion — wir beraten Sie von der Spezifikation bis zur Lieferung.",
    badge: "Service",
    type: "sonderwerkzeug",
    highlights: [
      "Individuelle Fertigung nach Zeichnung oder Spezifikation",
      "Alle gängigen Werkstoffe",
      "Klein- und Großserien",
      "Technische Beratung inklusive",
    ],
    priceLabel: "Auf Anfrage",
    images: [
      "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/services/sonderwerkzeug/Frame%2065%20(4).png",
    ],
  },
];

export interface BukaraSku {
  id: string;
  product_id: string;
  artikel_nr: string;
  variant_label: string | null;
  price: number;
  campaign_price: number | null;
  stock_quantity: number;
  is_active: boolean;
  sort_order: number;
}

export interface ProductSpec {
  id: string;
  product_id: string;
  spec_key: string;
  spec_value: string;
  spec_section: string;
  sort_order: number;
}

export interface ProductMaterial {
  id: string;
  product_id: string;
  material_name: string;
  suitability: "sehr gut geeignet" | "gut geeignet" | "geeignet" | "nicht geeignet";
  image_url: string | null;
  sort_order: number;
}

export interface ProductCuttingData {
  id: string;
  product_id: string;
  diameter: string;
  feed_rate: string;
  rpm_range: string;
  sort_order: number;
}

export interface ProductAccessory {
  id: string;
  product_id: string;
  accessory_product_id: string;
  sort_order: number;
}
