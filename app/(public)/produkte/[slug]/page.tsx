import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import ProduktPageContent from "./ProduktPageContent";

export default async function ProduktDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("slug", slug)
    .eq("has_public_page", true)
    .single();

  if (!data) notFound();

  return (
    <>
      <main className="min-h-screen bg-white">
        <ProduktPageContent slug={slug} />
      </main>
      <Footer />
    </>
  );
}
