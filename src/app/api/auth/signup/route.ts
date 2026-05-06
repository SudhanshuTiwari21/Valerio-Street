import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";

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
    data: { name, email: email.toLowerCase(), passwordHash, role: "CUSTOMER" },
  });
  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}
