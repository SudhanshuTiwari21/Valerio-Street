import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";
import { generateOtpCode, hashOtp } from "@/lib/otp";
import { sendMail } from "@/lib/mailer";
import { otpEmail } from "@/lib/email-templates";

export async function POST(req: Request) {
  const ip = ipFromHeaders(req.headers);
  const rl = rateLimit(`signup:${ip}`, 5, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { name, email, password } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase(), passwordHash, role: "CUSTOMER", emailVerified: null },
  });

  // Issue OTP for email verification
  const code = generateOtpCode();
  const codeHash = hashOtp({ email: user.email, type: "SIGNUP", code });
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.emailOtp.create({
    data: {
      email: user.email,
      type: "SIGNUP",
      codeHash,
      expiresAt,
      sendCount: 1,
      lastSentAt: new Date(),
    },
  });

  const tpl = otpEmail({ type: "SIGNUP", code });
  await sendMail({ to: user.email, subject: tpl.subject, html: tpl.html });

  return NextResponse.json({ ok: true, email: user.email });
}
