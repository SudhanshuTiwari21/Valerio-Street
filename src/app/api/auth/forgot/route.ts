import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotSchema } from "@/lib/validations";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";
import { generateOtpCode, hashOtp } from "@/lib/otp";
import { sendMail } from "@/lib/mailer";
import { otpEmail } from "@/lib/email-templates";

export async function POST(req: Request) {
  const ip = ipFromHeaders(req.headers);
  const rl = rateLimit(`forgot:${ip}`, 5, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = forgotSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (user) {
    const code = generateOtpCode();
    const codeHash = hashOtp({ email: user.email, type: "PASSWORD_RESET", code });
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.emailOtp.create({
      data: {
        email: user.email,
        type: "PASSWORD_RESET",
        codeHash,
        expiresAt,
        sendCount: 1,
        lastSentAt: new Date(),
      },
    });

    const tpl = otpEmail({ type: "PASSWORD_RESET", code });
    await sendMail({ to: user.email, subject: tpl.subject, html: tpl.html });
  }
  return NextResponse.json({ ok: true });
}
