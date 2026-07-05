import { Check } from "lucide-react";

// Vertical phase stepper for the multi-step request forms (Schärfservice /
// Sonderwerkzeug). Mirrors the Stripe-onboarding reference: a column of dots
// joined by a thin connector, each in one of three states.
//   i <  activeIndex → done     (brand-filled dot + check)
//   i === activeIndex → active  (brand ring dot, brand label)
//   i >  activeIndex → upcoming (neutral dot + number, muted label)
export default function FormStepNav({
  phases,
  activeIndex,
}: {
  phases: string[];
  activeIndex: number;
}) {
  return (
    <ol className="flex flex-col">
      {phases.map((label, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        const last = i === phases.length - 1;
        return (
          <li key={label} className="flex gap-3">
            {/* Dot + connector column */}
            <div className="flex flex-col items-center">
              <span
                className={[
                  "w-6 h-6 flex-shrink-0 rounded-pill flex items-center justify-center text-[11px] font-medium transition-colors duration-[240ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)]",
                  done || active
                    ? "border-2 border-brand-500 text-brand-600 bg-white"
                    : "border border-neutral-200 text-neutral-400 bg-white",
                ].join(" ")}
              >
                {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
              </span>
              {!last && (
                <span
                  className={`w-px flex-1 min-h-[1.25rem] my-1 ${done ? "bg-brand-500" : "bg-neutral-200"}`}
                  aria-hidden
                />
              )}
            </div>
            {/* Label */}
            <span
              className={[
                "text-sm leading-6 pb-4",
                active
                  ? "text-brand-600 font-medium"
                  : done
                    ? "text-slate-900"
                    : "text-neutral-400",
              ].join(" ")}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
