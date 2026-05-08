import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryRail from "@/components/CategoryRail";
import BestSellers from "@/components/BestSellers";
import PromoTiles from "@/components/PromoTiles";
import LatestProducts from "@/components/LatestProducts";
import BrandStrip from "@/components/BrandStrip";
import ProductSpotlight from "@/components/ProductSpotlight";
import Testimonials from "@/components/Testimonials";
import FeatureBar from "@/components/FeatureBar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <AnnouncementBar />
      <main>
        <Hero />
        <CategoryRail />
        <BestSellers />
        <PromoTiles />
        <LatestProducts />
        <BrandStrip />
<ProductSpotlight />
        <Testimonials />
        <FeatureBar />
      </main>
      <Footer />
    </>
  );
}
