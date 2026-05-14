import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendMail } from "@/lib/mailer";
import { orderConfirmedEmail } from "@/lib/email-templates";

const schema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  signature: z.string(),
  orderNumber: z.string(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const ok = verifyRazorpaySignature({
    razorpayOrderId: parsed.data.razorpayOrderId,
    razorpayPaymentId: parsed.data.razorpayPaymentId,
    signature: parsed.data.signature,
  });
  if (!ok) return NextResponse.json({ error: "Bad signature" }, { status: 400 });

  const existing = await prisma.order.findUnique({
    where: { orderNumber: parsed.data.orderNumber },
    select: { paymentMethod: true },
  });
  if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (existing.paymentMethod === "COD") {
    return NextResponse.json({ error: "This order uses cash on delivery; no online payment to verify." }, { status: 400 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { orderNumber: parsed.data.orderNumber },
      include: { items: true },
    });
    if (!order) throw new Error("Order not found");

    // Atomically decrement stock for variants (prevents oversell).
    for (const it of order.items) {
      if (!it.variantId) continue;
      const res = await tx.productVariant.updateMany({
        where: { id: it.variantId, stock: { gte: it.quantity } },
        data: { stock: { decrement: it.quantity } },
      });
      if (res.count !== 1) throw new Error("Insufficient stock for one or more items");
    }

    return await tx.order.update({
      where: { orderNumber: parsed.data.orderNumber },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        razorpayPaymentId: parsed.data.razorpayPaymentId,
        razorpaySignature: parsed.data.signature,
      },
      include: { items: true },
    });
  });

  // Transactional email: order confirmation + invoice summary.
  try {
    const tpl = orderConfirmedEmail({
      brand: "Valerio Street",
      orderNumber: updated.orderNumber,
      total: updated.total,
      email: updated.email,
      items: updated.items.map((i) => ({ name: i.name, quantity: i.quantity, unitPrice: i.unitPrice })),
    });
    await sendMail({ to: updated.email, subject: tpl.subject, html: tpl.html });
  } catch (e) {
    console.error("[mail] order confirmed failed", e);
  }
  return NextResponse.json({ ok: true, orderId: updated.id });
}
