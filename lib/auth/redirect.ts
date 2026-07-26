// Only allow internal, single-slash paths as post-auth redirect targets, to
// avoid open-redirects (e.g. "//evil.com" or "https://evil.com").
export function safeRedirect(target: string | null | undefined, fallback = "/konto"): string {
  if (!target) return fallback;
  if (!target.startsWith("/") || target.startsWith("//")) return fallback;
  return target;
}
