import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";
import V2ProductEditClient from "./V2ProductEditClient";

export const dynamic = "force-dynamic";

export default async function V2ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data } = await supabaseAdmin
    .schema("v2")
    .from("products")
    .select("id")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return <V2ProductEditClient productId={id} />;
}
