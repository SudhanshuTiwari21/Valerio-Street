import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Success({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="container max-w-2xl py-32 text-center">
      <p className="editorial-eyebrow">Confirmed</p>
      <h1 className="mt-4 font-serif text-5xl font-light leading-tight md:text-7xl text-balance">
        Thank you.
      </h1>
      <p className="mt-6 text-lg text-charcoal/70">
        Your atelier has received the order. A discreet confirmation has been sent to your inbox.
      </p>
      {sp?.order && (
        <p className="mt-3 text-[11px] uppercase tracking-editorial text-charcoal/50">
          Order · {sp.order}
        </p>
      )}
      <div className="mt-12 flex justify-center gap-3">
        <Button asChild>
          <Link href="/account/orders">View orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/shop">Continue browsing</Link>
        </Button>
      </div>
    </div>
  );
}
