"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsForm({ settings }: { settings: any }) {
  const [s, setS] = useState({
    brandName: settings.brandName ?? "Valerio Street",
    supportEmail: settings.supportEmail ?? "",
    supportPhone: settings.supportPhone ?? "",
    shippingFlatFee: settings.shippingFlatFee ?? 0,
    freeShippingMin: settings.freeShippingMin ?? 0,
    taxRate: settings.taxRate ?? 0,
    razorpayEnabled: settings.razorpayEnabled ?? true,
    metaTitle: settings.metaTitle ?? "",
    metaDescription: settings.metaDescription ?? "",
  });
  const [pending, start] = useTransition();

  function set<K extends keyof typeof s>(k: K, v: any) {
    setS((p) => ({ ...p, [k]: v }));
  }

  function save() {
    start(async () => {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(s),
      });
      if (!res.ok) toast.error("Could not save");
      else toast.success("Saved");
    });
  }

  return (
    <div className="space-y-8">
      <Section title="House">
        <Field label="Brand name">
          <Input value={s.brandName} onChange={(e) => set("brandName", e.target.value)} className="text-bone" />
        </Field>
        <Field label="Support email">
          <Input value={s.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} className="text-bone" />
        </Field>
        <Field label="Support phone">
          <Input value={s.supportPhone ?? ""} onChange={(e) => set("supportPhone", e.target.value)} className="text-bone" />
        </Field>
      </Section>

      <Section title="Shipping & tax">
        <Field label="Flat shipping (paise)">
          <Input type="number" value={s.shippingFlatFee} onChange={(e) => set("shippingFlatFee", Number(e.target.value))} className="text-bone" />
        </Field>
        <Field label="Free shipping above (paise)">
          <Input type="number" value={s.freeShippingMin} onChange={(e) => set("freeShippingMin", Number(e.target.value))} className="text-bone" />
        </Field>
        <Field label="Tax rate (basis points)">
          <Input type="number" value={s.taxRate} onChange={(e) => set("taxRate", Number(e.target.value))} className="text-bone" />
        </Field>
      </Section>

      <Section title="Payments">
        <label className="flex items-center gap-3 text-sm text-bone">
          <input type="checkbox" checked={s.razorpayEnabled} onChange={(e) => set("razorpayEnabled", e.target.checked)} />
          Enable Razorpay
        </label>
      </Section>

      <Section title="SEO">
        <Field label="Meta title">
          <Input value={s.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} className="text-bone" />
        </Field>
        <Field label="Meta description">
          <Input value={s.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} className="text-bone" />
        </Field>
      </Section>

      <Button onClick={save} disabled={pending} className="bg-bone text-charcoal hover:bg-sand">
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border border-bone/10 p-6">
      <legend className="px-2 text-[10px] uppercase tracking-editorial text-bone/50">{title}</legend>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1 block text-bone/60">{label}</Label>
      {children}
    </div>
  );
}
