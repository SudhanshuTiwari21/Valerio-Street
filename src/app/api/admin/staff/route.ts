import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

const ROLES = ["CONTENT_EDITOR", "MANAGER", "ADMIN", "SUPER_ADMIN"] as const;
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
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(ROLES),
  permissions: z.array(z.enum(PERMS)).default([]),
});

export async function POST(req: Request) {
  try {
    const session = await requirePermission("MANAGE_STAFF");
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const { name, email, password, role, permissions } = parsed.data;
    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const perms = await prisma.permission.findMany({ where: { key: { in: permissions } } });
    const created = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        emailVerified: new Date(),
        permissions: { connect: perms.map((p) => ({ id: p.id })) },
      },
    });
    await prisma.adminActivityLog.create({
      data: { userId: session.user.id, action: "STAFF_CREATE", entity: "User", entityId: created.id },
    });
    return NextResponse.json({
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
      permissions,
      isActive: created.isActive,
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
