import type { ReactNode } from "react";

// Reusable corner flags for product cards (bottom-left), e.g. "Staffelpreise" /
// "Deal". One flag per assortment group: add a boolean on the card + render
// another <CardFlag> inside the <CardFlagStack> to flag the next group.
export type CardFlagTone = "neutral" | "deal";
type Size = "grid" | "list";

const TONES: Record<CardFlagTone, string> = {
  neutral: "bg-white text-slate-900",
  deal: "bg-[#93F5BC] text-[#006C40]",
};

export default function CardFlag({
  label,
  tone = "neutral",
  size = "grid",
}: {
  label: string;
  tone?: CardFlagTone;
  size?: Size;
}) {
  const sized = size === "list" ? "h-[22px] text-[10px] px-2" : "h-[26px] text-[12px] px-3";
  return (
    <span className={`inline-flex items-center font-bold rounded-sm ${TONES[tone]} ${sized}`}>
      {label}
    </span>
  );
}

// Positions one or more flags as a row in the bottom-left corner so multiple
// flags sit next to each other instead of overlapping.
export function CardFlagStack({ size = "grid", children }: { size?: Size; children: ReactNode }) {
  const pos = size === "list" ? "bottom-2 left-2 gap-1" : "bottom-3 left-3 gap-1.5";
  return <div className={`absolute z-10 flex items-center ${pos}`}>{children}</div>;
}
