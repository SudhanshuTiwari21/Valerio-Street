import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

const ROLES = ["CUSTOMER", "CONTENT_EDITOR", "MANAGER", "ADMIN", "SUPER_ADMIN"] as const;
const PERMS = [
  "MANAGE_PRODUCTS",
  "MANAGE_ORDERS",
  "MANAGE_CUSTOMERS",
  "MANAGE_CATEGORIES",
  "MANAGE_STAFF",
  "MANAGE_CMS",
  "MANAGE_SETTINGS",
  "VIEW_ANALYTICS",
  "MANAGE_BLOG",
] as const;

const schema = z.object({
  role: z.enum(ROLES).optional(),
  permissions: z.array(z.enum(PERMS)).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("MANAGE_STAFF");
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

    const data: any = {};
    if (parsed.data.role) data.role = parsed.data.role;
    if (typeof parsed.data.isActive === "boolean") data.isActive = parsed.data.isActive;
    if (parsed.data.permissions) {
      const perms = await prisma.permission.findMany({ where: { key: { in: parsed.data.permissions } } });
      data.permissions = { set: perms.map((p) => ({ id: p.id })) };
    }
    await prisma.user.update({ where: { id }, data });
    await prisma.adminActivityLog.create({
      data: { userId: session.user.id, action: "STAFF_UPDATE", entity: "User", entityId: id, metadata: parsed.data as any },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
