"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] as const;

export function OrderStatusForm({
  orderNumber,
  status,
  trackingNumber,
}: {
  orderNumber: string;
  status: string;
  trackingNumber: string | null;
}) {
  const [s, setS] = useState(status);
  const [t, setT] = useState(trackingNumber ?? "");
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const res = await fetch(`/api/admin/orders/${orderNumber}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: s, trackingNumber: t || null }),
      });
      if (!res.ok) toast.error("Could not update");
      else toast.success("Updated");
    });
  }

  return (
    <div className="border border-bone/10 p-6 text-bone">
      <p className="text-[10px] uppercase tracking-editorial text-bone/50">Fulfilment</p>
      <div className="mt-4 space-y-4">
        <div>
          <Label className="mb-1 block text-bone/60">Status</Label>
          <select
            value={s}
            onChange={(e) => setS(e.target.value)}
            className="h-11 w-full border-b border-bone/30 bg-transparent text-sm text-bone focus:outline-none"
          >
            {STATUSES.map((opt) => (
              <option key={opt} value={opt} className="bg-charcoal text-bone">
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="mb-1 block text-bone/60">Tracking number</Label>
          <Input value={t} onChange={(e) => setT(e.target.value)} className="text-bone" />
        </div>
      </div>
      <Button onClick={save} disabled={pending} className="mt-6 w-full bg-bone text-charcoal hover:bg-sand">
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}
