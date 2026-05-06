import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";
import { OrderStatusForm } from "@/components/admin/order-status-form";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, shippingAddress: true, user: true },
  });
  if (!order) return notFound();

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[10px] uppercase tracking-editorial text-bone/50">Order</p>
        <h2 className="mt-2 font-serif text-4xl font-light">{order.orderNumber}</h2>
        <p className="mt-1 text-[11px] uppercase tracking-editorial text-bone/50">
          {order.createdAt.toLocaleString("en-IN")}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="border border-bone/10">
            <div className="border-b border-bone/10 px-6 py-4 text-[10px] uppercase tracking-editorial text-bone/50">
              Items
            </div>
            <table className="w-full text-sm">
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id} className="border-t border-bone/10">
                    <td className="px-6 py-4 font-serif">{it.name}</td>
                    <td className="px-6 py-4 text-bone/60">{[it.size, it.color].filter(Boolean).join(" · ") || "-"}</td>
                    <td className="px-6 py-4 text-bone/60">× {it.quantity}</td>
                    <td className="px-6 py-4 text-right font-serif">
                      {formatINR(it.unitPrice * it.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <div className="border border-bone/10 p-6">
            <p className="text-[10px] uppercase tracking-editorial text-bone/50">Summary</p>
            <dl className="mt-4 space-y-2 text-sm">
              <Row k="Subtotal" v={formatINR(order.subtotal)} />
              <Row k="Shipping" v={formatINR(order.shippingFee)} />
              <Row k="Discount" v={`− ${formatINR(order.discountAmount)}`} />
            </dl>
            <div className="mt-4 flex justify-between border-t border-bone/10 pt-4">
              <span className="text-[11px] uppercase tracking-editorial text-bone/60">Total</span>
              <span className="font-serif text-2xl">{formatINR(order.total)}</span>
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-editorial text-bone/50">
              {order.paymentStatus} · {order.status}
            </p>
          </div>

          <OrderStatusForm orderNumber={order.orderNumber} status={order.status} trackingNumber={order.trackingNumber} />

          <div className="border border-bone/10 p-6 text-sm text-bone/80">
            <p className="text-[10px] uppercase tracking-editorial text-bone/50">Customer</p>
            <p className="mt-2 font-serif text-base text-bone">{order.email}</p>
            <p className="text-bone/60">{order.phone}</p>
            {order.shippingAddress && (
              <div className="mt-4 space-y-1 text-sm">
                <p className="font-serif text-bone">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-bone/80">
      <dt className="text-bone/50">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
