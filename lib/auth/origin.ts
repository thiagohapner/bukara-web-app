import { headers } from "next/headers";

// Resolve the public origin for building absolute auth redirect links from a
// server action / route handler. Prefers an explicit env override, then the
// forwarded host headers set by the hosting proxy.
export async function getOrigin(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
