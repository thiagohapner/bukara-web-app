import { createClient } from "@supabase/supabase-js";

export const supabaseAdminV2 = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "missing-service-role-key",
  {
    db: { schema: "v2" },
    auth: { autoRefreshToken: false, persistSession: false },
  }
);
