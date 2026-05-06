import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container max-w-2xl py-32 text-center">
      <p className="editorial-eyebrow">404 · Atelier</p>
      <h1 className="mt-4 font-serif text-5xl font-light leading-tight md:text-7xl text-balance">
        This passage is closed.
      </h1>
      <p className="mt-6 text-lg text-charcoal/70">
        Return to the collection, or rest a moment.
      </p>
      <div className="mt-12 flex justify-center gap-3">
        <Button asChild>
          <Link href="/shop">Return to the collection</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
