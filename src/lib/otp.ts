import crypto from "node:crypto";

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashOtp(args: { email: string; type: string; code: string }): string {
  const secret = process.env.AUTH_SECRET ?? "valerio-otp";
  const payload = `${args.email.toLowerCase()}|${args.type}|${args.code}|${secret}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

