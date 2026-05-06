import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = ipFromHeaders(req.headers);
  if (!rateLimit(`contact:${ip}`, 5, 60_000).ok) return NextResponse.json({ error: "Slow down" }, { status: 429 });
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  // Forward to Resend or other email provider in production.
  console.log("[contact]", parsed.data);
  return NextResponse.json({ ok: true });
}
