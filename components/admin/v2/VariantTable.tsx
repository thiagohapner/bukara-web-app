"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { formatEur } from "@/lib/pricing";
import type {
  OverviewParams,
  SkuOverviewRow,
  SkuSortKey,
} from "@/lib/v2/admin/types";

interface Props {
  rows: SkuOverviewRow[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
  params: OverviewParams;
  merchants: { id: string; name: string }[];
  categories: { id: string; name: string; depth: number }[];
}

// Single source of truth for columns: header label, optional sort key, and the
// cell renderer all live together so header and body can never drift out of
// alignment. `n` is the 1-based row number across the whole result set.
interface Column {
  id: string;
  label: string;
  sort?: SkuSortKey;
  headClass?: string;
  cell: (row: SkuOverviewRow, n: number) => React.ReactNode;
}

const COLUMNS: Column[] = [
  {
    id: "no",
    label: "#",
    headClass: "w-10",
    cell: (_r, n) => <span className="text-slate-400 tabular-nums">{n}</span>,
  },
  {
    id: "thumb",
    label: "",
    headClass: "w-14",
    cell: (r) =>
      r.thumbnail_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={r.thumbnail_url}
          alt=""
          className="w-9 h-9 rounded-lg object-cover border border-slate-200"
        />
      ) : (
        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200" />
      ),
  },
  {
    id: "bukara",
    label: "Bukara-Nr.",
    sort: "bukara_article_number",
    cell: (r) => (
      <>
        <Link
          href={`/admin/v2/variants/${r.sku_id}`}
          className="font-mono text-xs font-medium text-slate-900 hover:text-slate-500"
        >
          {r.bukara_article_number}
        </Link>
        <div className="text-xs text-slate-400 truncate max-w-[220px]">
          {r.family_name ?? "—"}
        </div>
      </>
    ),
  },
  {
    id: "haendler",
    label: "Händler-Nr.",
    cell: (r) => (
      <span className="font-mono text-xs text-slate-500">{r.merchant_sku ?? "—"}</span>
    ),
  },
  {
    id: "preis",
    label: "Preis",
    sort: "price_eur",
    cell: (r) => <PriceCell row={r} />,
  },
  {
    id: "bestand",
    label: "Bestand",
    sort: "stock_quantity",
    cell: (r) => <span className="text-slate-600 tabular-nums">{r.stock_quantity}</span>,
  },
  {
    id: "status",
    label: "Status",
    sort: "is_active",
    cell: (r) => (
      <span className="inline-flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full ${r.is_active ? "bg-green-500" : "bg-red-500"}`}
        />
        <span className={`text-sm ${r.is_active ? "text-green-700" : "text-red-600"}`}>
          {r.is_active ? "Aktiv" : "Inaktiv"}
        </span>
      </span>
    ),
  },
  {
    id: "variante",
    label: "Variante",
    cell: (r) => (
      <span
        className="block text-slate-600 max-w-[240px] truncate"
        title={r.variant_label ?? undefined}
      >
        {r.variant_label ?? "—"}
      </span>
    ),
  },
  {
    id: "edit",
    label: "",
    headClass: "text-right",
    cell: (r) => (
      <div className="text-right">
        <Link
          href={`/admin/v2/variants/${r.sku_id}`}
          className="text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          Bearbeiten
        </Link>
      </div>
    ),
  },
];

