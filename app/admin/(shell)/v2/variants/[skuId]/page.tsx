import { notFound } from "next/navigation";
import VariantEditor from "@/components/admin/v2/VariantEditor";
import { getVariantEditorData } from "@/lib/v2/admin/editor";

export const dynamic = "force-dynamic";

export default async function V2VariantEditorPage({
  params,
}: {
  params: Promise<{ skuId: string }>;
}) {
  const { skuId } = await params;
  const data = await getVariantEditorData(skuId);

  if (!data) notFound();

  return <VariantEditor data={data} />;
}
