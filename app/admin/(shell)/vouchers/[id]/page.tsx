import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";
import VoucherEditClient, { type VoucherRecord } from "./VoucherEditClient";
import { loadVoucherOptions } from "../options";

export const dynamic = "force-dynamic";

export default async function EditVoucherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data } = await supabaseAdmin.from("vouchers").select("*").eq("id", id).single();
  if (!data) notFound();

  const { count } = await supabaseAdmin
    .from("voucher_redemptions")
    .select("id", { count: "exact", head: true })
    .eq("voucher_id", id);

  const { products, seriesList, categories } = await loadVoucherOptions();

  return (
    <VoucherEditClient
      voucherId={id}
      initial={data as VoucherRecord}
      redemptionCount={count ?? 0}
      products={products}
      seriesList={seriesList}
      categories={categories}
    />
  );
}
