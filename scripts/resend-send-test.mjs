/**
 * One-off Resend test. Usage (from repo root):
 *   node --env-file=.env scripts/resend-send-test.mjs [to-email]
 * Requires RESEND_API_KEY. Uses RESEND_FROM or SMTP_FROM or onboarding@resend.dev.
 */
import { Resend } from "resend";

const to = process.argv[2];
if (!to) {
  console.error("Usage: node --env-file=.env scripts/resend-send-test.mjs <to-email>");
  process.exit(1);
}

const apiKey = process.env.RESEND_API_KEY?.trim();
if (!apiKey) {
  console.error("Missing RESEND_API_KEY in environment.");
  process.exit(1);
}

const from =
  process.env.RESEND_FROM?.trim() ??
  process.env.SMTP_FROM?.trim() ??
  "Valerio Street <onboarding@resend.dev>";

const resend = new Resend(apiKey);
const { data, error } = await resend.emails.send({
  from,
  to,
  subject: "Valerio Street — Resend test",
  html: "<p>This is a <strong>Resend</strong> test from the Valerio Street repo.</p>",
});

if (error) {
  console.error("Send failed:", error.name, error.message);
  process.exit(1);
}

console.log("Sent OK:", { id: data?.id, to, from: from.replace(/<[^>]+>/, "<…>") });
