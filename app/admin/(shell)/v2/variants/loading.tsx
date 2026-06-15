export default function Loading() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-7 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-52 bg-slate-100 rounded mt-2 animate-pulse" />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="h-9 flex-1 min-w-[240px] bg-slate-100 rounded-sm animate-pulse" />
        <div className="h-9 w-32 bg-slate-100 rounded-sm animate-pulse" />
        <div className="h-9 w-32 bg-slate-100 rounded-sm animate-pulse" />
        <div className="h-9 w-28 bg-slate-100 rounded-sm animate-pulse" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="h-10 bg-slate-50/60 border-b border-slate-100" />
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-2.5 border-b border-slate-50"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-md animate-pulse" />
            <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-24 bg-slate-100 rounded animate-pulse ml-auto" />
            <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
            <div className="h-5 w-14 bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
