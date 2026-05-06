import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  banner: z.string().optional(),
  order: z.number().int().optional(),
  sizeScale: z.enum(["ALPHA", "SHOE_EU"]).optional(),
});

export async function POST(req: Request) {
  try {
    await requirePermission("MANAGE_CATEGORIES");
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    const c = await prisma.category.create({ data: parsed.data });
    return NextResponse.json(c);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
