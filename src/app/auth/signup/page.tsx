import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create an account" };

export default function SignupPage() {
  return (
    <div>
      <p className="editorial-eyebrow">Atelier</p>
      <h1 className="mt-3 font-serif text-4xl font-light md:text-5xl text-balance">Become a member.</h1>
      <p className="mt-3 text-charcoal/60">
        Receive considered new arrivals and a private invitation to the atelier.
      </p>
      <div className="mt-10">
        <SignupForm />
      </div>
      <p className="mt-10 text-sm text-charcoal/60">
        Already a member?{" "}
        <Link href="/auth/login" className="luxe-link text-charcoal">
          Sign in
        </Link>
      </p>
    </div>
  );
}
