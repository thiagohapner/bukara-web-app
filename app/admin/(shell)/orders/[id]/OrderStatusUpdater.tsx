"use client";

import { useState } from "react";
import CustomSelect from "@/components/CustomSelect";

const STATUSES = [
  { value: "new", label: "Neu" },
  { value: "confirmed", label: "Bestätigt" },
  { value: "invoiced", label: "Fakturiert" },
  { value: "shipped", label: "Versendet" },
];

export default function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  const update = async (newStatus: string) => {
    setSaving(true);
    await fetch("/api/admin/update-order-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: newStatus }),
    });
    setStatus(newStatus);
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-48">
        <CustomSelect
          value={status}
          onChange={(v) => update(v)}
          options={STATUSES.map((s) => ({ value: s.value, label: s.label }))}
        />
      </div>
      {saving && <span className="text-xs text-slate-400">Speichern...</span>}
    </div>
  );
}
