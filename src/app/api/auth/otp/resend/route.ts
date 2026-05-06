import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { otpVerifySchema } from "@/lib/validations";
import { generateOtpCode, hashOtp } from "@/lib/otp";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mailer";
import { otpEmail } from "@/lib/email-templates";

export async function POST(req: Request) {
  const ip = ipFromHeaders(req.headers);
  const rl = rateLimit(`otp-resend:${ip}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = otpVerifySchema
    .pick({ email: true, type: true })
    .safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const type = parsed.data.type;

  // Do not leak user existence. We silently succeed.
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u) return NextResponse.json({ ok: true });
  if (type === "SIGNUP" && u.emailVerified) return NextResponse.json({ ok: true });

  const recent = await prisma.emailOtp.findFirst({
    where: { email, type, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (recent?.lastSentAt && Date.now() - recent.lastSentAt.getTime() < 60_000) {
    return NextResponse.json({ error: "Please wait a moment before resending" }, { status: 429 });
  }
  if (recent && recent.sendCount >= 5 && Date.now() - recent.createdAt.getTime() < 60 * 60 * 1000) {
    return NextResponse.json({ error: "Resend limit reached. Try later." }, { status: 429 });
  }

  const code = generateOtpCode();
  const codeHash = hashOtp({ email, type, code });
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  if (recent && recent.expiresAt > new Date() && recent.createdAt.getTime() > Date.now() - 60 * 60 * 1000) {
    await prisma.emailOtp.update({
      where: { id: recent.id },
      data: {
        codeHash,
        expiresAt,
        lastSentAt: new Date(),
        sendCount: { increment: 1 },
      },
    });
  } else {
    await prisma.emailOtp.create({
      data: { email, type, codeHash, expiresAt, lastSentAt: new Date(), sendCount: 1 },
    });
  }

  const tpl = otpEmail({ type, code });
  await sendMail({ to: email, subject: tpl.subject, html: tpl.html });

  return NextResponse.json({ ok: true });
}

