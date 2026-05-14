/**
 * One-off SMTP test. Usage (from repo root):
 *   node --env-file=.env scripts/smtp-send-test.mjs [to-email]
 * Do not commit secrets; reads SMTP_* from environment only.
 */
import nodemailer from "nodemailer";

const to = process.argv[2] ?? "sudhanshu@jobtree.org.in";

const host = process.env.SMTP_HOST?.trim();
const port = Number(process.env.SMTP_PORT?.trim());
const user = process.env.SMTP_USER?.trim();
const pass = process.env.SMTP_PASS?.trim();
const from = process.env.SMTP_FROM?.trim() ?? `Valerio Street <${user}>`;

if (!host || !Number.isFinite(port) || !user || !pass) {
  console.error("Missing SMTP_HOST, SMTP_PORT, SMTP_USER, or SMTP_PASS in environment.");
  process.exit(1);
}

const secureEnv = (process.env.SMTP_SECURE ?? "").toLowerCase();
let secure;
if (port === 465) secure = true;
else if (port === 587) secure = false;
else secure = secureEnv === "true" || secureEnv !== "false";

const transport = nodemailer.createTransport({
  host,
  port,
  secure,
  requireTLS: port === 587,
  auth: { user, pass },
  tls: { servername: host, minVersion: "TLSv1.2" },
});

try {
  const info = await transport.sendMail({
    from,
    to,
    subject: "Valerio Street - SMTP test",
    text: "This is a dummy test message sent from the Valerio Street repo SMTP check script.",
    html: "<p>This is a <strong>dummy test</strong> message from the Valerio Street SMTP check script.</p>",
  });
  console.log("Sent OK:", { messageId: info.messageId, to, from: from.replace(/<[^>]+>/, "<…>") });
} catch (e) {
  console.error("Send failed:", e.code ?? e.name, e.message?.slice(0, 300));
  if (e.code === "EAUTH" && !process.env.SMTP_AUTH_METHOD) {
    const t2 = nodemailer.createTransport({
      host,
      port,
      secure,
      requireTLS: port === 587,
      auth: { user, pass },
      authMethod: "LOGIN",
      tls: { servername: host, minVersion: "TLSv1.2" },
    });
    try {
      const info = await t2.sendMail({
        from,
        to,
        subject: "Valerio Street - SMTP test (LOGIN retry)",
        text: "LOGIN auth retry test.",
      });
      console.log("Sent OK (LOGIN retry):", { messageId: info.messageId, to });
      process.exit(0);
    } catch (e2) {
      console.error("LOGIN retry also failed:", e2.message?.slice(0, 300));
    }
  }
  process.exit(1);
}
