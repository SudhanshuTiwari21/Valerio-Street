import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  cartId: z.string().min(8),
  items: z
    .array(
      z.object({
        variantId: z.string().min(8),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export async function POST(req: Request) {
  const ip = ipFromHeaders(req.headers);
  const rl = rateLimit(`reserve:${ip}`, 40, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { cartId } = parsed.data;
  const items = parsed.data.items;
  const variantIds = Array.from(new Set(items.map((i) => i.variantId)));

  try {
    const res = await prisma.$transaction(async (tx) => {
      // Lazy cleanup: release expired holds for these variants.
      const expired = await tx.inventoryReservation.findMany({
        where: {
          variantId: { in: variantIds },
          status: "ACTIVE",
          expiresAt: { lt: new Date() },
        },
        select: { id: true, variantId: true, quantity: true },
      });

      for (const r of expired) {
        await tx.productVariant.update({
          where: { id: r.variantId },
          data: { stock: { increment: r.quantity } },
        });
        await tx.inventoryReservation.update({
          where: { id: r.id },
          data: { status: "EXPIRED" },
        });
      }

      // Create/update reservations for this cart.
      const results: Array<{ variantId: string; reservedQty: number; expiresAt: string }> = [];
      const now = Date.now();
      const expiresAt = new Date(now + 10 * 60 * 1000);

      for (const it of items) {
        const current = await tx.inventoryReservation.findUnique({
          where: { cartId_variantId: { cartId, variantId: it.variantId } },
        });

        const currentQty =
          current?.status === "ACTIVE" && current.expiresAt > new Date() ? current.quantity : 0;
        const desiredQty = it.quantity;
        const delta = desiredQty - currentQty;

        if (delta > 0) {
          const v = await tx.productVariant.findUnique({ where: { id: it.variantId } });
          if (!v) throw new Error("VARIANT_NOT_FOUND");
          if (v.stock < delta) throw new Error("OUT_OF_STOCK");
          await tx.productVariant.update({
            where: { id: it.variantId },
            data: { stock: { decrement: delta } },
          });
        } else if (delta < 0) {
          await tx.productVariant.update({
            where: { id: it.variantId },
            data: { stock: { increment: Math.abs(delta) } },
          });
        }

        const upserted = await tx.inventoryReservation.upsert({
          where: { cartId_variantId: { cartId, variantId: it.variantId } },
          create: {
            cartId,
            variantId: it.variantId,
            quantity: desiredQty,
            status: "ACTIVE",
            expiresAt,
          },
          update: {
            quantity: desiredQty,
            status: "ACTIVE",
            expiresAt,
          },
          select: { variantId: true, quantity: true, expiresAt: true },
        });

        results.push({ variantId: upserted.variantId, reservedQty: upserted.quantity, expiresAt: upserted.expiresAt.toISOString() });
      }

      return results;
    });

    return NextResponse.json({ ok: true, reservations: res });
  } catch (e: any) {
    const msg = e?.message as string | undefined;
    if (msg === "OUT_OF_STOCK") return NextResponse.json({ error: "One or more sizes are no longer available" }, { status: 409 });
    if (msg === "VARIANT_NOT_FOUND") return NextResponse.json({ error: "One or more items are unavailable" }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

