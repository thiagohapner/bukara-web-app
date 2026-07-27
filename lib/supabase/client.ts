import { createBrowserClient } from "@supabase/ssr";

// Browser (client component) Supabase client with cookie-based sessions.
// Used for client-side sign-up. Access decisions never rely on this client.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