/** Build a query string from the current params plus an overriding patch. */
function buildQuery(params: OverviewParams, patch: Partial<OverviewParams>): string {
  const merged = { ...params, ...patch };
  const sp = new URLSearchParams();
  if (merged.search) sp.set("q", merged.search);
  if (merged.merchantId) sp.set("merchant", merged.merchantId);
  if (merged.categoryId) sp.set("category", merged.categoryId);
  if (merged.status) sp.set("status", merged.status);
  if (merged.missingPrice) sp.set("missingPrice", "1");
  if (merged.missingImage) sp.set("missingImage", "1");
  if (merged.unassigned) sp.set("unassigned", "1");
  if (merged.incomplete) sp.set("incomplete", "1");
  if (merged.sort !== "family_name") sp.set("sort", merged.sort);
  if (merged.dir !== "asc") sp.set("dir", merged.dir);
  if (merged.page && merged.page > 1) sp.set("page", String(merged.page));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export default function VariantTable({
  rows,
  total,
  page,
  pageCount,
  pageSize,
  params,
  merchants,
  categories,
}: Props) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(params.search ?? "");

  const push = useCallback(
    (patch: Partial<OverviewParams>) => {
      // Any filter/sort/search change resets to page 1 unless page is patched.
      const next = { page: 1, ...patch };
      router.push(`/admin/v2/variants${buildQuery(params, next)}`);
    },
    [params, router],
  );

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    push({ search: searchValue.trim() || undefined });
  };

  const toggleSort = (key: SkuSortKey) => {
    const dir = params.sort === key && params.dir === "asc" ? "desc" : "asc";
    push({ sort: key, dir });
  };

  const selectCls =
    "border border-slate-200 rounded-lg px-2.5 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400";
  const chipCls = (on: boolean) =>
    `px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
      on
        ? "bg-slate-900 border-slate-900 text-white"
        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
    }`;

  const startIndex = (page - 1) * pageSize;

  return (
    <div>
      {/* Control bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <form onSubmit={onSearchSubmit} className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Artikelnummer suchen…"
            className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
          />
        </form>

        <select
          value={params.merchantId ?? ""}
          onChange={(e) => push({ merchantId: e.target.value || undefined })}
          className={selectCls}
        >
          <option value="">Alle Händler</option>
          {merchants.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          value={params.categoryId ?? ""}
          onChange={(e) => push({ categoryId: e.target.value || undefined })}
          className={selectCls}
        >
          <option value="">Alle Kategorien</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.depth > 0 ? `  – ${c.name}` : c.name}
            </option>
          ))}
        </select>

        <select
          value={params.status ?? ""}
          onChange={(e) =>
            push({ status: (e.target.value || undefined) as OverviewParams["status"] })
          }
          className={selectCls}
        >
          <option value="">Alle Status</option>
          <option value="active">Aktiv</option>
          <option value="inactive">Inaktiv</option>
        </select>

        <button
          type="button"
          onClick={() => push({ missingPrice: !params.missingPrice || undefined })}
          className={chipCls(!!params.missingPrice)}
        >
          ohne Preis
        </button>
        <button
          type="button"
          onClick={() => push({ missingImage: !params.missingImage || undefined })}
          className={chipCls(!!params.missingImage)}
        >
          ohne Bild
        </button>
        <button
          type="button"
          onClick={() => push({ unassigned: !params.unassigned || undefined })}
          className={chipCls(!!params.unassigned)}
        >
          nicht zugeordnet
        </button>
        {params.incomplete && (
          <button
            type="button"
            onClick={() => push({ incomplete: undefined })}
            className={chipCls(true)}
          >
            unvollständig ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              {COLUMNS.map((col) => {
                const active = col.sort && params.sort === col.sort;
                return (
                  <th
                    key={col.id}
                    className={`px-4 py-3 font-medium text-slate-500 text-xs ${col.headClass ?? ""}`}
                  >
                    {col.sort ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.sort!)}
                        className="inline-flex items-center gap-1 hover:text-slate-800"
                      >
                        {col.label}
                        {active ? (
                          params.dir === "asc" ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-800" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-800" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.sku_id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                {COLUMNS.map((col) => (
                  <td key={col.id} className="px-4 py-3 align-middle">
                    {col.cell(r, startIndex + i + 1)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="text-center text-slate-400 py-12 text-sm">
            Keine Varianten gefunden. Filter anpassen oder Suche zurücksetzen.
          </p>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
        <span>
          {total === 0
            ? "0 Varianten"
            : `${(startIndex + 1).toLocaleString("de-DE")}–${Math.min(
                page * pageSize,
                total,
              ).toLocaleString("de-DE")} von ${total.toLocaleString("de-DE")}`}
        </span>
        <div className="flex items-center gap-2">
          <Link
            aria-disabled={page <= 1}
            href={`/admin/v2/variants${buildQuery(params, { page: page - 1 })}`}
            className={`px-3 py-1.5 rounded-lg border text-sm ${
              page <= 1
                ? "border-slate-100 text-slate-300 pointer-events-none"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Zurück
          </Link>
          <span className="text-slate-400">
            Seite {page} / {pageCount}
          </span>
          <Link
            aria-disabled={page >= pageCount}
            href={`/admin/v2/variants${buildQuery(params, { page: page + 1 })}`}
            className={`px-3 py-1.5 rounded-lg border text-sm ${
              page >= pageCount
                ? "border-slate-100 text-slate-300 pointer-events-none"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Weiter
          </Link>
        </div>
      </div>
    </div>
  );
}

function PriceCell({ row }: { row: SkuOverviewRow }) {
  if (row.price_eur == null) {
    return <span className="text-slate-400">—</span>;
  }
  const hasCampaign = row.campaign_price != null && row.campaign_price < row.price_eur;
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      {hasCampaign ? (
        <>
          <span className="text-slate-400 line-through">{formatEur(row.price_eur)}</span>
          <span className="text-slate-900 font-medium">{formatEur(row.campaign_price as number)}</span>
        </>
      ) : (
        <span className="text-slate-900">{formatEur(row.price_eur)}</span>
      )}
      {row.has_staffelpreis && (
        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
          Staffel
        </span>
      )}
    </span>
  );
}
