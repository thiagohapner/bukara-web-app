// import Hero from "@/components/Hero";
import BannerSonderwerkzeuge from "@/components/BannerSonderwerkzeuge";
import HomeAboutSections from "@/components/HomeAboutSections";
import FeatureBar from "@/components/FeatureBar";
import Footer from "@/components/Footer";
// import SortimentTiles from "@/components/SortimentTiles";
import SelectedProducts from "@/components/SelectedProducts";

export default function Home() {
  return (
    <>
      <main>
        {/* <Hero /> */}
        <BannerSonderwerkzeuge />
        {/* <SortimentTiles /> */}
        <SelectedProducts />
        <HomeAboutSections />
        <FeatureBar />
      </main>
      <Footer />
    </>
  );
}
