"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
import OfferItemsEditor, { type OfferItemRow } from "@/components/admin/OfferItemsEditor";
import ImageUploadManager from "@/components/admin/ImageUploadManager";

interface DealDetails {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  gallery_bg: string;
  gallery_label: string;
  campaign_discount_percent: number;
  is_active: boolean;
  sort_order: number;
}

interface ProductOption { id: string; name: string; }
interface ImageRow { id: string; image_url: string; sort_order: number; }

const TABS = ["Details", "Produkte", "Bilder"] as const;
type Tab = typeof TABS[number];

const EMPTY: DealDetails = {
  id: "", slug: "", title: "", subtitle: "", gallery_bg: "#e6eff5", gallery_label: "",
  campaign_discount_percent: 30, is_active: true, sort_order: 0,
};

export default function DealEditClient({ dealId }: { dealId: string | null }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Details");
  const [deal, setDeal] = useState<DealDetails>(EMPTY);
  const [items, setItems] = useState<OfferItemRow[]>([]);
  const [images, setImages] = useState<ImageRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data: prods } = await supabase.from("products").select("id, name").order("name");
    setProducts((prods ?? []) as ProductOption[]);

    if (!dealId) return;

    const [dealRes, itemsRes, imgRes] = await Promise.all([
      supabase.from("offers").select("*").eq("id", dealId).single(),
      supabase.from("offer_items").select("*").eq("offer_id", dealId).order("sort_order"),
      supabase.from("offer_images").select("*").eq("offer_id", dealId).order("sort_order"),
    ]);
    if (dealRes.data) setDeal(dealRes.data as DealDetails);
    setItems((itemsRes.data ?? []) as OfferItemRow[]);
    setImages((imgRes.data ?? []) as ImageRow[]);
  }, [dealId]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const anchor = items.filter(i => !i._deleted && i.is_anchor);
    if (items.filter(i => !i._deleted).length > 0 && anchor.length !== 1) {
      setError("Genau ein Ankerprodukt ist erforderlich.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let id = dealId;

      const payload = {
        slug: deal.slug, title: deal.title, subtitle: deal.subtitle || null,
        gallery_bg: deal.gallery_bg, gallery_label: deal.gallery_label || null,
        campaign_discount_percent: deal.campaign_discount_percent,
        is_active: deal.is_active, sort_order: deal.sort_order,
      };

      if (!id) {
        const { data, error: e } = await supabase.from("offers").insert(payload).select("id").single();
        if (e) throw e;
        id = data!.id;
      } else {
        const { error: e } = await supabase.from("offers").update(payload).eq("id", id);
        if (e) throw e;
      }

      await syncItems(id!, items);

      if (!dealId) {
        router.push(`/admin/deals/${id}`);
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
          <a href="/admin/deals" className="text-sm text-slate-400 hover:text-slate-600">← Angebote</a>
          <h1 className="text-2xl font-semibold text-slate-800 mt-1">
            {dealId ? deal.title || "Angebot bearbeiten" : "Neues Angebot"}
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
            <Row label="Titel *"><input className={inp} value={deal.title} onChange={e => setDeal(d => ({ ...d, title: e.target.value }))} /></Row>
            <Row label="Slug *"><input className={inp} value={deal.slug} onChange={e => setDeal(d => ({ ...d, slug: e.target.value }))} /></Row>
            <Row label="Untertitel"><input className={inp} value={deal.subtitle} onChange={e => setDeal(d => ({ ...d, subtitle: e.target.value }))} /></Row>
            <Row label="Rabatt % (Badge)"><input type="number" className={inp} value={deal.campaign_discount_percent} onChange={e => setDeal(d => ({ ...d, campaign_discount_percent: Number(e.target.value) }))} /></Row>
            <Row label="Galerie-Hintergrundfarbe"><input type="color" value={deal.gallery_bg} onChange={e => setDeal(d => ({ ...d, gallery_bg: e.target.value }))} className="h-9 w-20 rounded border border-slate-200 cursor-pointer" /></Row>
            <Row label="Galerie-Label"><input className={inp} value={deal.gallery_label} onChange={e => setDeal(d => ({ ...d, gallery_label: e.target.value }))} /></Row>
            <Row label="Sortierung"><input type="number" className={inp} value={deal.sort_order} onChange={e => setDeal(d => ({ ...d, sort_order: Number(e.target.value) }))} /></Row>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={deal.is_active} onChange={e => setDeal(d => ({ ...d, is_active: e.target.checked }))} className="rounded" />
              Aktiv
            </label>
          </div>
        )}
        {tab === "Produkte" && (
          <OfferItemsEditor items={items} products={products} onChange={setItems} />
        )}
        {tab === "Bilder" && dealId && (
          <ImageUploadManager entityType="offer" entityId={dealId} images={images} onChange={setImages} />
        )}
        {tab === "Bilder" && !dealId && (
          <p className="text-sm text-slate-500">Speichern Sie das Angebot zuerst, um Bilder hochzuladen.</p>
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

async function syncItems(offerId: string, items: OfferItemRow[]) {
  const toDelete = items.filter(i => i.id && i._deleted).map(i => i.id!);
  const toUpsert = items
    .filter(i => !i._deleted && i.product_id)
    .map((item, idx) => ({
      ...(item.id ? { id: item.id } : {}),
      offer_id: offerId,
      product_id: item.product_id,
      quantity: item.quantity,
      requires_variant_selection: item.requires_variant_selection,
      is_anchor: item.is_anchor,
      sort_order: idx,
    }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  if (toDelete.length) await db.from("offer_items").delete().in("id", toDelete);
  if (toUpsert.length) await db.from("offer_items").upsert(toUpsert, { onConflict: "id" });
}
