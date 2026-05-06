import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";

export default async function AccountOverview() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [orderCount, wishlistCount, addressCount, lastOrder] = await Promise.all([
    prisma.order.count({ where: { userId: session.user.id } }),
    prisma.wishlistItem.count({ where: { userId: session.user.id } }),
    prisma.address.count({ where: { userId: session.user.id } }),
    prisma.order.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
  ]);

  return (
    <div className="space-y-12">
      <div className="grid gap-6 sm:grid-cols-3">
        <Stat label="Orders" value={orderCount} href="/account/orders" />
        <Stat label="Wishlist" value={wishlistCount} href="/account/wishlist" />
        <Stat label="Addresses" value={addressCount} href="/account/addresses" />
      </div>

      <section>
        <h2 className="font-serif text-2xl font-light">Last order</h2>
        {lastOrder ? (
          <div className="mt-6 border border-charcoal/10 p-6">
            <div className="flex items-baseline justify-between">
              <p className="font-serif text-xl">{lastOrder.orderNumber}</p>
              <p className="text-[11px] uppercase tracking-editorial text-charcoal/60">{lastOrder.status}</p>
            </div>
            <p className="mt-2 text-sm text-charcoal/60">
              {lastOrder.items.length} pieces · {formatINR(lastOrder.total)}
            </p>
            <Link href={`/account/orders/${lastOrder.orderNumber}`} className="luxe-link mt-4 inline-block text-[11px] uppercase tracking-editorial">
              View order
            </Link>
          </div>
        ) : (
          <p className="mt-4 text-charcoal/60">No orders yet.</p>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="block border border-charcoal/10 p-6 transition-colors hover:bg-sand/30">
      <p className="editorial-eyebrow">{label}</p>
      <p className="mt-3 font-serif text-4xl font-light">{value}</p>
    </Link>
  );
}
