"""
Restructure the 7 flat, ITA-Katalog-inherited categories into a 2-level,
material-reine Hierarchie: DP / VHW / HW als eigenständige Ebene-1-Kategorien,
Werkzeugtyp als Ebene-2 (parent_id). Kein Frontend-Code nötig — lib/katalog/filter.ts
unterstützt die parent_id/sub-Hierarchie bereits, sie wird nur aktuell nicht genutzt.

Hintergrund / Ist-Zustand (siehe import/product_categories.md, import/assign_categories.py):
  - dp-hw-werkzeuge                     20 Produkte (19 DP + 1 HW)
  - vollhartmetall-fraeser               24 Produkte (24 VHW)
  - dp-vhw-werkzeuge-verbundwerkstoffe   14 Produkte (14 VHW — Name ist irreführend,
                                          enthält trotz Namen 0 DP-Produkte)
  - kreissaegeblaetter                   12 Produkte (7 HW + 5 DP)
  - bohrer                               30 Produkte (20 HW + 8 VHW + 2 DP)
  - werkzeuge-kantenanleimmaschinen       2 Produkte (2 DP)
  - spannfutter-zubehoer                  4 Produkte (materialneutral, bleibt unverändert)

Soll-Zustand:
  DP-Werkzeuge (neu, Ebene 1)
    ├─ DP-Schaftfräser                        (= dp-hw-werkzeuge, umbenannt, HW-Ausreißer entfernt)
    ├─ DP-Kreissägeblätter                    (neu, Split aus kreissaegeblaetter)
    ├─ DP-Bohrer                              (neu, Split aus bohrer)
    └─ DP-Werkzeuge für Kantenanleimmaschinen (= werkzeuge-kantenanleimmaschinen, umbenannt)
  VHW-Werkzeuge (neu, Ebene 1)
    ├─ VHW-Fräser                             (= vollhartmetall-fraeser, umbenannt)
    ├─ VHW-Fräser für Verbundwerkstoffe       (= dp-vhw-werkzeuge-verbundwerkstoffe, umbenannt)
    └─ VHW-Bohrer                             (neu, Split aus bohrer)
  HW-Werkzeuge (neu, Ebene 1)
    ├─ HW-Kreissägeblätter                    (= kreissaegeblaetter, umbenannt, DP-Anteil entfernt)
    ├─ HW-Bohrer                              (= bohrer, umbenannt, VHW/DP-Anteil entfernt)
    └─ HW-Fräser                              (neu, der 1 HW-Ausreißer aus dp-hw-werkzeuge)
  Spannfutter & Zubehör (unverändert, bleibt Ebene-1-Home-Kachel)

Um die Anzahl toter/verwaister Kategorie-Zeilen (und damit potenzieller 404-URLs unter
/sortiment/<slug>) klein zu halten, werden bestehende Zeilen bevorzugt UMBENANNT statt
gelöscht+neu angelegt — die größte Teilmenge behält die alte category-ID:
  - kreissaegeblaetter  →  wird selbst zu hw-kreissaegeblaetter (7 der 12 Produkte bleiben)
  - bohrer              →  wird selbst zu hw-bohrer (20 der 30 Produkte bleiben)
  - dp-hw-werkzeuge     →  wird selbst zu dp-schaftfraeser (19 der 20 Produkte bleiben)

ACHTUNG — vor dem Live-Lauf:
  1. Alte Slugs (u.a. /sortiment/dp-hw-werkzeuge, /sortiment/kreissaegeblaetter,
     /sortiment/bohrer, /sortiment/dp-vhw-werkzeuge-verbundwerkstoffe) sind vermutlich
     bereits extern verlinkt/indexiert. Dieses Skript ändert nur Datenbank-Slugs — für
     SEO-Kontinuität müssen zusätzlich 301-Redirects in next.config.ts (oder Middleware)
     ergänzt werden (nicht Teil dieses Skripts).
  2. FLAGGED_NO_CATEGORY in assign_categories.py enthält u. a. "vhw-profilfraeser-fvi"
     (aktuell ohne Kategorie, ambig zwischen VHW-Fräser und Verbundwerkstoffe) — vor dem
     Live-Lauf manuell entscheiden und ggf. in MOVE_TO_NEW_CHILD ergänzen.
  3. "x99-fraeser" hat kein Material-Präfix im Slug, gehört laut Katalog-Referenz aber zu
     VHW und bleibt unverändert in vhw-fraeser (keine Aktion nötig, nur zur Kenntnis).

Usage:
  # 1. Trockenlauf (Standard) — zeigt alle geplanten Änderungen, schreibt NICHTS:
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... uv run --with supabase python3 import/reorganize_categories.py

  # 2. Nach Prüfung der Ausgabe tatsächlich anwenden:
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... uv run --with supabase python3 import/reorganize_categories.py --apply

Das Skript ist idempotent: ein zweiter Lauf mit --apply erkennt bereits umbenannte/
angelegte/verschobene Zeilen und überspringt sie (Abgleich per Slug bzw. per bereits
bestehender product_categories-Zuordnung).
"""

