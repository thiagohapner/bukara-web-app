"use server";

import { updateTag } from "next/cache";

/**
 * Purgt den gecachten Katalog nach einer Kategorie-Änderung.
 *
 * Der Kategorie-Editor schreibt aus dem Browser direkt nach Supabase, d. h.
 * serverseitig erfährt sonst niemand, dass sich der Kategoriebaum geändert hat —
 * /katalog und /sortiment würden den 24 h alten Baum weiter ausliefern
 * (lib/katalog/data.ts). Erreichbar nur unter /admin, das middleware.ts
 * fail-closed über v2.is_staff() absichert.
 */
export async function purgeCatalogCache(): Promise<void> {
  updateTag("catalog");
}
