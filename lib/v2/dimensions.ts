// Canonical ordered list of v2.skus measurement columns for the PDP "Abmessungen" table.
// German labels + units. NULL/empty fields are hidden by getDimensionRows.

export const SKU_DIMENSIONS: { key: string; label: string; unit?: string }[] = [
  { key: "diameter_mm", label: "Durchmesser (Ø)", unit: "mm" },
  { key: "nl_mm", label: "Nutzlänge (NL)", unit: "mm" },
  { key: "nl_1", label: "Nutzlänge (NL1)", unit: "mm" },
  { key: "gl_mm", label: "Gesamtlänge (GL)", unit: "mm" },
  { key: "shank_mm", label: "Schaftdurchmesser (S)", unit: "mm" },
  { key: "shank_length_mm", label: "Schaftlänge", unit: "mm" },
  { key: "h_mm", label: "Höhe (H)", unit: "mm" },
  { key: "bore_mm", label: "Bohrung", unit: "mm" },
  { key: "corner_radius_mm", label: "Eckenradius (R)", unit: "mm" },
  { key: "kerf_mm", label: "Schnittbreite (SB)", unit: "mm" },
  { key: "plate_mm", label: "Plattenstärke", unit: "mm" },
  { key: "teeth", label: "Zähnezahl (Z)" },
];

/** German number formatting: decimal comma, no trailing zeros. */
function formatNumber(value: number | string): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return String(value);
  return String(n).replace(".", ",");
}

/** Build the visible Abmessungen rows for a SKU, skipping null/empty fields. */
export function getDimensionRows(
  sku: Record<string, unknown>,
): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  for (const { key, label, unit } of SKU_DIMENSIONS) {
    const raw = sku[key];
    if (raw === null || raw === undefined || raw === "") continue;
    const num = formatNumber(raw as number | string);
    rows.push({ label, value: unit ? `${num} ${unit}` : num });
  }
  return rows;
}
