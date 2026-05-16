import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import ScrollToTop from "@/components/ScrollToTop";
import { CartProvider } from "@/components/CartContext";
import CartDrawer from "@/components/CartDrawer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <ScrollToTop />
      <Navbar />
      <AnnouncementBar />
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
