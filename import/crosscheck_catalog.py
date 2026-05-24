"""
Cross-check ITA_Katalog_Produkte.csv against Supabase product_specs and product_materials.

Usage:
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... uv run --with supabase python3 import/crosscheck_catalog.py import/ITA_Katalog_Produkte.csv
"""

import os
import sys
import csv
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

# --- Fetch DB data ---
all_products = sb.table("products").select("id,name,slug").execute().data

all_specs = sb.table("product_specs").select("product_id,spec_section,spec_value").execute().data

all_materials = sb.table("product_materials").select("product_id,material_name,suitability").execute().data

# Build lookup dicts
db_specs: dict[str, dict] = defaultdict(lambda: {"technische_details": [], "anwendung": []})
for spec in all_specs:
    pid = spec["product_id"]
    section = spec["spec_section"]
    val = (spec["spec_value"] or "").strip()
    if val:
        db_specs[pid][section].append(val)

db_materials: dict[str, dict] = defaultdict(dict)
for mat in all_materials:
    pid = mat["product_id"]
    db_materials[pid][mat["material_name"]] = mat["suitability"]


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

    # General: convert series to slug token and search
    token = series.lower().replace(" ", "-")
    return [p for p in all_products if token in p["slug"]]


# --- Cross-check and report ---
issues_found = False

for series in sorted(csv_products.keys()):
    csv_data = csv_products[series]
    matched = find_db_products(series)

    if not matched:
        print(f"\n[NO MATCH] {series}")
        print(f"  No DB product found with slug containing '{series.lower().replace(' ', '-')}'")
        issues_found = True
        continue

    for db_prod in matched:
        pid = db_prod["id"]
        slug = db_prod["slug"]

        db_tech = set(db_specs[pid]["technische_details"])
        db_anw = set(db_specs[pid]["anwendung"])
        db_mat = db_materials[pid]

        csv_tech = set(csv_data["tech_details"])
        csv_anw = set(csv_data["anwendungen"])
        csv_mat = csv_data["materials"]

        tech_only_csv = csv_tech - db_tech
        tech_only_db = db_tech - csv_tech
        anw_only_csv = csv_anw - db_anw
        anw_only_db = db_anw - csv_anw

        mat_issues = []
        for mat in sorted(set(csv_mat) | set(db_mat)):
            csv_suit = csv_mat.get(mat)
            db_suit = db_mat.get(mat)
            if csv_suit != db_suit:
                mat_issues.append((mat, csv_suit, db_suit))

        has_issues = bool(tech_only_csv or tech_only_db or anw_only_csv or anw_only_db or mat_issues)

        if has_issues:
            issues_found = True
            print(f"\n[MISMATCH] {series} → {slug}")
            if tech_only_csv:
                print("  Technische Details — in CSV but missing from DB:")
                for v in sorted(tech_only_csv):
                    print(f"    - {v}")
            if tech_only_db:
                print("  Technische Details — in DB but not in CSV:")
                for v in sorted(tech_only_db):
                    print(f"    - {v}")
            if anw_only_csv:
                print("  Anwendung — in CSV but missing from DB:")
                for v in sorted(anw_only_csv):
                    print(f"    - {v}")
            if anw_only_db:
                print("  Anwendung — in DB but not in CSV:")
                for v in sorted(anw_only_db):
                    print(f"    - {v}")
            if mat_issues:
                print("  Materials — suitability mismatches:")
                for mat, csv_s, db_s in mat_issues:
                    print(f"    - {mat}: CSV={csv_s!r}  DB={db_s!r}")
        else:
            print(f"[OK] {series} → {slug}")

print()
if not issues_found:
    print("All products OK — CSV matches Supabase data exactly.")
else:
    print("Cross-check complete. See mismatches above.")
