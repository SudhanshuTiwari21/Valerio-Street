"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function CMSEditor({
  slot,
  initial,
}: Readonly<{
  slot: string;
  initial: { title: string; body: string };
}>) {
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const res = await fetch(`/api/admin/cms/${slot}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      if (res.ok) toast.success("Saved");
      else toast.error("Could not save");
    });
  }

  return (
    <div className="border border-charcoal/10 p-6">
      <p className="text-[10px] uppercase tracking-editorial text-charcoal/60">{slot.replace("_", " ")}</p>
      <div className="mt-4 space-y-4">
        <div>
          <Label className="mb-1 block text-charcoal/60">Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-charcoal" />
        </div>
        <div>
          <Label className="mb-1 block text-charcoal/60">Body</Label>
          <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} className="text-charcoal" />
        </div>
        <Button onClick={save} disabled={pending} className="w-full bg-bone text-charcoal hover:bg-sand">
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
