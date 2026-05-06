"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/validations";

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") ?? "/account";
  const [loading, setLoading] = useState(false);
  const form = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values: { email: string; password: string }) {
    setLoading(true);
    const res = await signIn("credentials", { ...values, redirect: false });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid credentials");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label className="mb-1 block">Email</Label>
          <Input type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="mt-1 text-[11px] text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label className="mb-1 block">Password</Label>
            <Link href="/auth/forgot" className="text-[10px] uppercase tracking-editorial text-charcoal/60">
              Forgot?
            </Link>
          </div>
          <Input type="password" autoComplete="current-password" {...form.register("password")} />
          {form.formState.errors.password && (
            <p className="mt-1 text-[11px] text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
