"use client";

interface ProductOption { id: string; name: string; }

export interface OfferItemRow {
  id?: string;
  product_id: string;
  quantity: number;
  requires_variant_selection: boolean;
  is_anchor: boolean;
  sort_order: number;
  _deleted?: boolean;
}

interface Props {
  items: OfferItemRow[];
  products: ProductOption[];
  onChange: (items: OfferItemRow[]) => void;
}

function empty(sort_order: number): OfferItemRow {
  return { product_id: "", quantity: 1, requires_variant_selection: false, is_anchor: false, sort_order };
}

export default function OfferItemsEditor({ items, products, onChange }: Props) {
  const visible = items.filter(i => !i._deleted);

  const update = (index: number, patch: Partial<OfferItemRow>) => {
    let next = items.map((item, i) => i === index ? { ...item, ...patch } : item);
    if (patch.is_anchor === true) {
      next = next.map((item, i) => i === index ? item : { ...item, is_anchor: false });
    }
    onChange(next);
  };

  const remove = (index: number) => {
    const item = items[index];
    if (item.id) {
      onChange(items.map((it, i) => i === index ? { ...it, _deleted: true } : it));
    } else {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  const anchorCount = visible.filter(i => i.is_anchor).length;

  return (
    <div className="space-y-4">
      {anchorCount !== 1 && visible.length > 0 && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {anchorCount === 0 ? "Kein Ankerprodukt gesetzt. Genau eines ist erforderlich." : "Mehrere Ankerprodukte gesetzt. Nur eines erlaubt."}
        </p>
      )}

      {visible.map((item) => {
        const realIndex = items.indexOf(item);
        return (
          <div key={realIndex} className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Produkt {items.indexOf(item) + 1}</span>
              <button type="button" onClick={() => remove(realIndex)} className="text-xs text-red-500 hover:text-red-700">
                Entfernen
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Produkt *</label>
                <select
                  className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm"
                  value={item.product_id}
                  onChange={e => update(realIndex, { product_id: e.target.value })}
                >
                  <option value="">— Produkt wählen —</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Menge</label>
                <input
                  type="number"
                  min={1}
                  className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm"
                  value={item.quantity}
                  onChange={e => update(realIndex, { quantity: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.is_anchor}
                  onChange={e => update(realIndex, { is_anchor: e.target.checked })}
                  className="rounded"
                />
                <span className="font-medium">Ankerprodukt</span>
                <span className="text-xs text-slate-400">(Artikel-Nr. + Specs)</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.requires_variant_selection}
                  onChange={e => update(realIndex, { requires_variant_selection: e.target.checked })}
                  className="rounded"
                />
                Variantenauswahl
              </label>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => onChange([...items, empty(items.length)])}
        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
      >
        + Produkt hinzufügen
      </button>
    </div>
  );
}
