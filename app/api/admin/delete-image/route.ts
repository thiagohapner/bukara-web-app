import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";

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

export async function DELETE(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, entityType } = await request.json() as { id: string; entityType: "product" | "offer" | "v2-sku" };
  if (!id || !entityType) {
    return NextResponse.json({ error: "Missing id or entityType" }, { status: 400 });
  }

  if (entityType === "v2-sku") {
    const { data: row, error: fetchError } = await supabaseAdminV2
      .from("sku_images")
      .select("image_url")
      .eq("id", id)
      .single();
    if (fetchError || !row) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    const { error: dbError } = await supabaseAdminV2.from("sku_images").delete().eq("id", id);
    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }
    const url = new URL((row as { image_url: string }).image_url);
    const storagePath = url.pathname.split("/object/public/artikelbilder/")[1];
    if (storagePath) {
      await supabaseAdmin.storage.from("artikelbilder").remove([storagePath]);
    }
    return NextResponse.json({ success: true });
  }

  const table = entityType === "product" ? "product_images" : "offer_images";

  const { data: row, error: fetchError } = await supabaseAdmin
    .from(table)
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError || !row) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const { error: dbError } = await supabaseAdmin.from(table).delete().eq("id", id);
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const url = new URL(row.image_url);
  const storagePath = url.pathname.split("/object/public/images/")[1];
  if (storagePath) {
    await supabaseAdmin.storage.from("images").remove([storagePath]);
  }

  return NextResponse.json({ success: true });
}
