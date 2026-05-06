"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      toast.success("Welcome to the house. Watch your inbox.");
      setEmail("");
    } catch {
      toast.error("Could not subscribe. Try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-4 border-b border-charcoal/30 pb-1">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Your email"
        className="h-11 flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none"
        aria-label="Email"
      />
      <Button type="submit" variant="ghost" size="sm" disabled={loading} className="px-2">
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
