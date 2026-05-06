import { prisma } from "@/lib/prisma";
import { formatINR, formatNumber } from "@/lib/utils";
import { RevenueChart } from "@/components/admin/revenue-chart";

async function getMetrics() {
  const since = new Date(Date.now() - 30 * 86400_000);
  const [orders, paidOrders, customers, products, recent, topProducts, dailyRevenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({ where: { paymentStatus: "PAID" }, select: { total: true, createdAt: true } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { items: true } }),
    prisma.orderItem.groupBy({
      by: ["productId", "name"],
      _sum: { quantity: true, unitPrice: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({
      where: { paymentStatus: "PAID", createdAt: { gte: since } },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const revenue = paidOrders.reduce((s, o) => s + o.total, 0);
  const aov = paidOrders.length ? revenue / paidOrders.length : 0;

  const dailyMap = new Map<string, number>();
  for (const o of dailyRevenue) {
    const k = o.createdAt.toISOString().slice(0, 10);
    dailyMap.set(k, (dailyMap.get(k) ?? 0) + o.total);
  }
  const series = Array.from(dailyMap.entries())
    .sort()
    .map(([date, total]) => ({ date, total: total / 100 }));

  return { orders, revenue, customers, products, aov, recent, topProducts, series };
}

export default async function AdminHome() {
  const m = await getMetrics();
  return (
    <div className="space-y-10">
      <div>
        <p className="text-[10px] uppercase tracking-editorial text-bone/50">Overview</p>
        <h2 className="mt-2 font-serif text-4xl font-light">House at a glance.</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI label="Revenue" value={formatINR(m.revenue)} />
        <KPI label="Orders" value={formatNumber(m.orders)} />
        <KPI label="Customers" value={formatNumber(m.customers)} />
        <KPI label="Avg. order value" value={formatINR(Math.round(m.aov))} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="border border-bone/10 p-6 lg:col-span-2">
          <p className="text-[10px] uppercase tracking-editorial text-bone/50">Revenue · Last 30 days</p>
          <RevenueChart data={m.series} />
        </div>
        <div className="border border-bone/10 p-6">
          <p className="text-[10px] uppercase tracking-editorial text-bone/50">Top pieces</p>
          <ul className="mt-4 space-y-3">
            {m.topProducts.length === 0 && (
              <li className="text-sm text-bone/50">Once orders begin, top pieces will appear here.</li>
            )}
            {m.topProducts.map((p) => (
              <li key={p.productId} className="flex items-center justify-between gap-3 border-b border-bone/10 pb-3">
                <span className="font-serif text-base text-bone">{p.name}</span>
                <span className="text-[11px] uppercase tracking-editorial text-bone/60">
                  {p._sum.quantity ?? 0} sold
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border border-bone/10">
        <div className="flex items-center justify-between border-b border-bone/10 px-6 py-4">
          <p className="text-[10px] uppercase tracking-editorial text-bone/50">Recent orders</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-editorial text-bone/50">
              <th className="px-6 py-3">Order</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {m.recent.map((o) => (
              <tr key={o.id} className="border-t border-bone/10">
                <td className="px-6 py-4 font-serif">{o.orderNumber}</td>
                <td className="px-6 py-4 text-bone/80">{o.email}</td>
                <td className="px-6 py-4 text-[11px] uppercase tracking-editorial text-bone/70">{o.status}</td>
                <td className="px-6 py-4 text-right font-serif">{formatINR(o.total)}</td>
              </tr>
            ))}
            {m.recent.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-bone/50">No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-bone/10 p-6">
      <p className="text-[10px] uppercase tracking-editorial text-bone/50">{label}</p>
      <p className="mt-3 font-serif text-3xl font-light">{value}</p>
    </div>
  );
}
