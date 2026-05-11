import nodemailer from "nodemailer";

export type Mail = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendMailResult =
  | { ok: true }
  | { ok: false; skipped: true }
  | { ok: false; code?: string; message: string };

function getTransport() {
  const host = process.env.SMTP_HOST?.trim();
  const portRaw = process.env.SMTP_PORT?.trim();
  const port = portRaw ? Number(portRaw) : undefined;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !port || !user || !pass) return null;

  // Nodemailer: port 465 → implicit TLS (secure: true). Port 587 → STARTTLS (secure: false + requireTLS).
  // Wrong pairing (e.g. secure:true on 587) often yields 535 auth failed on Titan and similar hosts.
  const secureEnv = (process.env.SMTP_SECURE ?? "").toLowerCase();
  const secure =
    port === 465 ? true : port === 587 ? false : secureEnv === "true" || (secureEnv !== "false" && port !== 587);

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: port === 587,
    auth: { user, pass },
    tls: { servername: host, minVersion: "TLSv1.2" },
  });
}

export async function sendMail(mail: Mail): Promise<SendMailResult> {
  const from = process.env.SMTP_FROM?.trim() ?? `Valerio Street <${process.env.SMTP_USER?.trim() ?? "noreply@example.com"}>`;
  const transport = getTransport();
  if (!transport) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[mail:skipped]", { to: mail.to, subject: mail.subject });
    }
    return { ok: false, skipped: true };
  }
  try {
    await transport.sendMail({
      from,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    return { ok: true };
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string; responseCode?: number };
    const code = err.code;
    const message = err.message ?? "send failed";
    console.error("[mail:error]", { code, responseCode: err.responseCode, message: message.slice(0, 200) });
    return { ok: false, code, message };
  }
}

