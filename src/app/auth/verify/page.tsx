"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VerifyPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const email = sp.get("email") ?? "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function verify(e: React.SyntheticEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, type: "SIGNUP", code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Could not verify");
      toast.success("Email verified. Please sign in.");
      router.push(`/auth/login?email=${encodeURIComponent(email)}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setResending(true);
    try {
      const res = await fetch("/api/auth/otp/resend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, type: "SIGNUP" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Could not resend");
      toast.success("A new code has been sent");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <div>
      <p className="editorial-eyebrow">Atelier</p>
      <h1 className="mt-3 font-serif text-4xl font-light md:text-5xl text-balance">Verify email.</h1>
      <p className="mt-6 text-charcoal/70 text-sm leading-relaxed">
        We sent a 6-digit code to <span className="font-medium text-charcoal">{email || "your email"}</span>.
      </p>

      <form onSubmit={verify} className="mt-10 space-y-5">
        <div>
          <Label className="mb-1 block">6-digit code</Label>
          <Input
            inputMode="numeric"
            pattern="\\d{6}"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replaceAll(String.raw`\D`, "").slice(0, 6))}
          />
        </div>
        <Button size="lg" className="w-full" disabled={loading || !email || code.length !== 6}>
          {loading ? "Verifying…" : "Verify"}
        </Button>
        <Button type="button" variant="outline" className="w-full" disabled={resending || !email} onClick={resend}>
          {resending ? "Sending…" : "Resend code"}
        </Button>
      </form>
    </div>
  );
}

