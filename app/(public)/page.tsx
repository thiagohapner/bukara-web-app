// import Hero from "@/components/Hero";
import BannerSonderwerkzeuge from "@/components/BannerSonderwerkzeuge";
import HomeAboutSections from "@/components/HomeAboutSections";
import FeatureBar from "@/components/FeatureBar";
import Footer from "@/components/Footer";
// import SortimentTiles from "@/components/SortimentTiles";
import SelectedProducts from "@/components/SelectedProducts";
import CategoryShowcase from "@/components/CategoryShowcase";

export default function Home() {
  return (
    <>
      <main>
        {/* <Hero /> */}
        <BannerSonderwerkzeuge />
        {/* <SortimentTiles /> */}
        <SelectedProducts />
        <BannerSonderwerkzeuge only="sonderloesungen" />
        <CategoryShowcase />
        <BannerSonderwerkzeuge only="schaerfservice" />
        <HomeAboutSections />
        <FeatureBar />
      </main>
      <Footer />
    </>
  );
}
