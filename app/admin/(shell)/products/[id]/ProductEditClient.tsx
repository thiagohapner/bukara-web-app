"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
import SkuEditor, { type SkuRow } from "@/components/admin/SkuEditor";
import ProductDataEditor, {
  type SpecRow,
  type MaterialRow,
  type CuttingRow,
} from "@/components/admin/ProductDataEditor";
import AccessoriesEditor, { type AccessoryRow } from "@/components/admin/AccessoriesEditor";
import ImageUploadManager from "@/components/admin/ImageUploadManager";

interface ProductDetails {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  short_description: string;
  long_description: string;
  badge: string;
  gallery_bg: string;
  gallery_label: string;
  is_active: boolean;
  has_public_page: boolean;
  sort_order: number;
}

interface ProductOption { id: string; name: string; }
interface ImageRow { id: string; image_url: string; sort_order: number; }

const TABS = ["Details", "SKUs", "Produktdaten", "Zubehör", "Bilder"] as const;
type Tab = typeof TABS[number];

const EMPTY: ProductDetails = {
  id: "", slug: "", name: "", tagline: "", short_description: "", long_description: "",
  badge: "", gallery_bg: "#e6eff5", gallery_label: "", is_active: true, has_public_page: false, sort_order: 0,
};

export default function ProductEditClient({ productId }: { productId: string | null }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Details");
  const [product, setProduct] = useState<ProductDetails>(EMPTY);
  const [skus, setSkus] = useState<SkuRow[]>([]);
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [cutting, setCutting] = useState<CuttingRow[]>([]);
  const [accessories, setAccessories] = useState<AccessoryRow[]>([]);
  const [images, setImages] = useState<ImageRow[]>([]);
  const [materialTypes, setMaterialTypes] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMaterialTypes = useCallback(async () => {
    const { data } = await supabase.from("material_types").select("name").order("sort_order");
    setMaterialTypes((data ?? []).map((r: { name: string }) => r.name));
  }, []);

  const load = useCallback(async () => {
    loadMaterialTypes();
    const { data: prods } = await supabase.from("products").select("id, name").order("name");
    setAllProducts((prods ?? []) as ProductOption[]);

    if (!productId) return;
    const [prodRes, skuRes, specRes, matRes, cutRes, accRes, imgRes] = await Promise.all([
      supabase.from("products").select("*").eq("id", productId).single(),
      supabase.from("skus").select("*").eq("product_id", productId).order("sort_order"),
      supabase.from("product_specs").select("*").eq("product_id", productId).order("sort_order"),
      supabase.from("product_materials").select("*").eq("product_id", productId).order("sort_order"),
      supabase.from("product_cutting_data").select("*").eq("product_id", productId).order("sort_order"),
      supabase.from("product_accessories").select("*").eq("product_id", productId).order("sort_order"),
      supabase.from("product_images").select("*").eq("product_id", productId).order("sort_order"),
    ]);
    if (prodRes.data) setProduct(prodRes.data as ProductDetails);
    setSkus((skuRes.data ?? []) as SkuRow[]);
    setSpecs((specRes.data ?? []) as SpecRow[]);
    setMaterials((matRes.data ?? []) as MaterialRow[]);
    setCutting((cutRes.data ?? []) as CuttingRow[]);
    setAccessories((accRes.data ?? []) as AccessoryRow[]);
    setImages((imgRes.data ?? []) as ImageRow[]);
  }, [productId, loadMaterialTypes]);

  const addMaterialType = useCallback(async (name: string) => {
    await supabase.from("material_types").insert({ name });
    await loadMaterialTypes();
  }, [loadMaterialTypes]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      let id = productId;

      if (!id) {
        const { data, error: e } = await supabase.from("products").insert({
          slug: product.slug, name: product.name, tagline: product.tagline,
          short_description: product.short_description, long_description: product.long_description,
          badge: product.badge || null, gallery_bg: product.gallery_bg,
          gallery_label: product.gallery_label || null, is_active: product.is_active,
          has_public_page: product.has_public_page, sort_order: product.sort_order,
        }).select("id").single();
        if (e) throw e;
        id = data!.id;
      } else {
        const { error: e } = await supabase.from("products").update({
          slug: product.slug, name: product.name, tagline: product.tagline,
          short_description: product.short_description, long_description: product.long_description,
          badge: product.badge || null, gallery_bg: product.gallery_bg,
          gallery_label: product.gallery_label || null, is_active: product.is_active,
          has_public_page: product.has_public_page, sort_order: product.sort_order,
        }).eq("id", id);
        if (e) throw e;
      }

      await syncSkus(id!, skus);
      await syncRows("product_specs", "product_id", id!, specs);
      await syncRows("product_materials", "product_id", id!, materials);
      await syncRows("product_cutting_data", "product_id", id!, cutting);
      await syncRows("product_accessories", "product_id", id!, accessories);

      if (!productId) {
        router.push(`/admin/products/${id}`);
      } else {
        await load();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <a href="/admin/products" className="text-sm text-slate-400 hover:text-slate-600">← Produkte</a>
          <h1 className="text-2xl font-semibold text-slate-800 mt-1">
            {productId ? product.name || "Produkt bearbeiten" : "Neues Produkt"}
          </h1>
        </div>
        <button onClick={save} disabled={saving} className="btn-orange px-5 py-2 text-sm disabled:opacity-60">
          {saving ? "Speichern..." : "Speichern"}
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      <div className="flex gap-0 border-b border-slate-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t ? "border-teal-500 text-teal-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {tab === "Details" && (
          <div className="grid grid-cols-1 gap-4 max-w-2xl">
            <Row label="Name *"><input className={inp} value={product.name} onChange={e => setProduct(p => ({ ...p, name: e.target.value }))} /></Row>
            <Row label="Slug *"><input className={inp} value={product.slug} onChange={e => setProduct(p => ({ ...p, slug: e.target.value }))} /></Row>
            <Row label="Tagline"><input className={inp} value={product.tagline} onChange={e => setProduct(p => ({ ...p, tagline: e.target.value }))} /></Row>
            <Row label="Kurzbeschreibung"><textarea className={inp} rows={2} value={product.short_description} onChange={e => setProduct(p => ({ ...p, short_description: e.target.value }))} /></Row>
            <Row label="Beschreibung"><textarea className={inp} rows={4} value={product.long_description} onChange={e => setProduct(p => ({ ...p, long_description: e.target.value }))} /></Row>
            <Row label="Badge (z.B. -30%)"><input className={inp} value={product.badge} onChange={e => setProduct(p => ({ ...p, badge: e.target.value }))} placeholder="-30%" /></Row>
            <Row label="Galerie-Hintergrundfarbe"><input type="color" value={product.gallery_bg} onChange={e => setProduct(p => ({ ...p, gallery_bg: e.target.value }))} className="h-9 w-20 rounded border border-slate-200 cursor-pointer" /></Row>
            <Row label="Galerie-Label"><input className={inp} value={product.gallery_label} onChange={e => setProduct(p => ({ ...p, gallery_label: e.target.value }))} /></Row>
            <Row label="Sortierung"><input type="number" className={inp} value={product.sort_order} onChange={e => setProduct(p => ({ ...p, sort_order: Number(e.target.value) }))} /></Row>
            <div className="flex gap-6">
              <Check label="Aktiv" checked={product.is_active} onChange={v => setProduct(p => ({ ...p, is_active: v }))} />
              <Check label="Öffentliche Seite" checked={product.has_public_page} onChange={v => setProduct(p => ({ ...p, has_public_page: v }))} />
            </div>
          </div>
        )}
        {tab === "SKUs" && <SkuEditor skus={skus} onChange={setSkus} />}
        {tab === "Produktdaten" && (
          <ProductDataEditor
            specs={specs} materials={materials} cutting={cutting}
            onSpecsChange={setSpecs} onMaterialsChange={setMaterials} onCuttingChange={setCutting}
            materialTypes={materialTypes} onAddMaterialType={addMaterialType}
          />
        )}
        {tab === "Zubehör" && productId && (
          <AccessoriesEditor
            accessories={accessories}
            products={allProducts}
            currentProductId={productId}
            onChange={setAccessories}
          />
        )}
        {tab === "Zubehör" && !productId && (
          <p className="text-sm text-slate-500">Speichern Sie das Produkt zuerst, um Zubehör hinzuzufügen.</p>
        )}
        {tab === "Bilder" && productId && (
          <ImageUploadManager entityType="product" entityId={productId} images={images} onChange={setImages} />
        )}
        {tab === "Bilder" && !productId && (
          <p className="text-sm text-slate-500">Speichern Sie das Produkt zuerst, um Bilder hochzuladen.</p>
        )}
      </div>
    </div>
  );
}

const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="rounded" />
      {label}
    </label>
  );
}

