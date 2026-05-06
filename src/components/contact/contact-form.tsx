"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { contactSchema } from "@/lib/validations";

export function ContactForm() {
  const form = useForm({ resolver: zodResolver(contactSchema), defaultValues: { name: "", email: "", subject: "", message: "" } });
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: { name: string; email: string; subject: string; message: string }) {
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      toast.success("Thank you. We will return your note soon.");
      form.reset();
    } catch {
      toast.error("Could not send. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Name" error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" {...form.register("email")} />
        </Field>
      </div>
      <Field label="Subject" error={form.formState.errors.subject?.message}>
        <Input {...form.register("subject")} />
      </Field>
      <Field label="Your message" error={form.formState.errors.message?.message}>
        <Textarea rows={6} {...form.register("message")} />
      </Field>
      <Button size="lg" disabled={loading}>
        {loading ? "Sending…" : "Send the note"}
      </Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1 block">{label}</Label>
      {children}
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
