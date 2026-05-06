import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";

export default async function AdminCustomers() {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { orders: { select: { total: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <p className="text-[10px] uppercase tracking-editorial text-bone/50">Customers</p>
      <h2 className="mt-2 font-serif text-4xl font-light">Members of the house.</h2>

      <div className="mt-8 overflow-x-auto border border-bone/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-editorial text-bone/50">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Orders</th>
              <th className="px-6 py-3 text-right">Lifetime value</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const total = u.orders.reduce((s, o) => s + o.total, 0);
              return (
                <tr key={u.id} className="border-t border-bone/10">
                  <td className="px-6 py-3 font-serif text-base">{u.name ?? "-"}</td>
                  <td className="px-6 py-3 text-bone/70">{u.email}</td>
                  <td className="px-6 py-3 text-bone/70">{u.orders.length}</td>
                  <td className="px-6 py-3 text-right font-serif">{formatINR(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
