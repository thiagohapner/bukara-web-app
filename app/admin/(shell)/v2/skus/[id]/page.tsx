import { notFound } from "next/navigation";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";
import V2SkuEditClient from "./V2SkuEditClient";

export const dynamic = "force-dynamic";

export default async function V2SkuEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data } = await supabaseAdminV2
    .from("skus")
    .select("id")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return <V2SkuEditClient skuId={id} />;
}
