"""
Import material suitability from ITA_Katalog_Produkte.csv using SKU-based matching.

Join: CSV skus (pipe-split) → skus.artikel_nr → skus.product_id → product_materials

Safety: products that already have product_materials rows are skipped entirely.

Usage:
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \\
    uv run --with supabase \\
    python3 import/import_materials_csv.py [--dry-run]
"""

import os, sys, csv
from collections import defaultdict
from supabase import create_client

CSV_FILE = os.path.join(os.path.dirname(__file__), "ITA_Katalog_Produkte.csv")
DRY_RUN = "--dry-run" in sys.argv

SUITABILITY_MAP = {
    "1 out of 3": "geeignet",
    "2 out of 3": "gut geeignet",
    "3 out of 3": "sehr gut geeignet",
}

url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
sb = create_client(url, key)

# --- Parse CSV: group materials by raw sku-list string ---
sku_group_mats: dict[str, dict[str, str]] = defaultdict(dict)

with open(CSV_FILE, encoding="utf-8") as f:
    for row in csv.DictReader(f):
        if row["section"].strip() != "Material":
            continue
        mat = row["material"].strip()
        suit_raw = row["suitability"].strip()
        skus_raw = row["skus"].strip()
        suit = SUITABILITY_MAP.get(suit_raw)
        if not mat or not suit or not skus_raw:
            continue
        if mat not in sku_group_mats[skus_raw]:
            sku_group_mats[skus_raw][mat] = suit

print(f"Unique SKU groups with material data: {len(sku_group_mats)}")

# --- Fetch DB ---
all_skus = sb.table("skus").select("lieferanten_nr,product_id").execute().data
sku_to_product: dict[str, str] = {
    s["lieferanten_nr"]: s["product_id"]
    for s in all_skus
    if s.get("product_id") and s.get("lieferanten_nr")
}

all_products = sb.table("products").select("id,name,slug").execute().data
prod_info: dict[str, dict] = {p["id"]: p for p in all_products}

existing_materials = sb.table("product_materials").select("product_id,material_name,sort_order").execute().data
existing_by_product: dict[str, set] = defaultdict(set)
max_sort_by_product: dict[str, int] = defaultdict(int)
for m in existing_materials:
    pid = m["product_id"]
    existing_by_product[pid].add(m["material_name"])
    if (m["sort_order"] or 0) > max_sort_by_product[pid]:
        max_sort_by_product[pid] = m["sort_order"] or 0

existing_material_types = {
    r["name"] for r in sb.table("material_types").select("name").execute().data
}

# --- Map SKU groups → product_id ---
product_materials_map: dict[str, dict[str, str]] = defaultdict(dict)
skus_not_found: list[str] = []

for skus_raw, mat_dict in sku_group_mats.items():
    individual_skus = [s.strip() for s in skus_raw.split("|") if s.strip()]
    product_ids_found: set[str] = set()
    for sku in individual_skus:
        pid = sku_to_product.get(sku)
        if pid:
            product_ids_found.add(pid)
        else:
            skus_not_found.append(sku)
    for pid in product_ids_found:
        for mat, suit in mat_dict.items():
            if mat not in product_materials_map[pid]:
                product_materials_map[pid][mat] = suit

# --- Insert (skip products that already have data) ---
products_updated = 0
products_skipped = 0
total_inserted = 0
new_types: list[str] = []

for product_id, mat_dict in sorted(
    product_materials_map.items(),
    key=lambda x: prod_info.get(x[0], {}).get("slug", ""),
):
    if existing_by_product[product_id]:
        products_skipped += 1
        continue

    slug = prod_info.get(product_id, {}).get("slug", product_id)
    next_sort = max_sort_by_product[product_id]
    rows = []

    for mat_name, suitability in mat_dict.items():
        if mat_name not in existing_material_types:
            if not DRY_RUN:
                sb.table("material_types").insert({"name": mat_name}).execute()
            existing_material_types.add(mat_name)
            new_types.append(mat_name)
        rows.append({
            "product_id": product_id,
            "material_name": mat_name,
            "suitability": suitability,
            "sort_order": next_sort,
        })
        next_sort += 1

    if rows:
        if not DRY_RUN:
            sb.table("product_materials").insert(rows).execute()
        total_inserted += len(rows)
        verb = "[DRY-RUN]" if DRY_RUN else "[INSERTED]"
        print(f"{verb} {slug}: {len(rows)} materials")
        products_updated += 1

print(f"\n--- Summary ---")
print(f"Products updated:            {products_updated}")
print(f"Material entries inserted:   {total_inserted}")
print(f"Products skipped (had data): {products_skipped}")
print(f"SKUs not in DB:              {len(skus_not_found)}")
if new_types:
    print(f"New material_types ({len(new_types)}): {new_types}")
if DRY_RUN:
    print("\n[DRY-RUN] No data was written.")
