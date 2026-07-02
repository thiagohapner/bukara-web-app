import { ChevronRight, ArrowRight } from "lucide-react";

// Trailing icon for link CTAs: a chevron by default that cross-fades into an
// arrow on hover (Stripe-style). Both glyphs are lucide icons so they share
// one stroke design language and the same rendered size. Drop this as the last
// child of a button carrying the `.btn-arrow` class (which drives the hover
// swap — see app/globals.css). Decorative only.
export default function CtaArrow() {
  return (
    <span className="cta-arrow" aria-hidden>
      <ChevronRight className="cta-arrow__chev" strokeWidth={3} />
      <ArrowRight className="cta-arrow__arr" strokeWidth={2.5} />
    </span>
  );
}
