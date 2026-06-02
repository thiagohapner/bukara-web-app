"use client";

interface ProductOption { id: string; name: string; }

export interface AccessoryRow {
  id?: string;
  accessory_product_id: string;
  sort_order: number;
  _deleted?: boolean;
}

interface Props {
  accessories: AccessoryRow[];
  products: ProductOption[];
  currentProductId: string;
  onChange: (rows: AccessoryRow[]) => void;
}

export default function AccessoriesEditor({ accessories, products, currentProductId, onChange }: Props) {
  const visible = accessories.filter(a => !a._deleted);

  const available = products.filter(p => p.id !== currentProductId);

  function add() {
    onChange([...accessories, { accessory_product_id: "", sort_order: accessories.length }]);
  }

  function update(index: number, productId: string) {
    onChange(accessories.map((a, i) => i === index ? { ...a, accessory_product_id: productId } : a));
  }

  function remove(index: number) {
    const row = accessories[index];
    if (row.id) {
      onChange(accessories.map((a, i) => i === index ? { ...a, _deleted: true } : a));
    } else {
      onChange(accessories.filter((_, i) => i !== index));
    }
  }

  return (
    <div className="space-y-3 max-w-lg">
      <p className="text-sm text-slate-500">
        Produkte die auf der PDP unter "Passend dazu" angezeigt werden.
      </p>

      {visible.map((row) => {
        const realIndex = accessories.indexOf(row);
        return (
          <div key={realIndex} className="flex gap-2 items-center">
            <select
              className="flex-1 border border-slate-200 rounded-sm px-2 py-1.5 text-sm"
              value={row.accessory_product_id}
              onChange={e => update(realIndex, e.target.value)}
            >
              <option value="">— Produkt wählen —</option>
              {available.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => remove(realIndex)}
              className="text-red-400 hover:text-red-600 text-sm"
            >
              ✕
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
      >
        + Zubehör hinzufügen
      </button>
    </div>
  );
}
