"use client";

import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminSignOut() {
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <button
      onClick={signOut}
      className="w-full text-left text-sm text-slate-500 hover:text-slate-800 transition-colors"
    >
      Abmelden
    </button>
  );
}
