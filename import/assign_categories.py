"""
Assign products to the 10 ITA Katalog Edition 4 categories in Supabase.
Source of truth: import/product_categories.md

Usage:
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... uv run --with supabase python3 import/assign_categories.py
"""

import os
import sys
from supabase import create_client

url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
sb = create_client(url, key)

# --- Fetch DB state ---
all_products = sb.table("products").select("id,name,slug").execute().data
all_categories = sb.table("categories").select("id,slug").execute().data

prod_by_slug: dict[str, str] = {p["slug"]: p["id"] for p in all_products}
cat_by_slug: dict[str, str] = {c["slug"]: c["id"] for c in all_categories}

# --- Assignment map: category_slug → list of product slugs ---
# Pre-computed from product_categories.md + DB product list
ASSIGNMENTS: dict[str, list[str]] = {
    "dp-hw-werkzeuge": [
        "dp-schaftfraeser-dt1",
        "dp-schaftfraeser-dt2",
        "dp-schaftfraeser-dt2-led",
        "dp-highspeed-schaftfraeser-dtc",
        "dp-schaftfraeser-dtl",
        "dp-schaftfraeser-dtn",
        "dp-schaftfraeser-dts",
        "dp-schaftfraeser-dta",
        "dp-schaftfraeser-dta-bsr",
        "dp-schaftfraeser-dta-vsr",
        "dp-schaftfraeser-dtb",
        "dp-schaftfraeser-dte-turbo",
        "dp-schaftfraeser-nesting-dte",
        "dp-schaftfraeser-nesting-dtm",
        "dp-planfraeser-fdp-mit-schaft",
        "dp-profilfraeser-fdi-mit-schaft",
        "dp-profilfraeser-mit-schaft-fdh",
        "hw-wp-planfraeser-mit-schaft-fwp",
        "dp-cut-schaftfraeser",
        "dp-schaftfraeser-dti",
    ],
    "vollhartmetall-fraeser": [
        "vhw-schlichtfraeser-sa01",
        "vhw-schlichtfraeser-sb01",
        "vhw-schlichtfraeser-sb51",
        "vhw-schlichtfraeser-sc01",
        "vhw-schlichtfraeser-sc51",
        "vhm-schrupp-schlichtfraeser-sc03",
        "vhm-schrupp-schlichtfraeser-sc23",
        "vhw-schruppfraeser-sf01",
        "vhw-schruppfraeser-sf01-xr",
        "vhw-schruppfraeser-sf51",
        "vhm-schrupp-schlichtfraeser-sh01",
        "vhw-drueckerlochbohrfraeser-sf05",
        "vhw-schlosskastenfraeser-sf30",
        "vhw-schlichtfraeser-sl01-mit-wechsels-achswinkel",
        "vhw-schlichtfraeser-sm01-mit-wechsels-achswinkel",
        "vhw-schlichtfraeser-sn01-mit-wechsels-achswinkel",
        "vhw-schlichtfraeser-x90",
        "vhw-schruppfraeser-x90",
        "x99-fraeser",
        "vhw-hohlkehlfraeser-si01",
        "vhw-profilfraeser-sq29",
        "vhw-oberfraeser-sy01-gerade-schneide",
        "vhw-oberfraeser-xz3-gerade-schneide",
        "vhm-schrupp-schlichtfraeser-nc03",
    ],
    "dp-vhw-verbundwerkstoffe": [
        "vhw-schlichtfraeser-sp01",
        "vhw-schlichtfraeser-sp02",
        "vhw-schlichtfraeser-sp15",
        "vhw-schlichtfraeser-sq01",
        "vhw-schlichtfraeser-sq02",
        "vhw-hohlkehlfraeser-sq31",
        "vhw-schlichtfraeser-sr01",
        "vhw-schlichtfraeser-st01",
        "vhw-schlichtfraeser-st28",
        "vhw-schlichtfraeser-st36",
        "vhw-schlichtfraeser-st51",
        "vhw-schruppfraeser-sr33",
        "vhw-hohlkehlfraeser-cpu",
        "vhw-oberfraeser-sy26-gerade-schneide",
    ],
    "spannfutter-zubehoer": [
        "praezisionsspannzange",
        "spannzangenfutter-mit-hohlschaftkegel",
        "thermo-schrumpffutter",
        "aufnahme-saegeblatt-sba",
    ],
    "werkzeuge-kantenanleimmaschinen": [
        "dp-fuegefraeser-dgm",
        "dp-fuegefraeser-dgl-mit-wechselschneiden",
    ],
    "kreissageblaetter": [
        "hw-kreissaegeblatt",
        "hw-kreissaegeblatt-p01",
        "hw-kreissaegeblatt-p04",
        "hw-kreissaegeblatt-p28",
        "hw-kreissaegeblatt-p30-nano",
        "hw-kreissaegeblatt-pa1-fuer-ne-metalle-negativ",
        "hw-kreissaegeblatt-pw1",
        "dp-saege",
        "dp-saege-vorritz",
        "dp-saege-vorritz-dsb",
        "dp-nutsaege-dsr",
        "dp-nutsaege-dsn",
    ],
    "bohrer": [
        "hw-duebelbohrer-bbh1-s8x20",
        "hw-duebelbohrer-bbh3-s10x20",
        "hw-duebelbohrer-bbh4-s10x20",
        "hw-duebelbohrer-bbh5-s10x27",
        "hw-duebelbohrer-bbh6-s10x30",
        "hw-duebelbohrer-bbh7-s10x30",
        "hw-duebelbohrer-bbh8-s10x30",
        "hw-duebelbohrer-bbh9-s10x27",
        "hw-duebelbohrer-s-10x30",
        "hw-duebelbohrer-laser-bbx5",
        "hw-duebelbohrer-laser-bbx6",
        "hw-durchgangsbohrer-tbh1-dachspitze-60-s10x26",
        "hw-durchgangsbohrer-tbh2-dachspitze-60-s10x26",
        "hw-durchgangsbohrer-tbh3-dachspitze-60-s10x26",
        "hw-durchgangsbohrer-tbh5-dachspitze-60-s10x30",
        "hw-durchgangsbohrer-wp1-dachspitze-60-s10x24",
        "vhm-duebelbohrer-bbv5",
        "vhm-duebelbohrer-bbv6",
        "vhm-duebelbohrer-bbv7",
        "vhm-duebelbohrer-bbxv-extrem",
        "vhm-duebelbohrer-wn3",
        "vhw-durchgangsbohrer-tbv2",
        "vhw-durchgangsbohrer-tbv3",
        "vhw-durchgangsbohrer-wp3",
        "hw-zylinderkopfbohrer-hbh1-z2-2",
        "hw-zylinderkopfbohrer-hbh2-z2-2",
        "hw-zylinderkopfbohrer-hbx1-xtreme-z2-2",
        "hw-zylinderkopfbohrer-hbx2-xtreme-z2-2",
        "dp-zylinderkopfbohrer-dwa",
        "dp-zylinderkopfbohrer-dwb",
    ],
}

