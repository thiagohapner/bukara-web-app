import VariantTable from "@/components/admin/v2/VariantTable";
import StatTiles from "@/components/admin/v2/StatTiles";
import {
  getCatalogStats,
  getCategories,
  getMerchants,
  getSkuOverview,
} from "@/lib/v2/admin/overview";
import type { OverviewParams, SkuSortKey } from "@/lib/v2/admin/types";

export const dynamic = "force-dynamic";

const SORT_KEYS: SkuSortKey[] = [
  "family_name",
  "bukara_article_number",
  "price_eur",
  "stock_quantity",
  "is_active",
];

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function V2VariantsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  const sortRaw = first(sp.sort) as SkuSortKey | undefined;
  const params: OverviewParams = {
    page: Math.max(1, parseInt(first(sp.page) ?? "1", 10) || 1),
    sort: sortRaw && SORT_KEYS.includes(sortRaw) ? sortRaw : "family_name",
    dir: first(sp.dir) === "desc" ? "desc" : "asc",
    search: first(sp.q),
    merchantId: first(sp.merchant),
    categoryId: first(sp.category),
    status:
      first(sp.status) === "active"
        ? "active"
        : first(sp.status) === "inactive"
          ? "inactive"
          : undefined,
    missingPrice: first(sp.missingPrice) === "1",
    missingImage: first(sp.missingImage) === "1",
    unassigned: first(sp.unassigned) === "1",
    incomplete: first(sp.incomplete) === "1",
  };

  const [result, merchants, categories, stats] = await Promise.all([
    getSkuOverview(params),
    getMerchants(),
    getCategories(),
    getCatalogStats(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Variantenkatalog</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {result.total.toLocaleString("de-DE")} Varianten · zuletzt aktualisiert gerade eben
        </p>
      </div>

      <StatTiles stats={stats} />

      <VariantTable
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageCount={result.pageCount}
        pageSize={result.pageSize}
        params={params}
        merchants={merchants}
        categories={categories}
      />
    </div>
  );
}
