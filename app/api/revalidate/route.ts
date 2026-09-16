import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";

// On-demand-Purge des gecachten Katalogs. lib/katalog/data.ts hält Kategoriebaum
// und SKU-Karten 24 h unter dem Tag "catalog"; die Admin-Speicheraktionen purgen
// ihn selbst. Diese Route ist für Änderungen AUSSERHALB der App — direktes SQL,
// import/reorganize_categories.py, später der ERP-Sync (docs/erp-integration.md) —
// von denen Next.js sonst nichts erfährt.
//
// In Route Handlers ist updateTag() nicht erlaubt (nur in Server Actions), daher
// revalidateTag mit dem Profil "max".
//
// Auth: gemeinsames Secret aus REVALIDATE_SECRET, gesendet als Header
// x-revalidate-secret. Ohne gesetzte Variable ist die Route deaktiviert (503) —
// ein Deployment ohne Secret schlägt also fehl, statt einen offenen Purge-
// Endpunkt bereitzustellen.

function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual wirft bei unterschiedlicher Länge — Länge daher separat
  // prüfen, der Vergleich selbst bleibt laufzeitkonstant.
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "Revalidierung ist nicht konfiguriert (REVALIDATE_SECRET fehlt)." },
      { status: 503 },
    );
  }

  const provided = request.headers.get("x-revalidate-secret");
  if (!provided || !secretMatches(provided, expected)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  revalidateTag("catalog", "max");

  return NextResponse.json({
    revalidated: true,
    tag: "catalog",
    at: new Date().toISOString(),
  });
}