import os
import sys

from supabase import create_client

APPLY = "--apply" in sys.argv
DRY_RUN = not APPLY

url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
sb = create_client(url, key)

# =====================================================================================
# 1. Neue Ebene-1-Kategorien (Material). parent_id bleibt NULL — das ist bereits die
#    Bedeutung von "Top-Level" in lib/katalog/filter.ts (applyCategory sucht
#    `c.parent_id === null`).
# =====================================================================================
NEW_PARENTS: dict[str, dict] = {
    "dp-werkzeuge": {
        "name": "DP-Werkzeuge",
        "show_on_home": True,
        "home_sort_order": 1,
        "seo_title": "DP-Werkzeuge (Diamant/PKD) — Bukara",
        "seo_description": "Diamant- und PKD-bestückte Präzisionswerkzeuge für abrasive Werkstoffe und hohe Standzeiten.",
    },
    "vhw-werkzeuge": {
        "name": "VHW-Werkzeuge",
        "show_on_home": True,
        "home_sort_order": 2,
        "seo_title": "VHW-Werkzeuge (Vollhartmetall) — Bukara",
        "seo_description": "Vollhartmetall-Präzisionswerkzeuge für CNC-Bearbeitung und stationäre Oberfräsen.",
    },
    "hw-werkzeuge": {
        "name": "HW-Werkzeuge",
        "show_on_home": True,
        "home_sort_order": 3,
        "seo_title": "HW-Werkzeuge (hartmetallbestückt) — Bukara",
        "seo_description": "Hartmetallbestückte Standardwerkzeuge für die Holz- und Plattenbearbeitung.",
    },
}

# =====================================================================================
# 2. Bestehende Kategorien, die UMBENANNT + unter einen neuen Parent gehängt werden
#    (Zeile/ID bleibt erhalten → bestehende product_categories-Zuordnungen bleiben
#    automatisch korrekt, sofern die Kategorie nicht auch gesplittet wird — siehe unten).
#    alt-slug -> (neuer slug, neuer Name, neuer parent-slug, neuer home-Status)
# =====================================================================================
RENAME_REPARENT: dict[str, dict] = {
    "dp-hw-werkzeuge": {
        "new_slug": "dp-schaftfraeser",
        "new_name": "DP-Schaftfräser",
        "parent_slug": "dp-werkzeuge",
    },
    "vollhartmetall-fraeser": {
        "new_slug": "vhw-fraeser",
        "new_name": "VHW-Fräser",
        "parent_slug": "vhw-werkzeuge",
    },
    "dp-vhw-werkzeuge-verbundwerkstoffe": {
        "new_slug": "vhw-fraeser-verbundwerkstoffe",
        "new_name": "VHW-Fräser für Verbundwerkstoffe",
        "parent_slug": "vhw-werkzeuge",
    },
    "werkzeuge-kantenanleimmaschinen": {
        "new_slug": "dp-werkzeuge-kantenanleimmaschinen",
        "new_name": "DP-Werkzeuge für Kantenanleimmaschinen",
        "parent_slug": "dp-werkzeuge",
    },
    # Die zwei größten Split-Kategorien werden selbst zur größten Teilmenge umbenannt,
    # statt eine komplett neue Zeile anzulegen (siehe Modulkommentar oben).
    "kreissaegeblaetter": {
        "new_slug": "hw-kreissaegeblaetter",
        "new_name": "HW-Kreissägeblätter",
        "parent_slug": "hw-werkzeuge",
    },
    "bohrer": {
        "new_slug": "hw-bohrer",
        "new_name": "HW-Bohrer",
        "parent_slug": "hw-werkzeuge",
    },
}

