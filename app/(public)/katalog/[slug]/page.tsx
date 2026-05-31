import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";
import KatalogProductContent from "./KatalogProductContent";

export const dynamic = "force-dynamic";

export default async function KatalogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data } = await supabaseAdminV2
    .from("products")
    .select("slug")
    .eq("slug", slug)
    .eq("has_public_page", true)
    .single();

  if (!data) notFound();

  return (
    <>
      <main className="min-h-screen bg-white">
        <KatalogProductContent slug={slug} />
      </main>
      <Footer />
    </>
  );
}
