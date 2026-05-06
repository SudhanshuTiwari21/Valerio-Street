import nodemailer from "nodemailer";

export type Mail = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = (process.env.SMTP_SECURE ?? "true").toLowerCase() === "true";

  if (!host || !port || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendMail(mail: Mail) {
  const from = process.env.SMTP_FROM ?? `Valerio Street <${process.env.SMTP_USER ?? "atelier@valeriostreet.com"}>`;
  const transport = getTransport();
  if (!transport) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[mail:skipped]", { to: mail.to, subject: mail.subject });
    }
    return { ok: false as const, skipped: true as const };
  }
  await transport.sendMail({
    from,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });
  return { ok: true as const };
}

