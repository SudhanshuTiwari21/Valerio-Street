import { formatINR } from "@/lib/utils";

export function orderConfirmedEmail(input: {
  brand: string;
  orderNumber: string;
  total: number;
  email: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  /** Shown when customer chose cash on delivery */
  cod?: boolean;
}) {
  const lines = input.items
    .map(
      (i) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid rgba(26,26,26,0.12)">${escapeHtml(
          i.name,
        )} <span style="color:rgba(26,26,26,0.6)">× ${i.quantity}</span></td><td style="padding:10px 0;border-bottom:1px solid rgba(26,26,26,0.12)" align="right">${formatINR(
          i.unitPrice * i.quantity,
        )}</td></tr>`,
    )
    .join("");

  const subject = input.cod ? `Order placed (COD) · ${input.orderNumber}` : `Order confirmed · ${input.orderNumber}`;
  const html = baseEmail({
    title: "Thank you.",
    subtitle: input.cod
      ? `Your order is confirmed. Pay when your piece arrives.`
      : `Your order has been confirmed. A quiet note from the atelier.`,
    body: `
      <p style="margin:0 0 14px 0;color:rgba(26,26,26,0.75);line-height:1.7">
        Order <strong>${escapeHtml(input.orderNumber)}</strong>
      </p>
      ${
        input.cod
          ? `<p style="margin:0 0 14px 0;color:rgba(26,26,26,0.75);line-height:1.7">Payment: <strong>cash on delivery</strong> — ${formatINR(
              input.total,
            )} due when the courier delivers.</p>`
          : ""
      }
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:12px">
        ${lines}
        <tr>
          <td style="padding:14px 0 0 0;font-size:12px;text-transform:uppercase;letter-spacing:0.18em;color:rgba(26,26,26,0.55)">Total</td>
          <td style="padding:14px 0 0 0" align="right" >
            <span style="font-family:Georgia,serif;font-size:22px;color:#1A1A1A">${formatINR(input.total)}</span>
          </td>
        </tr>
      </table>
      <p style="margin:18px 0 0 0;color:rgba(26,26,26,0.65);line-height:1.7">
        We will email you again when your piece is prepared for dispatch.
      </p>
    `,
  });
  return { subject, html };
}

export function orderStatusUpdatedEmail(input: {
  orderNumber: string;
  status: string;
  trackingNumber?: string | null;
}) {
  const subject = `Update · ${input.orderNumber} · ${input.status}`;
  const html = baseEmail({
    title: "An update.",
    subtitle: `Your order has moved quietly through the atelier.`,
    body: `
      <p style="margin:0 0 14px 0;color:rgba(26,26,26,0.75);line-height:1.7">
        Order <strong>${escapeHtml(input.orderNumber)}</strong>
      </p>
      <p style="margin:0 0 14px 0;color:rgba(26,26,26,0.75);line-height:1.7">
        Status: <strong>${escapeHtml(input.status)}</strong>
      </p>
      ${
        input.trackingNumber
          ? `<p style="margin:0;color:rgba(26,26,26,0.75);line-height:1.7">Tracking number: <strong>${escapeHtml(
              input.trackingNumber,
            )}</strong></p>`
          : ""
      }
    `,
  });
  return { subject, html };
}

export function otpEmail(input: { type: "SIGNUP" | "PASSWORD_RESET"; code: string }) {
  const title = input.type === "SIGNUP" ? "Verify your email." : "Reset your password.";
  const subtitle =
    input.type === "SIGNUP"
      ? "Enter this code to confirm your account."
      : "Enter this code to set a new password.";
  const subject = input.type === "SIGNUP" ? "Your verification code" : "Your reset code";
  const html = baseEmail({
    title,
    subtitle,
    body: `
      <div style="margin-top:18px;padding:18px 18px;border:1px solid rgba(26,26,26,0.12);background:#F5F1EA">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.18em;color:rgba(26,26,26,0.55)">One-time code</div>
        <div style="margin-top:10px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:28px;letter-spacing:0.22em;color:#1A1A1A">
          ${escapeHtml(input.code)}
        </div>
        <div style="margin-top:10px;font-size:12px;color:rgba(26,26,26,0.65)">
          This code expires in 10 minutes.
        </div>
      </div>
    `,
  });
  return { subject, html };
}

function baseEmail(input: { title: string; subtitle: string; body: string }) {
  return `
  <div style="background:#F5F1EA;padding:40px 16px;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1A1A1A">
    <div style="max-width:620px;margin:0 auto;background:#FFFFFF;border:1px solid rgba(26,26,26,0.10);padding:34px">
      <div style="font-family:Georgia,'Cormorant Garamond',serif;letter-spacing:0.32em;text-transform:uppercase;font-size:14px;margin-bottom:22px">
        Valerio Street
      </div>
      <h1 style="font-family:Georgia,'Cormorant Garamond',serif;font-weight:300;font-size:40px;line-height:1.05;margin:0 0 12px 0">${escapeHtml(
        input.title,
      )}</h1>
      <p style="margin:0 0 22px 0;color:rgba(26,26,26,0.70);line-height:1.7">${escapeHtml(
        input.subtitle,
      )}</p>
      ${input.body}
      <div style="margin-top:28px;padding-top:18px;border-top:1px solid rgba(26,26,26,0.10);font-size:12px;text-transform:uppercase;letter-spacing:0.18em;color:rgba(26,26,26,0.50)">
        Quiet Luxury For The Modern Gentleman.
      </div>
    </div>
  </div>
  `;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

