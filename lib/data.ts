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
