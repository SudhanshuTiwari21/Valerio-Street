import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div>
      <p className="editorial-eyebrow">Atelier</p>
      <h1 className="mt-3 font-serif text-4xl font-light md:text-5xl text-balance">Welcome back.</h1>
      <p className="mt-3 text-charcoal/60">
        Sign in to your private atelier.
      </p>
      <div className="mt-10">
        <LoginForm />
      </div>
      <p className="mt-10 text-sm text-charcoal/60">
        New here?{" "}
        <Link href="/auth/signup" className="luxe-link text-charcoal">
          Create an account
        </Link>
      </p>
    </div>
  );
}
