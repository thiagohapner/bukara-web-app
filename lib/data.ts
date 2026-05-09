export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
}

export interface Article {
  id: number;
  title: string;
  date: string;
  image: string;
  category: string;
}

export interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface PromoTile {
  id: number;
  badge: string;
  title: string;
  cta: string;
  bg: string;
  dark: boolean;
  image: string;
}

export const NAV_LINKS = ["Produkte", "Lösungen", "Über uns", "B2B Portal", "Kontakt"];

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

export interface BukaraProduct {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  badge?: string;
  sku?: string;
  originalPrice?: number;
  campaignPrice?: number;
  hasVariants?: boolean;
  images?: string[];
}

export interface X99Variant {
  id: string;
  sku: string;
  variant_name: string;
  original_price: number;
  campaign_price: number;
  sort_order: number;
}

export interface Deal {
  slug: string;
  title: string;
  subtitle: string;
  fromPrice: number;
  discountPercent: number;
  includedProducts: string[];
  badge: string;
  fixedItems: Array<{ name: string; originalPrice: number; campaignPrice: number }>;
  cardImage?: string;
  images?: string[];
}

export const BUKARA_PRODUCTS: BukaraProduct[] = [
  {
    slug: "x99-fraeser",
    name: "X99 Fräser",
    tagline: "One tool. All materials.",
    description:
      "Whether softwood, hardwood, MDF or coated chipboard — the X99 delivers clean results across all common wood-based materials. The premium Platinum coating, combined with the special nesting carbide grade, supports long tool life even when working with abrasive materials.",
    badge: "-30%",
    hasVariants: true,
    images: [
      "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/products/X99/x-99-1.png",
      "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/products/X99/x-99-2.png",
      "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/products/X99/x-99-3.png",
      "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/products/X99/x-99-4.png",
    ],
  },
  {
    slug: "thermo-schrumpffutter",
    name: "Thermo-Schrumpffutter",
    tagline: "Präzision für Hochgeschwindigkeitsanwendungen.",
    description:
      "The slim design, high concentric accuracy and low-vibration clamping make the holder especially quiet and suitable for high-speed applications.",
    sku: "515-00009-02-0",
    originalPrice: 125.00,
  },
  {
    slug: "turbonesting-turbinen-komplett-set",
    name: "TurboNesting-Turbinen Komplett Set",
    tagline: "Aktive Spanabfuhr für maximale Performance.",
    description:
      "The turbine set supports cutter performance by actively removing chips from the cutting path. Interchangeable collets allow different tool diameters to be used flexibly.",
    sku: "512-00034-01-3",
    originalPrice: 430.00,
  },
];

export const X99_VARIANTS: X99Variant[] = [
  { id: "1", sku: "667-00001-01-0", variant_name: "D6 NL3/22 GL70 S6 Z2+6 rechtsl./pos-neg",    original_price: 79.60,  campaign_price: 55.72,  sort_order: 1 },
  { id: "2", sku: "667-00002-01-0", variant_name: "D8 NL4,2/22 GL70 S8 Z2+6 rechtsl./pos-neg",  original_price: 81.90,  campaign_price: 57.33,  sort_order: 2 },
  { id: "3", sku: "667-00003-01-0", variant_name: "D10 NL4,5/25 GL80 S10 Z2+6 rechtsl./pos-neg", original_price: 89.60,  campaign_price: 62.72,  sort_order: 3 },
  { id: "4", sku: "667-00004-01-0", variant_name: "D10 NL4,5/35 GL80 S10 Z2+6 rechtsl./pos-neg", original_price: 95.10,  campaign_price: 66.57,  sort_order: 4 },
  { id: "5", sku: "667-00005-01-0", variant_name: "D12 NL5,5/25 GL80 S12 Z2+6 rechtsl./pos-neg", original_price: 110.10, campaign_price: 77.07,  sort_order: 5 },
  { id: "6", sku: "667-00006-01-0", variant_name: "D12 NL5,5/35 GL80 S12 Z2+6 rechtsl./pos-neg", original_price: 117.40, campaign_price: 82.18,  sort_order: 6 },
  { id: "7", sku: "667-00007-01-0", variant_name: "D16 NL7,5/35 GL90 S16 Z2+6 rechtsl./pos-neg", original_price: 175.70, campaign_price: 122.99, sort_order: 7 },
  { id: "8", sku: "667-00008-01-0", variant_name: "D16 NL7,5/50 GL100 S16 Z2+6 rechtsl./pos-neg", original_price: 220.00, campaign_price: 154.00, sort_order: 8 },
];

