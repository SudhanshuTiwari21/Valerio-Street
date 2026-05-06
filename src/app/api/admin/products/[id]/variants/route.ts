import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

const variantSchema = z.object({
  id: z.string().optional(),
  size: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  sku: z.string().min(2),
  stock: z.number().int().min(0),
  priceDiff: z.number().int(),
});

const schema = z.object({ variants: z.array(variantSchema) });

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("MANAGE_PRODUCTS");
    const { id: productId } = await ctx.params;
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid variants" }, { status: 400 });

    const incoming = parsed.data.variants;
    const keepIds = incoming.flatMap((v) => (v.id ? [v.id] : []));

    await prisma.$transaction(async (tx) => {
      // Ensure product exists
      const p = await tx.product.findUnique({ where: { id: productId }, select: { id: true } });
      if (!p) throw new Error("Product not found");

      for (const v of incoming) {
        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              size: v.size ?? null,
              color: v.color ?? null,
              sku: v.sku,
              stock: v.stock,
              priceDiff: v.priceDiff,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId,
              size: v.size ?? null,
              color: v.color ?? null,
              sku: v.sku,
              stock: v.stock,
              priceDiff: v.priceDiff,
            },
          });
        }
      }

      // Remove variants not present anymore (for this product only).
      await tx.productVariant.deleteMany({
        where: { productId, ...(keepIds.length ? { id: { notIn: keepIds } } : {}) },
      });

      await tx.adminActivityLog.create({
        data: {
          userId: session.user.id,
          action: "PRODUCT_VARIANTS_UPDATE",
          entity: "Product",
          entityId: productId,
          metadata: { count: incoming.length } as any,
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof Response) return e;
    const msg = typeof e?.message === "string" ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

