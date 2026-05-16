import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function AnnouncementBar() {
  return (
    <div
      className="py-2.5 text-center text-[13px] font-medium"
      style={{ backgroundColor: "#F5F5F7", color: "#2d4a47" }}
    >
      Nutzen Sie unseren Schärfservice · Deutschlandweite Abholung · Faire Preise · Fertig in 1–2 Wochen.{" "}
      <a href="/loesungen/schaerfservice" style={{ color: "#044749" }} className="inline-flex items-center gap-0.5 font-semibold underline-offset-2 hover:underline">
        Jetzt anfragen
        <ArrowRightIcon className="w-3 h-3" strokeWidth={2.5} />
      </a>
    </div>
  );
}
