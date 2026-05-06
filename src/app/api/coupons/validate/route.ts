import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ code: z.string().min(1), subtotal: z.number().int().nonnegative() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const c = await prisma.coupon.findUnique({ where: { code: parsed.data.code.toUpperCase() } });
  if (!c || !c.isActive) return NextResponse.json({ error: "Invalid code" }, { status: 404 });
  if (c.expiresAt && c.expiresAt < new Date()) return NextResponse.json({ error: "Expired" }, { status: 410 });
  if (parsed.data.subtotal < c.minSubtotal)
    return NextResponse.json({ error: "Order too small for this code" }, { status: 400 });

  const discount =
    c.type === "PERCENT"
      ? Math.floor((parsed.data.subtotal * c.value) / 100)
      : Math.min(c.value * 100, parsed.data.subtotal);

  return NextResponse.json({ discount, code: c.code });
}
