import { ArrowRight } from "lucide-react";

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
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}
