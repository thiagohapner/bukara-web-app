import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";

export const dynamic = "force-dynamic";

/**
 * Logs one completed Werkzeug-Lotse guided-chat query (the filters picked +
 * how many products matched). This is the feedback loop: /admin/v2/chat
 * reads it back to surface material/application combinations that returned
 * zero results, so staff can close real coverage gaps in the product data
 * instead of the bot "learning" anything itself.
 *
 * Best-effort: a logging failure must never break the chat UI, so this
 * always resolves 200 and only the `ok` flag reports success.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { sessionId, material, application, minDiameter, maxDiameter, resultCount } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (typeof sessionId !== "string" || sessionId.length === 0) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { error } = await supabaseAdminV2.from("chat_queries").insert({
    session_id: sessionId,
    material: typeof material === "string" ? material : null,
    application: typeof application === "string" ? application : null,
    min_diameter: typeof minDiameter === "number" ? minDiameter : null,
    max_diameter: typeof maxDiameter === "number" ? maxDiameter : null,
    result_count: typeof resultCount === "number" ? resultCount : 0,
  });

  if (error) {
    console.error("chat/log insert failed:", error.message);
    return NextResponse.json({ ok: false });
  }
  return NextResponse.json({ ok: true });
}
