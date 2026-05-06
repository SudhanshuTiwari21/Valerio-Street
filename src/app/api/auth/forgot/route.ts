import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotSchema } from "@/lib/validations";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = ipFromHeaders(req.headers);
  const rl = rateLimit(`forgot:${ip}`, 5, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = forgotSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (user) {
    const token = crypto.randomBytes(24).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
    // TODO: send email via Resend in production. Always respond OK.
  }
  return NextResponse.json({ ok: true });
}
