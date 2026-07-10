/**
 * The intake forms collect answers in coarse, customer-facing checkbox labels
 * that don't literally match the catalog's finer-grained taxonomy (e.g. the
 * form's "Spanplatte" vs. the catalog's "Rohe Spanplatte" / "Beschichtete
 * Spanplatte" / "Laminierte Spanplatte"). These maps translate a form answer
 * into the matching v2 material_name / application tag values so the
 * form_success recommendation surface actually finds matches instead of
 * silently returning nothing on an exact-string mismatch.
 */

// sonder-werkzeug: MATERIAL checkboxes → v2.product_materials.material_name
export const WERKZEUG_MATERIAL_MAP: Record<string, string[]> = {
  "Spanplatte": ["Rohe Spanplatte", "Beschichtete Spanplatte", "Laminierte Spanplatte"],
  "MDF / HDF": ["Rohe MDF", "Beschichtetes MDF", "Laminierte MDF"],
  "Multiplex": ["Sperrholz", "Beschichtetes Sperrholz", "Laminiertes Sperrholz"],
  "Massivholz": ["Hartes Massivholz", "Weiches Massivholz"],
  "HPL / Kompaktplatte": ["HPL", "Corian® / HPL"],
  "Kunststoff": ["Kunststoffe", "Plastik", "Plexiglas"],
  "Aluminium": ["Aluminium", "Alu / PVC Profile", "PVC & Aluminium Profile"],
  "Verbundmaterial": ["Alucobond®", "Alucobond® A2", "Glasfaser", "Kohlenstofffaser", "Glasfaser/Kohlenstofffaser"],
};

// sonder-werkzeug: ANWENDUNG checkboxes → v2.product_applications.tag
// Only mapped where the match is unambiguous; "Kantenbearbeitung" and
// "Profilbearbeitung" have no confident single-tag equivalent and are left out
// rather than guessed.
export const WERKZEUG_ANWENDUNG_MAP: Record<string, string[]> = {
  "Plattenzuschnitt": ["Schneiden"],
  "Nuten / Falzen": ["Nuten", "Falzen"],
  "Bohren": ["Bohren"],
  "Fräsen / Kontur": ["Fräsen"],
};

// sonder-schaerfservice: WERK_OPTIONS checkboxes → v2.categories.id
// (these labels are literally the catalog's own top-level tool category names)
export const SCHAERFSERVICE_CATEGORY_MAP: Record<string, string> = {
  "Bohrer": "901f4563-5ac2-48ac-8e23-db56a03cb8ca",
  "DP & HW Werkzeuge": "8c409889-ca12-4473-b557-3f31d01bb76c",
  "Vollhartmetall Fräser": "e4c4663e-baa6-44af-96a8-266a3cf1c8e8",
  "DP & VHW Werkzeuge": "4ded619a-a2f2-49a6-98d5-a1b589ccc5ef",
  "Kreissägeblätter": "5a9d5555-b70f-4549-896b-34bc5c8b6411",
};

export function mapSeeds(selections: string[], map: Record<string, string[]>): string[] {
  const out = new Set<string>();
  for (const sel of selections) {
    for (const v of map[sel] ?? []) out.add(v);
  }
  return [...out];
}
