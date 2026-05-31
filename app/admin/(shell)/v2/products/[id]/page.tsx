import { notFound } from "next/navigation";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";
import V2ProductEditClient from "./V2ProductEditClient";

export const dynamic = "force-dynamic";

export default async function V2ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data } = await supabaseAdminV2
    .from("products")
    .select("id")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return <V2ProductEditClient productId={id} />;
}
