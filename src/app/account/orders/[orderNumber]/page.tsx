import { notFound } from "next/navigation";
import Image from "next/image";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";

export default async function OrderDetail({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;
  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      OR: [
        { userId: session.user.id },
        { userId: null, email: (session.user.email ?? "").toLowerCase() },
      ],
    },
    include: { items: true, shippingAddress: true },
  });
  if (!order) return notFound();

  return (
    <div>
      <h2 className="font-serif text-2xl font-light">Order {order.orderNumber}</h2>
      <p className="mt-2 text-[11px] uppercase tracking-editorial text-charcoal/60">
        {order.createdAt.toLocaleString("en-IN")}
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          {order.items.map((it) => (
            <div key={it.id} className="flex gap-5 border-b border-charcoal/10 pb-6">
              <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-sand/40">
                {it.image && <Image src={it.image} alt={it.name} fill className="object-cover" sizes="80px" />}
              </div>
              <div className="flex flex-1 items-start justify-between">
                <div>
                  <p className="font-serif text-lg">{it.name}</p>
                  <p className="text-[11px] uppercase tracking-editorial text-charcoal/50">
                    {[it.size, it.color, `× ${it.quantity}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <p className="font-serif">{formatINR(it.unitPrice * it.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
        <aside className="lg:col-span-4">
          <div className="border border-charcoal/10 p-6">
            <p className="editorial-eyebrow">Summary</p>
            <dl className="mt-4 space-y-2 text-sm">
              <Row k="Subtotal" v={formatINR(order.subtotal)} />
              <Row k="Shipping" v={order.shippingFee ? formatINR(order.shippingFee) : "Complimentary"} />
              {order.discountAmount > 0 && <Row k="Discount" v={`− ${formatINR(order.discountAmount)}`} />}
            </dl>
            <div className="mt-4 flex justify-between border-t border-charcoal/10 pt-4">
              <span className="text-[11px] uppercase tracking-editorial text-charcoal/60">Total</span>
              <span className="font-serif text-2xl">{formatINR(order.total)}</span>
            </div>
            <p className="mt-3 text-[11px] uppercase tracking-editorial text-charcoal/50">
              {order.paymentStatus} · {order.status}
            </p>
          </div>
          {order.trackingNumber && (
            <div className="mt-6 border border-charcoal/10 p-6 text-sm text-charcoal/80">
              <p className="editorial-eyebrow mb-3">Tracking</p>
              <p className="font-serif text-lg">{order.trackingNumber}</p>
              <p className="mt-1 text-charcoal/60">We’ll keep you updated as it moves.</p>
            </div>
          )}
          {order.shippingAddress && (
            <div className="mt-6 border border-charcoal/10 p-6 text-sm text-charcoal/80">
              <p className="editorial-eyebrow mb-3">Shipping</p>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2 text-charcoal/60">{order.shippingAddress.phone}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-charcoal/60">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
