import Hero from "@/components/Hero";
import CategoryRail from "@/components/CategoryRail";
import BestSellers from "@/components/BestSellers";
import PromoTiles from "@/components/PromoTiles";
import LatestProducts from "@/components/LatestProducts";
import BrandStrip from "@/components/BrandStrip";
import FeatureBar from "@/components/FeatureBar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <CategoryRail />
        <BestSellers />
        <PromoTiles />
        <LatestProducts />
        <BrandStrip />
        <FeatureBar />
      </main>
      <Footer />
    </>
  );
}
