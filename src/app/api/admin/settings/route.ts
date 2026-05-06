import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

const schema = z.object({
  brandName: z.string().optional(),
  supportEmail: z.string().email().optional(),
  supportPhone: z.string().optional().nullable(),
  shippingFlatFee: z.number().int().nonnegative().optional(),
  freeShippingMin: z.number().int().nonnegative().optional(),
  taxRate: z.number().int().nonnegative().optional(),
  razorpayEnabled: z.boolean().optional(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});

export async function PUT(req: Request) {
  try {
    await requirePermission("MANAGE_SETTINGS");
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    const s = await prisma.settings.upsert({
      where: { id: "singleton" },
      update: parsed.data as any,
      create: { id: "singleton", ...(parsed.data as any) },
    });
    return NextResponse.json(s);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
