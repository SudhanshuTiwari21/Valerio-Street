import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Failed() {
  return (
    <div className="container max-w-2xl py-32 text-center">
      <p className="editorial-eyebrow text-destructive">Not completed</p>
      <h1 className="mt-4 font-serif text-5xl font-light leading-tight md:text-7xl text-balance">
        A small pause.
      </h1>
      <p className="mt-6 text-lg text-charcoal/70">
        Your payment was not completed. Your atelier has been preserved.
      </p>
      <div className="mt-12 flex justify-center gap-3">
        <Button asChild>
          <Link href="/checkout">Return to checkout</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/shop">Continue browsing</Link>
        </Button>
      </div>
    </div>
  );
}
