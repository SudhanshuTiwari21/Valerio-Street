import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { requirePermission } from "@/lib/rbac";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("MANAGE_PRODUCTS");
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const wantsActiveOrFeatured = parsed.data.status === "ACTIVE" || parsed.data.isFeatured === true;
    if (wantsActiveOrFeatured) {
      const inv = await prisma.productVariant.aggregate({
        where: { productId: id },
        _sum: { stock: true },
      });
      const totalStock = inv._sum.stock ?? 0;
      if (totalStock < 1) {
        return NextResponse.json(
          { error: "Add at least one variant with stock ≥ 1 before setting Active or Featured." },
          { status: 409 },
        );
      }
    }
    const updated = await prisma.product.update({ where: { id }, data: parsed.data });
    await prisma.adminActivityLog.create({
      data: { userId: session.user.id, action: "PRODUCT_UPDATE", entity: "Product", entityId: id },
    });
    return NextResponse.json({ id: updated.id });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("MANAGE_PRODUCTS");
    const { id } = await ctx.params;
    await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
    await prisma.adminActivityLog.create({
      data: { userId: session.user.id, action: "PRODUCT_ARCHIVE", entity: "Product", entityId: id },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  // Permanent delete (separate from archive). Body: { action: "HARD_DELETE" }
  try {
    const session = await requirePermission("MANAGE_PRODUCTS");
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    if (body?.action !== "HARD_DELETE") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const oi = await prisma.orderItem.count({ where: { productId: id } });
    if (oi > 0) {
      return NextResponse.json(
        { error: "This product has orders and cannot be permanently deleted." },
        { status: 409 },
      );
    }

    await prisma.product.delete({ where: { id } });
    await prisma.adminActivityLog.create({
      data: { userId: session.user.id, action: "PRODUCT_DELETE", entity: "Product", entityId: id },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
