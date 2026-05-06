import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetSchema } from "@/lib/validations";
import { hashOtp } from "@/lib/otp";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = ipFromHeaders(req.headers);
  const rl = rateLimit(`reset:${ip}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const otp = await prisma.emailOtp.findFirst({
    where: { email, type: "PASSWORD_RESET", consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!otp || otp.expiresAt < new Date()) {
    return NextResponse.json({ error: "Code invalid or expired" }, { status: 400 });
  }

  await prisma.emailOtp.update({
    where: { id: otp.id },
    data: { verifyAttempts: { increment: 1 } },
  });
  if (otp.verifyAttempts >= 10) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const codeHash = hashOtp({ email, type: "PASSWORD_RESET", code: parsed.data.code });
  if (otp.codeHash !== codeHash) {
    return NextResponse.json({ error: "Code invalid" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { email }, data: { passwordHash } }),
    prisma.emailOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } }),
  ]);
  return NextResponse.json({ ok: true });
}
