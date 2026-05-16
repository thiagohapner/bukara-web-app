import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import DealPageContent from "./DealPageContent";

export default async function AngebotDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data } = await supabase
    .from("offers")
    .select("slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!data) notFound();

  return (
    <>
      <main className="min-h-screen bg-white">
        <DealPageContent dealSlug={slug} />
      </main>
      <Footer />
    </>
  );
}
