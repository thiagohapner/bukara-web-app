import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";
import { processImage } from "@/lib/admin/imageProcessing";

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

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const entityType = formData.get("entityType") as string | null; // "product" | "offer"
  const entityId = formData.get("entityId") as string | null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!file || !entityType || !entityId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!["product", "offer"].includes(entityType)) {
    return NextResponse.json({ error: "Invalid entityType" }, { status: 400 });
  }
  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 400 });
  }

  const raw = Buffer.from(await file.arrayBuffer());
  const webp = await processImage(raw);

  const fileName = `${entityType}s/${entityId}/${Date.now()}.webp`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from("images")
    .upload(fileName, webp, { contentType: "image/webp", upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabaseAdmin.storage.from("images").getPublicUrl(fileName);
  const imageUrl = urlData.publicUrl;

  const table = entityType === "product" ? "product_images" : "offer_images";
  const fkColumn = entityType === "product" ? "product_id" : "offer_id";

  const { data: row, error: dbError } = await supabaseAdmin
    .from(table)
    .insert({ [fkColumn]: entityId, image_url: imageUrl, sort_order: sortOrder })
    .select("id, image_url, sort_order")
    .single();

  if (dbError) {
    await supabaseAdmin.storage.from("images").remove([fileName]);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(row);
}