# =====================================================================================
# 3. Ganz neue Ebene-2-Kategorien (kein bestehendes Pendant, da reiner Split).
# =====================================================================================
NEW_CHILDREN: dict[str, dict] = {
    "dp-kreissaegeblaetter": {"name": "DP-Kreissägeblätter", "parent_slug": "dp-werkzeuge"},
    "dp-bohrer": {"name": "DP-Bohrer", "parent_slug": "dp-werkzeuge"},
    "vhw-bohrer": {"name": "VHW-Bohrer", "parent_slug": "vhw-werkzeuge"},
    "hw-fraeser": {"name": "HW-Fräser", "parent_slug": "hw-werkzeuge"},
}

# =====================================================================================
# 4. Produkte, die aus ihrer ALTEN (jetzt umbenannten) Kategorie in eine der neuen
#    Ebene-2-Kategorien VERSCHOBEN werden müssen (product_categories-Zeile: alte
#    category_id → neue category_id). Quelle: materialgenaue Auszählung der Slug-Präfixe
#    in import/assign_categories.py (dp- / vhw- / vhm- / hw-).
# =====================================================================================
MOVE_TO_NEW_CHILD: dict[str, list[str]] = {
    "dp-kreissaegeblaetter": [
        "dp-saege",
        "dp-saege-vorritz",
        "dp-saege-vorritz-dsb",
        "dp-nutsaege-dsr",
        "dp-nutsaege-dsn",
    ],
    "dp-bohrer": [
        "dp-zylinderkopfbohrer-dwa",
        "dp-zylinderkopfbohrer-dwb",
    ],
    "vhw-bohrer": [
        "vhm-duebelbohrer-bbv5",
        "vhm-duebelbohrer-bbv6",
        "vhm-duebelbohrer-bbv7",
        "vhm-duebelbohrer-bbxv-extrem",
        "vhm-duebelbohrer-wn3",
        "vhw-durchgangsbohrer-tbv2",
        "vhw-durchgangsbohrer-tbv3",
        "vhw-durchgangsbohrer-wp3",
    ],
    "hw-fraeser": [
        "hw-wp-planfraeser-mit-schaft-fwp",
    ],
}
# Herkunfts-Kategorie (alter Slug) je Ziel-Kategorie — nur zur Kontrolle/Logging, welche
# alte Zuordnung beim Verschieben gelöscht wird.
MOVE_SOURCE_CATEGORY = {
    "dp-kreissaegeblaetter": "kreissaegeblaetter",
    "dp-bohrer": "bohrer",
    "vhw-bohrer": "bohrer",
    "hw-fraeser": "dp-hw-werkzeuge",
}

