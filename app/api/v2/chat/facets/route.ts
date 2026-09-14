import { NextResponse } from "next/server";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";

export const dynamic = "force-dynamic";

/**
 * Facet options for the Werkzeug-Lotse guided chat (components/ChatWidget.tsx):
 * materials/applications that actually occur on active products, so the chat
 * never offers a chip that dead-ends in zero results.
 */
export async function GET() {
  const [materialsRes, applicationsRes, typesRes] = await Promise.all([
    supabaseAdminV2.from("product_materials").select("material_name").gt("score", 0),
    supabaseAdminV2.from("product_applications").select("tag"),
    supabaseAdminV2.from("material_types").select("name, sort_order"),
  ]);

  if (materialsRes.error || applicationsRes.error || typesRes.error) {
    return NextResponse.json({ error: "Facetten konnten nicht geladen werden" }, { status: 500 });
  }

  const sortOrderByName = new Map(
    (typesRes.data ?? []).map((t) => [t.name, t.sort_order as number]),
  );
  const materials = [...new Set((materialsRes.data ?? []).map((r) => r.material_name as string))].sort(
    (a, b) => (sortOrderByName.get(a) ?? 999) - (sortOrderByName.get(b) ?? 999) || a.localeCompare(b, "de"),
  );
  const applications = [...new Set((applicationsRes.data ?? []).map((r) => r.tag as string))].sort((a, b) =>
    a.localeCompare(b, "de"),
  );

  return NextResponse.json({ materials, applications });
}
