interface Props {
  title: string;
  viewAllHref?: string;
}

export default function SectionHeader({ title, viewAllHref = "#" }: Props) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
        {title}
      </h2>
      <a href={viewAllHref} className="view-all font-medium">
        View All
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}
