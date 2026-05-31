import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";

async function getSession(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function PATCH(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { items, entityType } = await request.json() as {
    items: { id: string; sort_order: number }[];
    entityType: "product" | "offer" | "v2-sku";
  };

  if (!items?.length || !entityType) {
    return NextResponse.json({ error: "Missing items or entityType" }, { status: 400 });
  }

  if (entityType === "v2-sku") {
    await Promise.all(
      items.map(({ id, sort_order }) =>
        supabaseAdmin.schema("v2").from("sku_images").update({ sort_order }).eq("id", id)
      )
    );
    return NextResponse.json({ success: true });
  }

  const table = entityType === "product" ? "product_images" : "offer_images";

  await Promise.all(
    items.map(({ id, sort_order }) =>
      supabaseAdmin.from(table).update({ sort_order }).eq("id", id)
    )
  );

  return NextResponse.json({ success: true });
}
