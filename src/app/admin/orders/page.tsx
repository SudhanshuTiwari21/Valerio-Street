import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const orders = await prisma.order.findMany({
    where: sp.status ? { status: sp.status as any } : undefined,
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const STATUSES = ["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  return (
    <div>
      <div>
        <p className="text-[10px] uppercase tracking-editorial text-bone/50">Orders</p>
        <h2 className="mt-2 font-serif text-4xl font-light">All orders.</h2>
      </div>
      <div className="mt-6 flex gap-4 overflow-x-auto border-b border-bone/10 pb-4 text-[11px] uppercase tracking-editorial">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={s === "ALL" ? "/admin/orders" : `/admin/orders?status=${s}`}
            className={`pb-2 ${
              (sp.status ?? "ALL") === s ? "border-b border-gold text-bone" : "text-bone/50 hover:text-bone"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto border border-bone/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-editorial text-bone/50">
              <th className="px-6 py-3">Order</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Items</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Payment</th>
              <th className="px-6 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-bone/10 hover:bg-bone/5">
                <td className="px-6 py-4">
                  <Link href={`/admin/orders/${o.orderNumber}`} className="font-serif text-base">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-6 py-4 text-bone/80">{o.email}</td>
                <td className="px-6 py-4 text-bone/60">{o.items.length}</td>
                <td className="px-6 py-4 text-[11px] uppercase tracking-editorial text-bone/70">{o.status}</td>
                <td className="px-6 py-4 text-[11px] uppercase tracking-editorial text-bone/70">{o.paymentStatus}</td>
                <td className="px-6 py-4 text-right font-serif">{formatINR(o.total)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-bone/50">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
