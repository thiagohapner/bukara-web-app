import Hero from "@/components/Hero";
import BannerSonderwerkzeuge from "@/components/BannerSonderwerkzeuge";
import DealsPromo from "@/components/DealsPromo";
import BestSellers from "@/components/BestSellers";
import HomeAboutSections from "@/components/HomeAboutSections";
import FeatureBar from "@/components/FeatureBar";
import Footer from "@/components/Footer";
import SortimentTiles from "@/components/SortimentTiles";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <BannerSonderwerkzeuge />
        {/* <CategoryRail /> */}
        <section className="py-6 max-w-[1320px] mx-auto px-4 sm:px-6">
          <DealsPromo variant="full" lightBg />
        </section>
        <SortimentTiles />
        <HomeAboutSections />
        <BestSellers />
        <FeatureBar />
      </main>
      <Footer />
    </>
  );
}
