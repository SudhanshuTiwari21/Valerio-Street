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

export async function sendMail(mail: Mail): Promise<SendMailResult> {
  const from = process.env.SMTP_FROM?.trim() ?? `Valerio Street <${process.env.SMTP_USER?.trim() ?? "noreply@example.com"}>`;
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

