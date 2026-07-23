// Parses the real Staffelpreis (quantity-tier) data that lives in
// v2.sku_specs (spec_section = 'technische_details') into a structured shape.
// It NEVER fabricates a tier — if no tier rows parse, it returns null so the
// caller renders no Staffelpreis block. See the PDP (KatalogProductContent).

export type StaffelTier = {
  minQty: number;
  maxQty: number | null; // null = open-ended top tier ("ab N")
  unitPrice: number;
};

export type StaffelData = {
  packagingUnit: number | null; // e.g. Verpackungseinheit "10 Stück" -> 10
  tiers: StaffelTier[];
};

export type StaffelSpec = { spec_key: string; spec_value: string };

/** Parse the leading integer out of a string ("10 Stück" -> 10). Null if none. */
function leadingInt(value: string): number | null {
  const m = value.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

/** "4,54 €" -> 4.54. Null if not parseable. */
function parseEur(value: string): number | null {
  const cleaned = value.replace(/\s*€\s*/g, "").replace(",", ".").trim();
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parse Staffelpreis specs into { packagingUnit, tiers }, or null when zero
 * tiers parse. The quantity range is read from the spec KEY (not the value):
 *   "Staffelpreis bis 50 Stück"      -> min = packagingUnit ?? 1, max = 50
 *   "Staffelpreis 60–100 Stück"      -> min = 60, max = 100   (U+2013 or ASCII hyphen)
 *   "Staffelpreis ab 110 Stück"      -> min = 110, max = null
 */
export function parseStaffelSpecs(specs: StaffelSpec[]): StaffelData | null {
  const puRow = specs.find((s) => s.spec_key === "Verpackungseinheit");
  const packagingUnit = puRow ? leadingInt(puRow.spec_value) : null;

  const tiers: StaffelTier[] = [];
  for (const s of specs) {
    if (!s.spec_key.startsWith("Staffelpreis")) continue;

    const unitPrice = parseEur(s.spec_value);
    if (unitPrice === null) continue; // malformed value -> skip, never fabricate

    let minQty: number | null = null;
    let maxQty: number | null = null;

    const range = s.spec_key.match(/(\d+)\s*[–-]\s*(\d+)/);
    const bis = s.spec_key.match(/bis\s+(\d+)/);
    const ab = s.spec_key.match(/ab\s+(\d+)/);

    if (range) {
      minQty = parseInt(range[1], 10);
      maxQty = parseInt(range[2], 10);
    } else if (bis) {
      minQty = packagingUnit ?? 1;
      maxQty = parseInt(bis[1], 10);
    } else if (ab) {
      minQty = parseInt(ab[1], 10);
      maxQty = null;
    } else {
      continue; // no parseable range -> skip
    }

    tiers.push({ minQty, maxQty, unitPrice });
  }

  if (tiers.length === 0) return null;

  tiers.sort((a, b) => a.minQty - b.minQty);
  return { packagingUnit, tiers };
}
