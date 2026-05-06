import { prisma } from "@/lib/prisma";
import { formatINR, formatNumber } from "@/lib/utils";
import { RevenueChart } from "@/components/admin/revenue-chart";

export default async function AnalyticsPage() {
  const since = new Date(Date.now() - 90 * 86400_000);
  const [paid, byStatus, byCategory] = await Promise.all([
    prisma.order.findMany({
      where: { paymentStatus: "PAID", createdAt: { gte: since } },
      select: { total: true, createdAt: true },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
  ]);

  const dailyMap = new Map<string, number>();
  paid.forEach((o) => {
    const k = o.createdAt.toISOString().slice(0, 10);
    dailyMap.set(k, (dailyMap.get(k) ?? 0) + o.total);
  });
  const series = Array.from(dailyMap.entries()).sort().map(([date, total]) => ({ date, total: total / 100 }));

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[10px] uppercase tracking-editorial text-bone/50">Analytics</p>
        <h2 className="mt-2 font-serif text-4xl font-light">The atelier in numbers.</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KPI label="Paid orders · 90d" value={formatNumber(paid.length)} />
        <KPI label="Revenue · 90d" value={formatINR(paid.reduce((s, o) => s + o.total, 0))} />
        <KPI
          label="AOV"
          value={paid.length ? formatINR(Math.round(paid.reduce((s, o) => s + o.total, 0) / paid.length)) : "-"}
        />
      </div>

      <div className="border border-bone/10 p-6">
        <p className="text-[10px] uppercase tracking-editorial text-bone/50">Revenue · 90 days</p>
        <RevenueChart data={series} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-bone/10 p-6">
          <p className="text-[10px] uppercase tracking-editorial text-bone/50">Orders by status</p>
          <ul className="mt-4 space-y-3">
            {byStatus.map((s) => (
              <li key={s.status} className="flex items-center justify-between border-b border-bone/10 pb-3">
                <span className="text-[11px] uppercase tracking-editorial text-bone/70">{s.status}</span>
                <span className="font-serif text-xl">{s._count._all}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-bone/10 p-6">
          <p className="text-[10px] uppercase tracking-editorial text-bone/50">Top pieces · 90d</p>
          <ul className="mt-4 space-y-3">
            {byCategory.map((p) => (
              <li key={p.productId} className="flex items-center justify-between border-b border-bone/10 pb-3">
                <span className="font-serif text-base text-bone">{p.productId.slice(0, 8)}…</span>
                <span className="text-[11px] uppercase tracking-editorial text-bone/60">{p._sum.quantity ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
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
