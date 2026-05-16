import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";
import ProductEditClient from "./ProductEditClient";

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return <ProductEditClient productId={id} />;
}