# =====================================================================================
# 5. Alte Ebene-1-Kategorien, die nach dem Umbenennen/Splitten NICHT MEHR als Home-Kachel
#    dienen sollen (sie werden zu Ebene-2 und show_on_home=False, home_sort_order=None).
#    spannfutter-zubehoer bleibt bewusst außen vor — bleibt Ebene-1-Home-Kachel.
# =====================================================================================
DEMOTE_FROM_HOME = [
    "dp-schaftfraeser",
    "vhw-fraeser",
    "vhw-fraeser-verbundwerkstoffe",
    "dp-werkzeuge-kantenanleimmaschinen",
    "hw-kreissaegeblaetter",
    "hw-bohrer",
    "dp-kreissaegeblaetter",
    "dp-bohrer",
    "vhw-bohrer",
    "hw-fraeser",
]

SPANNFUTTER_HOME_SORT_ORDER = 4  # rückt hinter DP/VHW/HW, bleibt aber Home-Kachel


def log(msg: str) -> None:
    prefix = "[DRY-RUN] " if DRY_RUN else "[APPLY] "
    print(prefix + msg)


def main() -> None:
    categories = sb.table("categories").select("*").execute().data
    products = sb.table("products").select("id,slug").execute().data
    product_categories = sb.table("product_categories").select("product_id,category_id").execute().data

    cat_by_slug = {c["slug"]: c for c in categories}
    prod_id_by_slug = {p["slug"]: p["id"] for p in products}
    existing_assignment = {(pc["product_id"], pc["category_id"]) for pc in product_categories}

    # --- Schritt 1: neue Ebene-1-Kategorien anlegen (falls noch nicht vorhanden) ---
    parent_id_by_slug: dict[str, str] = {}
    for slug, cfg in NEW_PARENTS.items():
        existing = cat_by_slug.get(slug)
        if existing:
            log(f"Parent '{slug}' existiert bereits (id={existing['id']}) — überspringe Insert.")
            parent_id_by_slug[slug] = existing["id"]
            continue
        log(f"Neue Ebene-1-Kategorie anlegen: '{slug}' ({cfg['name']}).")
        if APPLY:
            row = {
                "name": cfg["name"],
                "slug": slug,
                "parent_id": None,
                "show_on_home": cfg["show_on_home"],
                "home_sort_order": cfg["home_sort_order"],
                "seo_title": cfg.get("seo_title"),
                "seo_description": cfg.get("seo_description"),
            }
            inserted = sb.table("categories").insert(row).execute().data[0]
            parent_id_by_slug[slug] = inserted["id"]
        else:
            parent_id_by_slug[slug] = f"<neu:{slug}>"

    # spannfutter-zubehoer bleibt Ebene 1, wird nur neu einsortiert
    spannfutter = cat_by_slug.get("spannfutter-zubehoer")
    if spannfutter:
        log(
            f"'spannfutter-zubehoer' bleibt Ebene-1-Home-Kachel, "
            f"home_sort_order → {SPANNFUTTER_HOME_SORT_ORDER}."
        )
        if APPLY:
            sb.table("categories").update(
                {"show_on_home": True, "home_sort_order": SPANNFUTTER_HOME_SORT_ORDER}
            ).eq("id", spannfutter["id"]).execute()
    else:
        log("[WARN] 'spannfutter-zubehoer' nicht in DB gefunden — bitte manuell prüfen.")

    # --- Schritt 2: bestehende Kategorien umbenennen + umhängen ---
    for old_slug, cfg in RENAME_REPARENT.items():
        existing = cat_by_slug.get(old_slug)
        already_new = cat_by_slug.get(cfg["new_slug"])
        if not existing:
            if already_new:
                log(f"'{old_slug}' → '{cfg['new_slug']}' bereits erledigt (Zeile existiert nur noch unter neuem Slug).")
                continue
            log(f"[WARN] Kategorie '{old_slug}' nicht in DB gefunden — bitte manuell prüfen.")
            continue
        parent_id = parent_id_by_slug.get(cfg["parent_slug"])
        log(
            f"'{old_slug}' (id={existing['id']}) → slug='{cfg['new_slug']}', "
            f"name='{cfg['new_name']}', parent='{cfg['parent_slug']}', show_on_home=False."
        )
        if APPLY:
            sb.table("categories").update(
                {
                    "slug": cfg["new_slug"],
                    "name": cfg["new_name"],
                    "parent_id": parent_id,
                    "show_on_home": False,
                    "home_sort_order": None,
                }
            ).eq("id", existing["id"]).execute()
        # cat_by_slug für nachfolgende Schritte aktuell halten
        cat_by_slug[cfg["new_slug"]] = {**existing, "slug": cfg["new_slug"]}

    # --- Schritt 3: ganz neue Ebene-2-Kategorien anlegen ---
    child_id_by_slug: dict[str, str] = {}
    for slug, cfg in NEW_CHILDREN.items():
        existing = cat_by_slug.get(slug)
        if existing:
            log(f"Child '{slug}' existiert bereits (id={existing['id']}) — überspringe Insert.")
            child_id_by_slug[slug] = existing["id"]
            continue
        parent_id = parent_id_by_slug.get(cfg["parent_slug"])
        log(f"Neue Ebene-2-Kategorie anlegen: '{slug}' ({cfg['name']}, parent='{cfg['parent_slug']}').")
        if APPLY:
            row = {
                "name": cfg["name"],
                "slug": slug,
                "parent_id": parent_id,
                "show_on_home": False,
                "home_sort_order": None,
            }
            inserted = sb.table("categories").insert(row).execute().data[0]
            child_id_by_slug[slug] = inserted["id"]
        else:
            child_id_by_slug[slug] = f"<neu:{slug}>"

    # --- Schritt 4: Produkte in die neuen Ebene-2-Kategorien verschieben ---
    for target_slug, prod_slugs in MOVE_TO_NEW_CHILD.items():
        target_cat_id = child_id_by_slug.get(target_slug) or cat_by_slug.get(target_slug, {}).get("id")
        source_slug = MOVE_SOURCE_CATEGORY[target_slug]
        # Nach Schritt 2 trägt die (umbenannte) Quellzeile bereits den NEUEN Slug.
        source_new_slug = RENAME_REPARENT.get(source_slug, {}).get("new_slug", source_slug)
        source_cat = cat_by_slug.get(source_new_slug)
        source_cat_id = source_cat["id"] if source_cat else None

        for prod_slug in prod_slugs:
            prod_id = prod_id_by_slug.get(prod_slug)
            if not prod_id:
                log(f"[WARN] Produkt '{prod_slug}' nicht in DB gefunden — übersprungen.")
                continue

            if source_cat_id and (prod_id, source_cat_id) in existing_assignment:
                log(f"Verschiebe '{prod_slug}': '{source_new_slug}' → '{target_slug}'.")
                if APPLY:
                    sb.table("product_categories").delete().eq("product_id", prod_id).eq(
                        "category_id", source_cat_id
                    ).execute()
            else:
                log(f"Ordne '{prod_slug}' neu zu: '{target_slug}' (keine alte Zuordnung zum Entfernen gefunden).")

            if APPLY and target_cat_id and not str(target_cat_id).startswith("<neu:"):
                if (prod_id, target_cat_id) not in existing_assignment:
                    sb.table("product_categories").insert(
                        {"product_id": prod_id, "category_id": target_cat_id}
                    ).execute()

    log("\nFertig." if APPLY else "\nTrockenlauf abgeschlossen — keine Schreibvorgänge. Mit --apply erneut ausführen, um anzuwenden.")
    log(
        "Denk an die 301-Redirects für die alten /sortiment/-URLs "
        "(dp-hw-werkzeuge, kreissaegeblaetter, bohrer, dp-vhw-werkzeuge-verbundwerkstoffe, "
        "werkzeuge-kantenanleimmaschinen, vollhartmetall-fraeser) — nicht Teil dieses Skripts."
    )


if __name__ == "__main__":
    main()