# Products intentionally left without a category (flagged as ambiguous)
FLAGGED_NO_CATEGORY = [
    "vhw-profilfraeser-fvi",                    # Ambiguous: VHW Fräser vs Verbundwerkstoffe in MD
    "vhw-schlichtfraeser-rechtsl-positiv-z1",   # No series code, cannot determine
    "vhw-schlichtfraeser-rechtslauf-positiv-z1", # Near-duplicate of above, no code
    "turbonesting-aufsatzturbine",              # Not in any MD category
    "turbonesting-turbinen-komplett-set",       # Not in any MD category
]

# --- Build inserts ---
rows_to_insert = []
skipped_cat_not_found = []
skipped_prod_not_found = []

for cat_slug, prod_slugs in ASSIGNMENTS.items():
    cat_id = cat_by_slug.get(cat_slug)
    if not cat_id:
        skipped_cat_not_found.append(cat_slug)
        continue
    for prod_slug in prod_slugs:
        prod_id = prod_by_slug.get(prod_slug)
        if not prod_id:
            skipped_prod_not_found.append((cat_slug, prod_slug))
            continue
        rows_to_insert.append({"product_id": prod_id, "category_id": cat_id})

# --- Insert ---
if rows_to_insert:
    sb.table("product_categories").insert(rows_to_insert).execute()
    print(f"Inserted {len(rows_to_insert)} product-category assignments.")
else:
    print("Nothing to insert.")

# --- Report ---
if skipped_cat_not_found:
    print(f"\n[WARN] Categories not found in DB ({len(skipped_cat_not_found)}):")
    for s in skipped_cat_not_found:
        print(f"  - {s}")

if skipped_prod_not_found:
    print(f"\n[WARN] Products not found in DB ({len(skipped_prod_not_found)}):")
    for cat, slug in skipped_prod_not_found:
        print(f"  - {slug}  (wanted for: {cat})")

print(f"\n[FLAGGED — no category assigned] ({len(FLAGGED_NO_CATEGORY)} products):")
for slug in FLAGGED_NO_CATEGORY:
    in_db = slug in prod_by_slug
    print(f"  - {slug}{'  ✓ exists in DB' if in_db else '  ✗ not in DB'}")

# --- Verify: count per category ---
print("\n--- Category counts (from DB) ---")
result = sb.rpc("", {}).execute() if False else None  # placeholder; use raw query below

counts = sb.table("product_categories").select("category_id").execute().data
cat_counts: dict[str, int] = {}
for row in counts:
    cid = row["category_id"]
    cat_counts[cid] = cat_counts.get(cid, 0) + 1

cat_name_by_id = {c["id"]: c["slug"] for c in all_categories}
for cid, cnt in sorted(cat_counts.items(), key=lambda x: cat_name_by_id.get(x[0], "")):
    print(f"  {cat_name_by_id.get(cid, cid)}: {cnt}")

total_assigned = len(rows_to_insert)
total_products = len(all_products)
unassigned = total_products - total_assigned - len([s for s in FLAGGED_NO_CATEGORY if s in prod_by_slug])
print(f"\nTotal products in DB: {total_products}")
print(f"Assigned: {total_assigned}")
print(f"Flagged (intentionally no category): {len([s for s in FLAGGED_NO_CATEGORY if s in prod_by_slug])}")
if unassigned > 0:
    print(f"Potentially unassigned (not in assignment map, not flagged): {unassigned}")
    unassigned_slugs = set(prod_by_slug.keys()) - set(
        slug for slugs in ASSIGNMENTS.values() for slug in slugs
    ) - set(FLAGGED_NO_CATEGORY)
    for s in sorted(unassigned_slugs):
        print(f"  - {s}")
