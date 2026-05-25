"""
Import machine compatibility data from CSV into product_specs (spec_section='maschinen').

Source: "maszyny b2b - maszyny b2.csv"
  artPowIndKat = product article code, e.g. "DGM.060025048.4LA4"
  artNazwaCała  = machine name, e.g. "Okleiniarka OPTIMAT LOGICA 306"

Mapping: series prefix (before first dot in artPowIndKat) → product slug.
Confidence rule: exactly one DB product slug contains the prefix → insert.
Multiple or no match → skip (reported at end).

Usage:
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \\
    uv run --with supabase python3 import/import_machines.py \\
    "import/maszyny b2b - maszyny b2.csv" [--dry-run]
"""

import os, sys, csv
from collections import defaultdict
from supabase import create_client

CSV_FILE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "maszyny b2b - maszyny b2.csv")
DRY_RUN = "--dry-run" in sys.argv

url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
sb = create_client(url, key)

# --- Parse CSV ---
# prefix → set of unique machine names
prefix_machines: dict[str, set[str]] = defaultdict(set)

with open(CSV_FILE, encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        art_pow = (row.get("artPowIndKat") or "").strip()
        machine = (row.get("artNazwaCała") or "").strip()
        if not art_pow or not machine or "." not in art_pow:
            continue
        prefix = art_pow.split(".")[0].lower()
        prefix_machines[prefix].add(machine)

print(f"Unique series prefixes in CSV: {len(prefix_machines)}")

# --- Fetch DB products ---
all_products = sb.table("products").select("id,name,slug").execute().data
prod_by_slug: dict[str, dict] = {p["slug"]: p for p in all_products}

# Existing maschinen specs (to avoid duplicates)
existing_specs = sb.table("product_specs").select("product_id,spec_value").eq("spec_section", "maschinen").execute().data
existing: dict[str, set[str]] = defaultdict(set)
for s in existing_specs:
    existing[s["product_id"]].add(s["spec_value"])

# --- Match prefix → product ---
matched: list[tuple[str, dict, set[str]]] = []  # (prefix, product_row, machines)
skipped_no_match: list[str] = []
skipped_ambiguous: list[tuple[str, list[str]]] = []

for prefix, machines in sorted(prefix_machines.items()):
    hits = [p for slug, p in prod_by_slug.items() if prefix in slug]
    if len(hits) == 0:
        skipped_no_match.append(prefix)
    elif len(hits) > 1:
        skipped_ambiguous.append((prefix, [p["slug"] for p in hits]))
    else:
        matched.append((prefix, hits[0], machines))

# --- Insert ---
total_inserted = 0
total_skipped_dup = 0

for prefix, prod, machines in matched:
    pid = prod["id"]
    slug = prod["slug"]
    rows_to_insert = []
    for machine in sorted(machines):
        if machine in existing[pid]:
            total_skipped_dup += 1
            continue
        rows_to_insert.append({
            "product_id": pid,
            "spec_section": "maschinen",
            "spec_key": "",
            "spec_value": machine,
            "sort_order": len(existing[pid]) + len(rows_to_insert),
        })
    if rows_to_insert:
        if not DRY_RUN:
            sb.table("product_specs").insert(rows_to_insert).execute()
        total_inserted += len(rows_to_insert)
        verb = "[DRY-RUN] Would insert" if DRY_RUN else "Inserted"
        print(f"  {verb} {len(rows_to_insert)} machines for {slug} (prefix: {prefix})")
        for r in rows_to_insert:
            print(f"    - {r['spec_value']}")

print(f"\n--- Summary ---")
print(f"Prefixes matched (confident):   {len(matched)}")
print(f"Machine entries inserted:        {total_inserted}")
if total_skipped_dup:
    print(f"Skipped (already in DB):         {total_skipped_dup}")
print(f"Skipped — no DB match:           {len(skipped_no_match)}")
if skipped_no_match:
    for p in sorted(skipped_no_match):
        print(f"  - {p}")
print(f"Skipped — ambiguous ({len(skipped_ambiguous)} prefixes):")
for prefix, slugs in skipped_ambiguous:
    print(f"  - {prefix} → {slugs}")
if DRY_RUN:
    print("\n[DRY-RUN] No data was written.")
