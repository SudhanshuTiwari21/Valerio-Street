import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

const schema = z.object({ title: z.string().optional(), body: z.any().optional(), image: z.string().optional() });

export async function PUT(req: Request, ctx: { params: Promise<{ key: string }> }) {
  try {
    await requirePermission("MANAGE_CMS");
    const { key } = await ctx.params;
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    const c = await prisma.cMSContent.upsert({
      where: { key },
      update: parsed.data,
      create: { key, ...parsed.data },
    });
    return NextResponse.json(c);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
