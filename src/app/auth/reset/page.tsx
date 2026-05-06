"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const email = sp.get("email") ?? "";
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });
      if (!res.ok) throw new Error("Reset failed");
      toast.success("Password reset. Please sign in.");
      router.push("/auth/login");
    } catch {
      toast.error("This link is invalid or expired");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="editorial-eyebrow">Atelier</p>
      <h1 className="mt-3 font-serif text-4xl font-light md:text-5xl text-balance">
        New password.
      </h1>
      <form onSubmit={submit} className="mt-10 space-y-5">
        <div>
          <Label className="mb-1 block">Email</Label>
          <Input type="email" required value={email} readOnly />
        </div>
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
        <div>
          <Label className="mb-1 block">New password</Label>
          <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button size="lg" className="w-full" disabled={loading || !email || code.length !== 6}>
          {loading ? "Saving…" : "Set password"}
        </Button>
      </form>
    </div>
  );
}
