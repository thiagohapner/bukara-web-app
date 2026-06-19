import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import ScrollToTop from "@/components/ScrollToTop";
import { CartProvider } from "@/components/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { getSortimentCategories } from "@/lib/sortiment/data";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // DB-driven sub-catalog categories (same show_on_home set as the home tiles),
  // surfaced in the desktop "Produkte" nav dropdown.
  const categories = await getSortimentCategories();
  const productCategories = categories.map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <CartProvider>
      <ScrollToTop />
      <Navbar productCategories={productCategories} />
      <AnnouncementBar />
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
