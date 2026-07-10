"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

export async function refreshRecommendations(): Promise<{ ok: boolean; error?: string }> {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await admin.rpc("nightly_recommendations_refresh");
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/v2/products");
  return { ok: true };
}
