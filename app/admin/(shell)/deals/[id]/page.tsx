import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";
import DealEditClient from "./DealEditClient";

export default async function DealEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data } = await supabaseAdmin
    .from("offers")
    .select("id")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return <DealEditClient dealId={id} />;
}
