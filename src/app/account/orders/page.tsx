import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { userId: null, email: (session.user.email ?? "").toLowerCase() },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h2 className="font-serif text-2xl font-light">Order history</h2>
      {orders.length === 0 ? (
        <p className="mt-6 text-charcoal/60">No orders yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-charcoal/10 border-y border-charcoal/10">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/account/orders/${o.orderNumber}`} className="grid grid-cols-2 gap-4 py-6 sm:grid-cols-5">
                <div className="col-span-2">
                  <p className="font-serif text-lg">{o.orderNumber}</p>
                  <p className="text-[11px] uppercase tracking-editorial text-charcoal/50">
                    {o.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <p className="text-sm text-charcoal/70">{o.items.length} pieces</p>
                <p className="text-[11px] uppercase tracking-editorial text-charcoal/60">{o.status}</p>
                <p className="text-right font-serif text-lg">{formatINR(o.total)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