async function syncSkus(productId: string, skus: SkuRow[]) {
  const toDelete = skus.filter(s => s.id && s._deleted).map(s => s.id!);
  const toUpsert = skus.filter(s => !s._deleted).map((s, i) => ({
    ...(s.id ? { id: s.id } : {}),
    product_id: productId,
    artikel_nr: s.artikel_nr,
    variant_label: s.variant_label || null,
    price: s.price,
    campaign_price: s.campaign_price,
    stock_quantity: s.stock_quantity,
    is_active: s.is_active,
    sort_order: i,
  }));
  if (toDelete.length) await supabase.from("skus").delete().in("id", toDelete);
  if (toUpsert.length) await supabase.from("skus").upsert(toUpsert, { onConflict: "id" });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

async function syncRows<T extends { id?: string; _deleted?: boolean; sort_order: number }>(
  table: string, fk: string, entityId: string, rows: T[]
) {
  const toDelete = rows.filter(r => r.id && r._deleted).map(r => r.id!);
  const clean = rows
    .filter(r => !r._deleted)
    .map((r, i) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _deleted, ...rest } = r as T & { _deleted?: boolean };
      return { ...rest, [fk]: entityId, sort_order: i };
    });
  const toUpdate = clean.filter(r => r.id);
  const toInsert = clean.filter(r => !r.id);

  if (toDelete.length) {
    const { error } = await db.from(table).delete().in("id", toDelete);
    if (error) throw error;
  }
  if (toUpdate.length) {
    const { error } = await db.from(table).upsert(toUpdate, { onConflict: "id" });
    if (error) throw error;
  }
  if (toInsert.length) {
    const { error } = await db.from(table).insert(toInsert);
    if (error) throw error;
  }
}
