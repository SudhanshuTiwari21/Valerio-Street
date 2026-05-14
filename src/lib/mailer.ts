import nodemailer from "nodemailer";
import { Resend } from "resend";

export type Mail = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Sets Reply-To (e.g. visitor email on contact form). */
  replyTo?: string;
};

export type SendMailResult =
  | { ok: true }
  | { ok: false; skipped: true }
  | { ok: false; code?: string; message: string };

/** Resend HTTP API (no SMTP). Prefer when `RESEND_API_KEY` is set - avoids Titan/host SMTP 535 issues. */
async function sendViaResend(mail: Mail): Promise<SendMailResult | null> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;

  const from =
    process.env.RESEND_FROM?.trim() ??
    process.env.SMTP_FROM?.trim() ??
    "Valerio Street <onboarding@resend.dev>";

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    ...(mail.text ? { text: mail.text } : {}),
    ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
  });

  if (result.error) {
    console.error("[mail:resend]", { message: result.error.message, name: result.error.name });
    return { ok: false, message: result.error.message };
  }
  return { ok: true };
}

function createTransport(authMethod?: "PLAIN" | "LOGIN") {
  const host = process.env.SMTP_HOST?.trim();
  const portRaw = process.env.SMTP_PORT?.trim();
  const port = portRaw ? Number(portRaw) : undefined;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !port || !user || !pass) return null;

  // Nodemailer: port 465 → implicit TLS (secure: true). Port 587 → STARTTLS (secure: false + requireTLS).
  // Wrong pairing (e.g. secure:true on 587) often yields 535 auth failed on Titan and similar hosts.
  const secureEnv = (process.env.SMTP_SECURE ?? "").toLowerCase();
  let secure: boolean;
  if (port === 465) secure = true;
  else if (port === 587) secure = false;
  else secure = secureEnv === "true" || secureEnv !== "false";

  const envMethod = process.env.SMTP_AUTH_METHOD?.trim().toUpperCase();
  let method: "LOGIN" | "PLAIN" | undefined;
  if (authMethod) method = authMethod;
  else if (envMethod === "LOGIN" || envMethod === "PLAIN") method = envMethod;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: port === 587,
    auth: { user, pass },
    ...(method ? { authMethod: method } : {}),
    tls: { servername: host, minVersion: "TLSv1.2" },
  });
}

async function sendViaSmtp(mail: Mail, from: string): Promise<SendMailResult> {
  const transport = createTransport();
  if (!transport) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[mail:skipped]", { to: mail.to, subject: mail.subject });
    }
    return { ok: false, skipped: true };
  }

  const payload = {
    from,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
  };

  try {
    await transport.sendMail(payload);
    return { ok: true };
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string; responseCode?: number };
    const code = err.code;
    const message = err.message ?? "send failed";

    // Some hosts reject AUTH PLAIN but accept LOGIN; retry once if user didn't force a method.
    if (code === "EAUTH" && !process.env.SMTP_AUTH_METHOD?.trim()) {
      const fallback = createTransport("LOGIN");
      if (fallback) {
        try {
          await fallback.sendMail(payload);
          return { ok: true };
        } catch (loginError: unknown) {
          const errLogin = loginError as { code?: string; message?: string; responseCode?: number };
          console.error("[mail:error]", {
            code: errLogin.code,
            responseCode: errLogin.responseCode,
            message: (errLogin.message ?? "send failed").slice(0, 200),
            note: "after LOGIN retry",
          });
          return { ok: false, code: errLogin.code, message: errLogin.message ?? "send failed" };
        }
      }
    }

    console.error("[mail:error]", { code, responseCode: err.responseCode, message: message.slice(0, 200) });
    return { ok: false, code, message };
  }
}

export async function sendMail(mail: Mail): Promise<SendMailResult> {
  const smtpFrom = process.env.SMTP_FROM?.trim() ?? `Valerio Street <${process.env.SMTP_USER?.trim() ?? "noreply@example.com"}>`;

  const resendAttempt = await sendViaResend(mail);
  if (resendAttempt) {
    if (resendAttempt.ok) return resendAttempt;
    // Fall back to SMTP if Resend failed but SMTP is configured (e.g. wrong Resend domain).
    const fallback = await sendViaSmtp(mail, smtpFrom);
    if (fallback.ok || !("skipped" in fallback && fallback.skipped)) return fallback;
    return resendAttempt;
  }

  return sendViaSmtp(mail, smtpFrom);
}

