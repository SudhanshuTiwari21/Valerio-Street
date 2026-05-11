import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations";
import { getRazorpay } from "@/lib/razorpay";
import { generateOrderNumber } from "@/lib/utils";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";
import { getShippingSettings, shippingFeeFromSettings } from "@/lib/shipping";

const lineItem = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  quantity: z.number().int().positive(),
  slug: z.string(),
  name: z.string(),
  image: z.string().optional(),
  unitPrice: z.number().int().nonnegative(),
});

const schema = checkoutSchema.extend({ items: z.array(lineItem).min(1) });
const schemaWithCart = schema.extend({ cartId: z.string().min(8).optional() });

export async function POST(req: Request) {
  const ip = ipFromHeaders(req.headers);
  const rl = rateLimit(`order:${ip}`, 20, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const json = await req.json().catch(() => null);
  const parsed = schemaWithCart.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order", details: parsed.error.flatten() }, { status: 400 });
  }
  const { items, address, email, phone, couponCode, notes, cartId } = parsed.data;
  const session = await auth();

  // Re-price server-side from DB to prevent tampering.
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, status: "ACTIVE" },
  });
  const priceMap = new Map(dbProducts.map((p) => [p.id, p.price]));
  if (priceMap.size !== new Set(items.map((i) => i.productId)).size) {
    return NextResponse.json({ error: "One or more items are unavailable" }, { status: 400 });
  }
  const subtotal = items.reduce((s, i) => s + (priceMap.get(i.productId) ?? 0) * i.quantity, 0);

  let discount = 0;
  if (couponCode) {
    const c = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    if (c?.isActive && (!c.expiresAt || c.expiresAt > new Date()) && subtotal >= c.minSubtotal) {
      discount = c.type === "PERCENT" ? Math.floor((subtotal * c.value) / 100) : Math.min(c.value * 100, subtotal);
    }
  }

  const shipCfg = await getShippingSettings();
  const shippingFee = shippingFeeFromSettings(subtotal - discount, shipCfg);
  const total = Math.max(0, subtotal - discount + shippingFee);
  const orderNumber = generateOrderNumber();

  const addr = await prisma.address.create({
    data: { ...address, userId: session?.user?.id ?? null },
  });

  let razorpayOrderId: string | null = null;
  if (process.env.RAZORPAY_KEY_ID) {
    const rz = getRazorpay();
    const rzOrder = await rz.orders.create({
      amount: total,
      currency: "INR",
      receipt: orderNumber,
      notes: { orderNumber, email },
    });
    razorpayOrderId = rzOrder.id;
  }

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session?.user?.id ?? null,
      email: email.toLowerCase(),
      phone,
      subtotal,
      shippingFee,
      discountAmount: discount,
      total,
      currency: "INR",
      couponCode: couponCode?.toUpperCase(),
      shippingAddressId: addr.id,
      razorpayOrderId: razorpayOrderId ?? undefined,
      notes,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          name: i.name,
          size: i.size,
          color: i.color,
          image: i.image,
          unitPrice: priceMap.get(i.productId) ?? 0,
          quantity: i.quantity,
        })),
      },
    },
  });

  // Consume reservations for this cart (stock already deducted at reserve time).
  if (cartId?.length) {
    await prisma.inventoryReservation.updateMany({
      where: {
        cartId,
        status: "ACTIVE",
        expiresAt: { gt: new Date() },
      },
      data: { status: "CONSUMED", orderId: order.id },
    });
  }

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    razorpayOrderId,
    amount: total,
    currency: "INR",
  });
}
