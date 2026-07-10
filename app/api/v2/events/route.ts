import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const EVENT_TYPES = new Set(["view", "add_to_cart", "purchase"]);

/**
 * Fire-and-forget product event log (view / add_to_cart / purchase), written
 * only for visitors who accepted tracking consent (the client never calls this
 * without a session id — see lib/consent.ts + lib/events/useTrackEvent.ts). No
 * PII is accepted or stored: only an anonymous session id, event type, and
 * product/sku ids.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { sessionId, eventType, productId, skuId, surface } = (body ?? {}) as Record<string, unknown>;

  if (typeof sessionId !== "string" || !sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }
  if (typeof eventType !== "string" || !EVENT_TYPES.has(eventType)) {
    return NextResponse.json({ error: "eventType must be view, add_to_cart, or purchase" }, { status: 400 });
  }
  if (typeof productId !== "string" || !productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const { error } = await supabase.from("product_events").insert({
    session_id: sessionId,
    event_type: eventType,
    product_id: productId,
    sku_id: typeof skuId === "string" ? skuId : null,
    surface: typeof surface === "string" ? surface : null,
  });

  if (error) {
    return NextResponse.json({ error: "failed to record event" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
