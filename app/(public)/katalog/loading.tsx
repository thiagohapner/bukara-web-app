// Instant skeleton shown on navigation to /katalog while the page renders.
// Mirrors KatalogCatalog's breadcrumb + filter bar + card grid layout.
export default function KatalogLoading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-5 pb-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Home</span>
          <span>/</span>
          <span className="text-slate-700 font-medium">Katalog</span>
        </div>
      </div>

      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10 pb-20">
        {/* Filter bar placeholder (desktop) */}
        <div className="hidden lg:flex gap-2 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-32 rounded-sm bg-slate-100 animate-pulse" />
          ))}
        </div>

        {/* Result count placeholder */}
        <div className="mb-5 h-4 w-28 rounded bg-slate-100 animate-pulse" />

        {/* Card grid skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="aspect-square w-full rounded-lg bg-slate-100 animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
              <div className="h-4 w-1/3 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
