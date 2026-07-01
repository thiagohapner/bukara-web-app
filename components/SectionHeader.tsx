import { ArrowRight } from "lucide-react";

interface Props {
  title: string;
  viewAllHref?: string;
}

export default function SectionHeader({ title, viewAllHref = "#" }: Props) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h2 className="heading-h2">
        {title}
      </h2>
      <a href={viewAllHref} className="view-all">
        View All
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}
