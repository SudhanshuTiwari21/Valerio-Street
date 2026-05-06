type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();

/** Simple in-memory IP rate limiter. For production, swap to Upstash. */
export function rateLimit(key: string, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (b.count >= limit) return { ok: false, remaining: 0, retryAfter: b.reset - now };
  b.count++;
  return { ok: true, remaining: limit - b.count };
}

export function ipFromHeaders(h: Headers): string {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "0.0.0.0"
  );
}
