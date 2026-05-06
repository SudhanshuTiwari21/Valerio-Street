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
