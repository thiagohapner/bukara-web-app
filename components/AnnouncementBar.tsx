import { ArrowRight } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div
      className="py-2.5 text-center text-[13px] font-medium"
      style={{ backgroundColor: "#F5F5F7", color: "var(--color-neutral-700)" }}
    >
      Nutzen Sie unseren Schärfservice · Deutschlandweite Abholung · Faire Preise · Fertig in 1–2 Wochen.{" "}
      <a href="/loesungen/schaerfservice" style={{ color: "var(--color-brand-800)" }} className="inline-flex items-center gap-0.5 font-semibold underline-offset-2 hover:underline">
        Jetzt anfragen
        <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
      </a>
    </div>
  );
}
