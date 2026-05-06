import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const tok = await prisma.passwordResetToken.findUnique({ where: { token: parsed.data.token } });
  if (!tok || tok.expires < new Date()) {
    return NextResponse.json({ error: "Token invalid or expired" }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({ where: { email: tok.email }, data: { passwordHash } });
  await prisma.passwordResetToken.delete({ where: { token: tok.token } });
  return NextResponse.json({ ok: true });
}