export const DEALS: Deal[] = [
  {
    slug: "x99-only",
    title: "X99 Fräser",
    subtitle: "Das Universalwerkzeug für alle gängigen Holzwerkstoffe.",
    fromPrice: 55.72,
    discountPercent: 30,
    includedProducts: ["X99 Fräser (Verfügbar in 8 Ausführungen)"],
    badge: "-30%",
    fixedItems: [],
    cardImage: "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/products/angebote/nur-x99/x-99-deal.png",
    images: [
      "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/products/X99/x-99-1.png",
      "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/products/X99/x-99-2.png",
      "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/products/X99/x-99-3.png",
      "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/products/X99/x-99-4.png",
    ],
  },
  {
    slug: "x99-thermo-bundle",
    title: "X99 + Thermo-Schrumpffutter",
    subtitle: "Präzise Spanntechnik trifft Hochleistungsfräser.",
    fromPrice: 143.22,
    discountPercent: 30,
    includedProducts: [
      "X99 Fräser (Verfügbar in 8 Ausführungen)",
      "Thermo-Schrumpffutter HSK 63F d16 A75",
    ],
    badge: "-30%",
    fixedItems: [{ name: "Thermo-Schrumpffutter", originalPrice: 125.00, campaignPrice: 87.50 }],
    cardImage: "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/products/angebote/set2/set2-2.png",
    images: [
      "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/products/angebote/set2/set2-1.png",
    ],
  },
  {
    slug: "x99-turbonesting-set",
    title: "X99 + TurboNesting Set",
    subtitle: "Aktive Spanabfuhr für reibungslosen Dauerbetrieb.",
    fromPrice: 356.72,
    discountPercent: 30,
    includedProducts: [
      "X99 Fräser (Verfügbar in 8 Ausführungen)",
      "TurboNesting-Turbinen Komplett Set",
    ],
    badge: "-30%",
    fixedItems: [{ name: "TurboNesting-Turbinen Komplett Set", originalPrice: 430.00, campaignPrice: 301.00 }],
    cardImage: "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/products/angebote/set3/set3-2.png",
    images: [
      "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/products/angebote/set3/set3-1.png",
    ],
  },
];

export const CATEGORIES: Category[] = [
  { id: 1, name: "Smartphones", slug: "smartphones" },
  { id: 2, name: "Smartwatch", slug: "smartwatch" },
  { id: 3, name: "Games & video", slug: "games" },
  { id: 4, name: "Home Automation", slug: "home" },
  { id: 5, name: "Headphones", slug: "headphones" },
  { id: 6, name: "Laptops", slug: "laptops" },
  { id: 7, name: "Tech Gadget", slug: "gadget" },
];

export const BEST_SELLERS: Product[] = [
  {
    id: 1,
    name: "NexGen Galaxy X",
    category: "Smartphones",
    price: 299,
    originalPrice: 399,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
    badge: "SALE",
  },
  {
    id: 2,
    name: "VisionPro Compact Camera",
    category: "Cameras",
    price: 460,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
  },
  {
    id: 3,
    name: "ZenithStream Ultrabook",
    category: "Laptops",
    price: 460,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
  },
  {
    id: 4,
    name: "SonicDream Mini Speaker",
    category: "Audio",
    price: 40,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80",
  },
];

export const LATEST_PRODUCTS: Product[] = [
  {
    id: 5,
    name: "PulseWave Wireless Speaker",
    category: "Audio",
    price: 140,
    originalPrice: 175,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80",
  },
  {
    id: 6,
    name: "Portable Bluetooth Speaker",
    category: "Audio",
    price: 80,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80",
  },
  {
    id: 7,
    name: "TurboType Keyboard",
    category: "Accessories",
    price: 140,
    originalPrice: 175,
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&q=80",
  },
  {
    id: 8,
    name: "Noise-Canceling Headphones",
    category: "Audio",
    price: 340,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
  },
  {
    id: 9,
    name: "Lightweight Ergo Mouse",
    category: "Accessories",
    price: 15,
    originalPrice: 30,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80",
  },
  {
    id: 10,
    name: "Nexus Smart Doorbell",
    category: "Home Automation",
    price: 89,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
  },
  {
    id: 11,
    name: "FocusTech Action Camera",
    category: "Cameras",
    price: 70,
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80",
  },
  {
    id: 12,
    name: "HyperDrive USB Hub",
    category: "Accessories",
    price: 68,
    image: "https://images.unsplash.com/photo-1593640408182-31c228d10aa3?w=400&q=80",
  },
];

export const BRANDS = [
  "Hourglass",
  "Capsule",
  "Lightbox",
  "Spherule",
  "CommandR",
  "Luminous",
  "Hourglass",
  "Capsule",
];

export const ARTICLES: Article[] = [
  {
    id: 1,
    title: "Tips for improving your gaming experience at home",
    date: "Apr 1, 2025",
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&q=80",
    category: "Gaming",
  },
  {
    id: 2,
    title: "Tech gift guide finding the perfect gift for every occasion",
    date: "Apr 1, 2025",
    image: "https://images.unsplash.com/photo-1549637642-90187f64f420?w=600&q=80",
    category: "Gift Guide",
  },
  {
    id: 3,
    title: "Tips for setting up a home office for remote work success",
    date: "Apr 1, 2025",
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80",
    category: "Work",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Lena Alexander",
    location: "Florida, US",
    rating: 5,
    text: "The CyberSleek Gaming Keyboard is a must-have for serious gamers! The keys are responsive and the customizable lighting adds a cool aesthetic to my gaming setup. Love it!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
  },
  {
    id: 2,
    name: "Cameron Williamson",
    location: "New York, US",
    rating: 5,
    text: "The EchoSync Smart Home system has made my life so much easier! I can control my lights, thermostat, and security cameras from my phone, which adds a new level of convenience.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
  },
];

export const PROMO_TILES: PromoTile[] = [
  {
    id: 1,
    badge: "5% discount",
    title: "Smartphones & Accessories",
    cta: "Shop Now",
    bg: "#1E293B",
    dark: true,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80",
  },
  {
    id: 2,
    badge: "New Arrival",
    title: "Portable Bluetooth Speaker",
    cta: "Shop Now",
    bg: "#FFF3E0",
    dark: false,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&q=80",
  },
  {
    id: 3,
    badge: "2nd generation",
    title: "StellarView Notebook",
    cta: "Shop Now",
    bg: "#F1F5F9",
    dark: false,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&q=80",
  },
];
