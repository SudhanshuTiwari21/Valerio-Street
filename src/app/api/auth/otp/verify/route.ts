import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { otpVerifySchema } from "@/lib/validations";
import { hashOtp } from "@/lib/otp";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = ipFromHeaders(req.headers);
  const rl = rateLimit(`otp-verify:${ip}`, 25, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = otpVerifySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const type = parsed.data.type;
  const codeHash = hashOtp({ email, type, code: parsed.data.code });

  const otp = await prisma.emailOtp.findFirst({
    where: { email, type, consumedAt: null },
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

  if (otp.codeHash !== codeHash) {
    return NextResponse.json({ error: "Code invalid" }, { status: 400 });
  }

  if (type === "SIGNUP") {
    await prisma.$transaction([
      prisma.emailOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } }),
      prisma.user.update({
        where: { email },
        data: { emailVerified: new Date(), isActive: true },
      }),
    ]);
    return NextResponse.json({ ok: true });
  }

  // PASSWORD_RESET verification is handled in /api/auth/reset
  return NextResponse.json({ ok: true });
}

