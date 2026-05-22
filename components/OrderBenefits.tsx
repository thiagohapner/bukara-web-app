import { Truck, Tag, ShieldCheck } from "lucide-react";

export default function OrderBenefits() {
  return (
    <div className="rounded-2xl overflow-hidden mt-5 mb-6" style={{ backgroundColor: "#F5F5F7" }}>

      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <ShieldCheck className="w-5 h-5 flex-shrink-0" style={{ color: "#00A597" }} />
        <div>
          <p className="text-sm font-semibold text-slate-900">Sicher & bequem bezahlen</p>
          <p className="text-xs text-slate-400 mt-0.5">Zahlung auf Rechnung</p>
        </div>
      </div>

      <div className="h-px bg-slate-200 mx-4" />

      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <Truck className="w-5 h-5 flex-shrink-0" style={{ color: "#00A597" }} />
        <div>
          <p className="text-sm font-semibold text-slate-900">Kostenloser Versand</p>
          <p className="text-xs text-slate-400 mt-0.5">Ab 200 € Bestellwert</p>
        </div>
      </div>

      <div className="h-px bg-slate-200 mx-4" />

      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <Tag className="w-5 h-5 flex-shrink-0" style={{ color: "#00A597" }} />
        <div>
          <p className="text-sm font-semibold text-slate-900">10% Zusatzrabatt</p>
          <p className="text-xs text-slate-400 mt-0.5">Ab 500 € Bestellwert</p>
        </div>
      </div>

    </div>
  );
}
