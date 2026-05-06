"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container max-w-2xl py-32 text-center">
      <p className="editorial-eyebrow text-destructive">A small interruption</p>
      <h1 className="mt-4 font-serif text-5xl font-light md:text-6xl text-balance">
        Something went quietly wrong.
      </h1>
      <p className="mt-6 text-charcoal/70">{error.message ?? "Unexpected error"}</p>
      <Button onClick={reset} className="mt-10">Try again</Button>
    </div>
  );
}
