import Link from "next/link";
import { Boxes, Layers, Tag, AlertTriangle } from "lucide-react";
import { formatEur } from "@/lib/pricing";
import type { CatalogStats } from "@/lib/v2/admin/types";

/**
 * Headline KPI tiles for the variants dashboard. Neutral cards matching the
 * reference; values are real catalog metrics (no fabricated trends).
 */
export default function StatTiles({ stats }: { stats: CatalogStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <Tile
        icon={<Boxes className="w-4 h-4" />}
        title="Varianten"
        sublabel="im v2-Katalog"
        value={stats.skus.toLocaleString("de-DE")}
      />
      <Tile
        icon={<Layers className="w-4 h-4" />}
        title="Produktfamilien"
        sublabel="gruppierte Artikel"
        value={stats.products.toLocaleString("de-DE")}
      />
      <Tile
        icon={<Tag className="w-4 h-4" />}
        title="Ø Preis"
        sublabel="Durchschnitt (Liste)"
        value={stats.avgPrice != null ? formatEur(stats.avgPrice) : "—"}
      />
      <Tile
        icon={<AlertTriangle className="w-4 h-4" />}
        title="Unvollständig"
        sublabel="ohne Bild, Preis oder Händler-Nr."
        value={stats.incomplete.toLocaleString("de-DE")}
        href="/admin/v2/variants?incomplete=1"
        chip={
          stats.incomplete > 0
            ? { label: "Handlungsbedarf", tone: "amber" }
            : { label: "vollständig", tone: "green" }
        }
      />
    </div>
  );
}

function Tile({
  icon,
  title,
  sublabel,
  value,
  href,
  chip,
}: {
  icon: React.ReactNode;
  title: string;
  sublabel: string;
  value: string;
  href?: string;
  chip?: { label: string; tone: "amber" | "green" };
}) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-slate-400">{icon}</span>
          <span className="text-sm font-medium text-slate-700">{title}</span>
        </div>
        {chip && (
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
              chip.tone === "amber"
                ? "bg-amber-50 text-amber-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {chip.label}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-3">{sublabel}</p>
      <p className="text-3xl font-semibold text-slate-900 mt-1 tracking-tight">{value}</p>
    </>
  );

  const cls =
    "block bg-white rounded-xl border border-slate-200 p-5 transition-shadow";
  return href ? (
    <Link href={href} className={`${cls} hover:shadow-sm`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
