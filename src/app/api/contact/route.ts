import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mailer";
import { site } from "@/lib/site";

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function POST(req: Request) {
  const ip = ipFromHeaders(req.headers);
  if (!rateLimit(`contact:${ip}`, 5, 60_000).ok) return NextResponse.json({ error: "Slow down" }, { status: 429 });
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const d = parsed.data;
  const inbox = process.env.CONTACT_TO?.trim() || site.contact.email;
  const subject = `[${site.name} contact] ${d.subject.slice(0, 200)}`;
  const html = `
    <p><strong>Name:</strong> ${escapeHtml(d.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(d.email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(d.subject)}</p>
    <hr />
    <p>${escapeHtml(d.message).replaceAll("\n", "<br/>")}</p>
  `;
  const text = `Name: ${d.name}\nEmail: ${d.email}\nSubject: ${d.subject}\n\n${d.message}`;

  const result = await sendMail({
    to: inbox,
    subject,
    html,
    text,
    replyTo: d.email,
  });

  if (!result.ok && "skipped" in result && result.skipped) {
    console.log("[contact:no-mail]", d);
    return NextResponse.json({ ok: true });
  }
  if (!result.ok) {
    console.error("[contact:send]", result);
    return NextResponse.json({ error: "Could not send your message. Please email or call us directly." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
