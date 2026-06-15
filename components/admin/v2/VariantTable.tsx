"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  categories: { id: string; name: string }[];
}

const COLUMNS: { key: SkuSortKey; label: string }[] = [
  { key: "family_name", label: "Produktfamilie" },
  { key: "bukara_article_number", label: "Bukara-Nr." },
  { key: "price_eur", label: "Preis" },
  { key: "stock_quantity", label: "Bestand" },
  { key: "is_active", label: "Status" },
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
    "border border-slate-200 rounded-sm px-2.5 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500";
  const chipCls = (on: boolean) =>
    `px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
      on
        ? "bg-teal-50 border-teal-200 text-teal-700"
        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
    }`;

  return (
    <div>
      {/* Control bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <form onSubmit={onSearchSubmit} className="flex-1 min-w-[240px]">
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Artikelnummer suchen…"
            className="w-full border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-800 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              {c.name}
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left bg-slate-50/60">
              <th className="px-4 py-2.5 w-14 font-medium text-slate-500"></th>
              {COLUMNS.map((col) => {
                const active = params.sort === col.key;
                return (
                  <th key={col.key} className="px-4 py-2.5 font-medium text-slate-500">
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-slate-700"
                    >
                      {col.label}
                      <span className={active ? "text-teal-600" : "text-slate-300"}>
                        {active ? (params.dir === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    </button>
                  </th>
                );
              })}
              <th className="px-4 py-2.5 font-medium text-slate-500">Händler-Nr.</th>
              <th className="px-4 py-2.5 font-medium text-slate-500">Variante</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sku_id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-2.5">
                  {r.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.thumbnail_url}
                      alt=""
                      className="w-10 h-10 rounded-md object-cover border border-slate-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-100" />
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <Link
                    href={`/admin/v2/variants/${r.sku_id}`}
                    className="font-mono text-xs text-slate-800 hover:text-teal-700"
                  >
                    {r.bukara_article_number}
                  </Link>
                  <div className="text-xs text-slate-400 truncate max-w-[200px]">
                    {r.family_name ?? "—"}
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <PriceCell row={r} />
                </td>
                <td className="px-4 py-2.5 text-slate-600">{r.stock_quantity}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      r.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {r.is_active ? "Aktiv" : "Inaktiv"}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-slate-500">
                  {r.merchant_sku ?? "—"}
                </td>
                <td
                  className="px-4 py-2.5 text-slate-600 max-w-[220px] truncate"
                  title={r.variant_label ?? undefined}
                >
                  {r.variant_label ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Link
                    href={`/admin/v2/variants/${r.sku_id}`}
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                  >
                    Bearbeiten
                  </Link>
                </td>
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
            : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} von ${total}`}
        </span>
        <div className="flex items-center gap-2">
          <Link
            aria-disabled={page <= 1}
            href={`/admin/v2/variants${buildQuery(params, { page: page - 1 })}`}
            className={`px-3 py-1.5 rounded-md border text-sm ${
              page <= 1
                ? "border-slate-100 text-slate-300 pointer-events-none"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
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
            className={`px-3 py-1.5 rounded-md border text-sm ${
              page >= pageCount
                ? "border-slate-100 text-slate-300 pointer-events-none"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
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
          <span className="text-teal-700 font-medium">{formatEur(row.campaign_price as number)}</span>
        </>
      ) : (
        <span className="text-slate-700">{formatEur(row.price_eur)}</span>
      )}
      {row.has_staffelpreis && (
        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-medium">
          Staffel
        </span>
      )}
    </span>
  );
}
