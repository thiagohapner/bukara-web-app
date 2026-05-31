import { createClient } from "@supabase/supabase-js";

export const supabaseV2 = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: { schema: "v2" },
    auth: { persistSession: false, autoRefreshToken: false },
  }
);
