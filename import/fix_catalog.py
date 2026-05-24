"""
Apply catalog fixes to Supabase based on ITA_Katalog_Produkte.csv as source of truth.

Usage:
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... uv run --with supabase python3 import/fix_catalog.py import/ITA_Katalog_Produkte.csv
"""

import os, sys, csv
from collections import defaultdict
from supabase import create_client

CSV_FILE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "ITA_Katalog_Produkte.csv")

url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
sb = create_client(url, key)

SUITABILITY_MAP = {
    "1 out of 3": "geeignet",
    "2 out of 3": "gut geeignet",
    "3 out of 3": "sehr gut geeignet",
}

# --- Parse CSV ---
csv_products: dict[str, dict] = defaultdict(lambda: {"tech_details": [], "anwendungen": [], "materials": {}})
with open(CSV_FILE, encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        series = row["series"].strip()
        section = row["section"].strip()
        if section == "Technische Details":
            detail = row["detail"].strip()
            if detail:
                csv_products[series]["tech_details"].append(detail)
        elif section == "Anwendung":
            anwendung = row["anwendung"].strip()
            if anwendung:
                csv_products[series]["anwendungen"].append(anwendung)
        elif section == "Material":
            material = row["material"].strip()
            suitability_raw = row["suitability"].strip()
            if material and suitability_raw:
                csv_products[series]["materials"][material] = SUITABILITY_MAP.get(suitability_raw, suitability_raw)

# --- Fetch DB ---
all_products = sb.table("products").select("id,name,slug").execute().data

all_specs = sb.table("product_specs").select("id,product_id,spec_section,spec_key,spec_value,sort_order").execute().data
db_specs: dict[str, list] = defaultdict(list)
for spec in all_specs:
    db_specs[spec["product_id"]].append(spec)

all_materials = sb.table("product_materials").select("id,product_id,material_name,suitability,sort_order").execute().data
db_materials: dict[str, list] = defaultdict(list)
for mat in all_materials:
    db_materials[mat["product_id"]].append(mat)


# --- Series → DB product matching ---
def find_db_products(series: str) -> list[dict]:
    if series == "DT2":
        return [p for p in all_products if "dt2" in p["slug"] and "led" not in p["slug"]]
    if series == "DT2 LED":
        return [p for p in all_products if "dt2" in p["slug"] and "led" in p["slug"]]
    if series == "DTE TURBO NESTING":
        return [p for p in all_products if "nesting" in p["slug"] and "dte" in p["slug"] and "densimet" not in p["slug"]]
    if series == "DTE DENSIMET NESTING":
        return [p for p in all_products if "densimet" in p["slug"] and "nesting" in p["slug"]]
    if series == "DTE TURBO":
        return [p for p in all_products if "dte-turbo" in p["slug"] and "nesting" not in p["slug"]]
    if series == "FDI / FDT":
        return [p for p in all_products if "fdi" in p["slug"] or "fdt" in p["slug"]]
    if series == "SC03 / SC23":
        return [p for p in all_products if "sc03" in p["slug"] or "sc23" in p["slug"]]
    if series == "SF05 / SF30":
        return [p for p in all_products if "sf05" in p["slug"] or "sf30" in p["slug"]]
    if series == "SL01 / SM01 / SN01":
        return [p for p in all_products if
                ("sl01" in p["slug"] or "sm01" in p["slug"] or "sn01" in p["slug"]) and "tr" not in p["slug"]]
    if series == "SL01.TR / SM01.TR / SN01.TR":
        return [p for p in all_products if
                ("sl01" in p["slug"] or "sm01" in p["slug"] or "sn01" in p["slug"]) and "tr" in p["slug"]]
    token = series.lower().replace(" ", "-")
    return [p for p in all_products if token in p["slug"]]


# --- Fix helpers ---
def fix_specs(pid: str, section_key: str, csv_values: list[str]) -> None:
    existing = [s for s in db_specs[pid] if s["spec_section"] == section_key]
    existing_vals = {s["spec_value"] for s in existing}
    target_vals = set(csv_values)
    if existing_vals == target_vals:
        return
    if existing:
        sb.table("product_specs").delete().in_("id", [s["id"] for s in existing]).execute()
    if csv_values:
        sb.table("product_specs").insert([
            {"product_id": pid, "spec_section": section_key, "spec_key": "", "spec_value": v, "sort_order": i}
            for i, v in enumerate(csv_values)
        ]).execute()
    print(f"    specs/{section_key}: {len(existing)} old → {len(csv_values)} new")


def fix_materials(pid: str, csv_mat: dict[str, str]) -> None:
    existing = list(db_materials[pid])
    db_by_name = {m["material_name"]: m for m in existing}
    to_delete = set(db_by_name.keys())
    next_sort = (max((m["sort_order"] or 0) for m in existing) + 1) if existing else 0

    for mat_name, csv_suit in csv_mat.items():
        if mat_name in db_by_name:
            row = db_by_name[mat_name]
            if row["suitability"] != csv_suit:
                sb.table("product_materials").update({"suitability": csv_suit}).eq("id", row["id"]).execute()
                print(f"    material '{mat_name}': suitability {row['suitability']!r} → {csv_suit!r}")
            to_delete.discard(mat_name)

        elif mat_name == "Corian/HPL" and "Corian® / HPL" in db_by_name:
            row = db_by_name["Corian® / HPL"]
            updates: dict = {"material_name": "Corian/HPL"}
            if row["suitability"] != csv_suit:
                updates["suitability"] = csv_suit
            sb.table("product_materials").update(updates).eq("id", row["id"]).execute()
            suffix = f", suitability → {csv_suit!r}" if "suitability" in updates else ""
            print(f"    material renamed 'Corian® / HPL' → 'Corian/HPL'{suffix}")
            to_delete.discard("Corian® / HPL")

        elif mat_name == "Glasfaser/Kohlenstofffaser":
            glas = db_by_name.get("Glasfaser")
            kohle = db_by_name.get("Kohlenstofffaser")
            if glas:
                sb.table("product_materials").update({"material_name": "Glasfaser/Kohlenstofffaser", "suitability": csv_suit}).eq("id", glas["id"]).execute()
                print(f"    material 'Glasfaser' → 'Glasfaser/Kohlenstofffaser' = {csv_suit!r}")
                to_delete.discard("Glasfaser")
            if kohle:
                sb.table("product_materials").delete().eq("id", kohle["id"]).execute()
                print(f"    material 'Kohlenstofffaser' deleted (merged)")
                to_delete.discard("Kohlenstofffaser")
            if not glas and not kohle:
                sb.table("product_materials").insert(
                    {"product_id": pid, "material_name": mat_name, "suitability": csv_suit, "sort_order": next_sort}
                ).execute()
                next_sort += 1
                print(f"    material inserted: {mat_name!r} = {csv_suit!r}")

        else:
            sb.table("product_materials").insert(
                {"product_id": pid, "material_name": mat_name, "suitability": csv_suit, "sort_order": next_sort}
            ).execute()
            next_sort += 1
            print(f"    material inserted: {mat_name!r} = {csv_suit!r}")

    for mat_name in to_delete:
        sb.table("product_materials").delete().eq("id", db_by_name[mat_name]["id"]).execute()
        print(f"    material deleted (not in CSV): {mat_name!r}")


# --- Main ---
for series in sorted(csv_products.keys()):
    matched = find_db_products(series)
    if not matched:
        print(f"[SKIP] {series} — no matching DB product (create manually)")
        continue

    csv_data = csv_products[series]
    for db_prod in matched:
        pid = db_prod["id"]
        slug = db_prod["slug"]
        print(f"[FIX] {series} → {slug}")
        fix_specs(pid, "technische_details", csv_data["tech_details"])
        fix_specs(pid, "anwendung", csv_data["anwendungen"])
        fix_materials(pid, csv_data["materials"])

print("\nDone.")
