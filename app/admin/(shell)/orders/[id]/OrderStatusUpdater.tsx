"use client";

import { useState } from "react";

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
      <select
        value={status}
        onChange={e => update(e.target.value)}
        disabled={saving}
        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
      >
        {STATUSES.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      {saving && <span className="text-xs text-slate-400">Speichern...</span>}
    </div>
  );
}
