import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ productId: z.string() });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: session.user.id, productId: parsed.data.productId } },
    create: { userId: session.user.id, productId: parsed.data.productId },
    update: {},
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const productId = url.searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "Missing" }, { status: 400 });
  await prisma.wishlistItem.deleteMany({ where: { userId: session.user.id, productId } });
  return NextResponse.json({ ok: true });
}
