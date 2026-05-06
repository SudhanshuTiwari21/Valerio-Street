import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { requirePermission } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    const session = await requirePermission("MANAGE_PRODUCTS");
    const body = await req.json().catch(() => null);
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    if (parsed.data.status === "ACTIVE" || parsed.data.isFeatured) {
      return NextResponse.json(
        { error: "Product must have inventory before it can be Active or Featured." },
        { status: 409 },
      );
    }
    const created = await prisma.product.create({ data: parsed.data });
    await prisma.adminActivityLog.create({
      data: { userId: session.user.id, action: "PRODUCT_CREATE", entity: "Product", entityId: created.id },
    });
    return NextResponse.json({ id: created.id });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
