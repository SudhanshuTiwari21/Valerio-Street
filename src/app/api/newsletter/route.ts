import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validations";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = ipFromHeaders(req.headers);
  if (!rateLimit(`news:${ip}`, 5, 60_000).ok) return NextResponse.json({ error: "Slow down" }, { status: 429 });
  const body = await req.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email.toLowerCase() },
    create: { email: parsed.data.email.toLowerCase() },
    update: {},
  });
  return NextResponse.json({ ok: true });
}
