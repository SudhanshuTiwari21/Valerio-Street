"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
      router.push(`/auth/reset?email=${encodeURIComponent(email)}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="editorial-eyebrow">Atelier</p>
      <h1 className="mt-3 font-serif text-4xl font-light md:text-5xl text-balance">
        A quiet reset.
      </h1>
      {sent ? (
        <p className="mt-6 text-charcoal/70">
          If an account exists for that email, a reset code is on its way.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-10 space-y-5">
          <div>
            <Label className="mb-1 block">Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button size="lg" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send reset code"}
          </Button>
        </form>
      )}
      <p className="mt-10 text-sm text-charcoal/60">
        <Link href="/auth/login" className="luxe-link text-charcoal">Return to sign in</Link>
      </p>
    </div>
  );
}
