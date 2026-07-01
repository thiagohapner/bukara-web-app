import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function formatEur(n: number) {
  return n.toFixed(2).replace(".", ",") + " €";
}

function emailShell(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#1e293b;padding:24px 32px;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;">BuKaRa GmbH</p>
            <h1 style="margin:4px 0 0;font-size:20px;font-weight:800;color:#ffffff;">${title}</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;">
            <p style="margin:0;font-size:11px;color:#94a3b8;">BuKaRa GmbH · Siemensstraße 24 · 72280 Dornstetten · info@bukara.de</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function section(title: string, rows: [string, string | null | undefined][]) {
  const visibleRows = rows.filter(([, v]) => v != null && v !== "" && v !== undefined);
  if (visibleRows.length === 0) return "";
  const rowsHtml = visibleRows.map(([label, value]) => `
    <tr>
      <td style="padding:8px 12px;font-size:12px;font-weight:600;color:#64748b;background:#f8fafc;border-bottom:1px solid #e2e8f0;white-space:nowrap;vertical-align:top;width:40%;">${label}</td>
      <td style="padding:8px 12px;font-size:13px;color:#1e293b;border-bottom:1px solid #e2e8f0;vertical-align:top;">${String(value).replace(/\n/g, "<br>")}</td>
    </tr>`).join("");
  return `
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;">${title}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px;">${rowsHtml}</table>`;
}

// ─── Email templates ──────────────────────────────────────────────────────────

function buildContactEmail(d: Record<string, string>) {
  const body = section("Absender", [
    ["Name", d.name],
    ["Firma", d.company],
    ["E-Mail", d.email],
    ["Telefon", d.phone],
  ]) + section("Anfrage", [
    ["Betreff", d.subject],
    ["Nachricht", d.message],
  ]);
  return emailShell("Neue Kontaktanfrage", body);
}

function buildSchaerfEmail(d: Record<string, string>) {
  const body = section("Kontakt", [
    ["Firma", d.company],
    ["Ansprechpartner", d.contact],
    ["E-Mail", d.email],
  ]) + section("Werkzeuge", [
    ["Werkzeugarten", d.toolTypes],
  ]) + section("Abholung", [
    ["Abholadresse / Bemerkungen", d.pickupAddressDeviation],
    ["Gewünschtes Datum", d.pickupDate],
    ["Abholungszeiten", d.pickupTimes],
    ["Abholungsort", d.pickupLocation],
  ]) + section("Paket", [
    ["Paketgröße", d.packageSize],
    ["Paketgewicht", d.packageWeight],
  ]) + section("Serviceoptionen", [
    ["Zahnersatz", d.carbideReplacement],
    ["Gravur", d.engraving],
  ]);
  return emailShell("Schärfservice-Anfrage", body);
}

function buildSonderEmail(d: Record<string, unknown>) {
  const det = (d.sonder_details ?? {}) as Record<string, unknown>;
  function arr(v: unknown) { return Array.isArray(v) && v.length ? (v as string[]).join(", ") : null; }
  function str(v: unknown) { return typeof v === "string" && v ? v : null; }

  const body = section("Kontakt", [
    ["Firma", str(d.company_name)],
    ["USt-IdNr.", str(d.vat_number)],
    ["Ansprechpartner", str(d.contact_name)],
    ["E-Mail", str(d.email)],
    ["Telefon", str(d.phone)],
  ]) + section("Anwendung & Material", [
    ["Anwendung", arr(det.anwendung)],
    ["Anwendung (Sonstiges)", str(det.anwendungSonstiges)],
    ["Material", arr(det.material)],
    ["Material (Sonstiges)", str(det.materialSonstiges)],
    ["Materialstärke", str(det.materialstaerke)],
  ]) + section("Maschine & Ziel", [
    ["Maschine", arr(det.maschine)],
    ["Maschine (Sonstiges)", str(det.maschineSonstiges)],
    ["Maschinentyp", str(det.maschinentyp)],
    ["Ziel / Problem", arr(det.zielProblem)],
    ["Ziel (Sonstiges)", str(det.zielSonstiges)],
    ["Sichtkanten", str(det.sichtkanten)],
  ]) + section("Prioritäten & Umfang", [
    ["Priorität Standzeit", str(det.prioritaetStandzeit)],
    ["Priorität Preis", str(det.prioritaetPreis)],
    ["Stückzahl", arr(det.stueckzahl)],
    ["Teile pro Tag/Woche", str(det.teileProTag)],
    ["Bestehendes Werkzeug", str(det.bestehendesWerkzeug)],
    ["Werkzeug Beschreibung", str(det.bestehendesBeschreibung)],
    ["Lösungsumfang", arr(det.loesungsumfang)],
  ]) + section("Weitere Angaben", [
    ["Nachricht", str(d.message)],
    ["Spezifikationsdatei", str(d.spec_file_url)],
  ]);
  return emailShell("Sonderwerkzeug-Anfrage", body);
}

function buildB2BEmail(d: Record<string, string>) {
  const body = section("Kontakt", [
    ["Ansprechpartner", d.name],
    ["Firma", d.company],
    ["E-Mail", d.email],
    ["Telefon", d.phone || null],
  ]) + section("Unternehmensdaten", [
    ["Umsatzsteuer-ID", d.umsatzsteuer_id],
  ]);
  return emailShell("B2B-Portalzugang angefragt", body);
}

function buildOrderEmail(d: {
  order: Record<string, string>;
  voucherCode?: string | null;
  items: Array<{ name: string; artikel_nr: string; variant_label: string | null; qty: number; unit_price: number; line_total: number }>;
  totals: { subtotal: number; bulkDiscountApplied: boolean; bulkDiscount: number; voucherDiscount?: number; net: number; vat: number; shipping: number; gross: number };
}) {
  const itemRows = d.items.map(item => `
    <tr>
      <td style="padding:8px 12px;font-size:13px;color:#1e293b;border-bottom:1px solid #e2e8f0;vertical-align:top;">
        <strong>${item.name}</strong>
        ${item.variant_label ? `<br><span style="font-size:11px;color:#64748b;">${item.variant_label}</span>` : ""}
        ${item.artikel_nr ? `<br><span style="font-size:11px;color:#94a3b8;">Art.-Nr.: ${item.artikel_nr}</span>` : ""}
      </td>
      <td style="padding:8px 12px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;text-align:center;">${item.qty}</td>
      <td style="padding:8px 12px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;text-align:right;">${formatEur(item.unit_price)}</td>
      <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#1e293b;border-bottom:1px solid #e2e8f0;text-align:right;">${formatEur(item.line_total)}</td>
    </tr>`).join("");

  const totalsHtml = `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:#f8fafc;">
        <th style="padding:8px 12px;font-size:11px;font-weight:700;color:#64748b;text-align:left;border-bottom:1px solid #e2e8f0;">Artikel</th>
        <th style="padding:8px 12px;font-size:11px;font-weight:700;color:#64748b;text-align:center;border-bottom:1px solid #e2e8f0;width:60px;">Menge</th>
        <th style="padding:8px 12px;font-size:11px;font-weight:700;color:#64748b;text-align:right;border-bottom:1px solid #e2e8f0;width:90px;">Einzelpreis</th>
        <th style="padding:8px 12px;font-size:11px;font-weight:700;color:#64748b;text-align:right;border-bottom:1px solid #e2e8f0;width:90px;">Gesamt</th>
      </tr>
      ${itemRows}
      <tr>
        <td colspan="3" style="padding:8px 12px;font-size:12px;color:#64748b;border-bottom:1px solid #e2e8f0;">Zwischensumme</td>
        <td style="padding:8px 12px;font-size:13px;text-align:right;border-bottom:1px solid #e2e8f0;">${formatEur(d.totals.subtotal)}</td>
      </tr>
      ${d.totals.bulkDiscountApplied ? `
      <tr>
        <td colspan="3" style="padding:8px 12px;font-size:12px;color:#00A597;border-bottom:1px solid #e2e8f0;">Zusatzrabatt (10%)</td>
        <td style="padding:8px 12px;font-size:13px;color:#00A597;text-align:right;border-bottom:1px solid #e2e8f0;">−${formatEur(d.totals.bulkDiscount)}</td>
      </tr>` : ""}
      ${(d.totals.voucherDiscount ?? 0) > 0 ? `
      <tr>
        <td colspan="3" style="padding:8px 12px;font-size:12px;color:#00A597;border-bottom:1px solid #e2e8f0;">Gutschein${d.voucherCode ? ` ${d.voucherCode}` : ""}</td>
        <td style="padding:8px 12px;font-size:13px;color:#00A597;text-align:right;border-bottom:1px solid #e2e8f0;">−${formatEur(d.totals.voucherDiscount ?? 0)}</td>
      </tr>` : ""}
      <tr>
        <td colspan="3" style="padding:8px 12px;font-size:12px;color:#64748b;border-bottom:1px solid #e2e8f0;">19% MwSt.</td>
        <td style="padding:8px 12px;font-size:13px;text-align:right;border-bottom:1px solid #e2e8f0;">${formatEur(d.totals.vat)}</td>
      </tr>
      <tr>
        <td colspan="3" style="padding:8px 12px;font-size:12px;color:#64748b;border-bottom:1px solid #e2e8f0;">Versand</td>
        <td style="padding:8px 12px;font-size:13px;text-align:right;border-bottom:1px solid #e2e8f0;">${d.totals.shipping === 0 ? "Kostenlos" : formatEur(d.totals.shipping)}</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td colspan="3" style="padding:10px 12px;font-size:14px;font-weight:700;color:#1e293b;">Gesamt inkl. MwSt.</td>
        <td style="padding:10px 12px;font-size:14px;font-weight:700;color:#1e293b;text-align:right;">${formatEur(d.totals.gross)}</td>
      </tr>
    </table>`;

  const contactSection = section("Kunde", [
    ["Firma", d.order.firmenname],
    ["USt-IdNr.", d.order.ust_idnr],
    ["Ansprechpartner", d.order.ansprechpartner],
    ["E-Mail", d.order.email],
    ["Telefon", d.order.telefon],
    ["Nachricht", d.order.nachricht],
  ]);

  const body = `
    <p style="margin:0 0 24px;font-size:13px;color:#64748b;">
      Eine neue Bestellanfrage ist eingegangen. Die Bestellung wurde in der Datenbank gespeichert.
    </p>
    ${contactSection}
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;">Bestellte Artikel</p>
    ${totalsHtml}`;

  return emailShell("Neue Bestellanfrage", body);
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { type, data } = await request.json();

  let subject = "";
  let html = "";

  try {
    if (type === "contact") {
      subject = `Kontaktanfrage von ${data.name}${data.company ? ` (${data.company})` : ""}`;
      html = buildContactEmail(data);
    } else if (type === "schaerfen") {
      subject = `Schärfservice-Anfrage von ${data.company}`;
      html = buildSchaerfEmail(data);
    } else if (type === "sonderwerkzeug") {
      subject = `Sonderwerkzeug-Anfrage von ${data.company_name}`;
      html = buildSonderEmail(data);
    } else if (type === "order") {
      subject = `Neue Bestellanfrage von ${data.order.firmenname}`;
      html = buildOrderEmail(data);
    } else if (type === "b2b") {
      subject = `B2B-Portalzugang angefragt – ${data.name}${data.company ? ` (${data.company})` : ""}`;
      html = buildB2BEmail(data);
    } else {
      return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }

    await transporter.sendMail({
      from: `"BuKaRa GmbH" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO ?? process.env.EMAIL_USER,
      subject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-email]", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
