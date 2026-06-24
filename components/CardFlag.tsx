// Reusable corner flag for product cards (bottom-left), e.g. "Staffelpreise".
// One flag per assortment group: add a new boolean on the card + render another
// <CardFlag label="…" /> to flag the next group.
export default function CardFlag({
  label,
  size = "grid",
}: {
  label: string;
  size?: "grid" | "list";
}) {
  const base =
    "absolute z-10 bg-white text-slate-900 font-semibold rounded-sm shadow-sm ring-1 ring-black/5";
  const sized =
    size === "list"
      ? "bottom-2 left-2 text-[10px] px-2 py-1"
      : "bottom-3 left-3 text-[12px] px-3 py-1.5";
  return <span className={`${base} ${sized}`}>{label}</span>;
}
