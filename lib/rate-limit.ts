import { hashValue, verifyAccessKey } from "@/lib/access-keys";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export function rateLimit(request: Request, scope: string, limit = 30, windowMs = 60_000) {
  const key = request.headers.get("x-build-key") || "no-key";
  const id = `${scope}:${hashValue(`${clientIp(request)}:${key}`).slice(0, 32)}`;
  const now = Date.now();
  const current = buckets.get(id);
  if (!current || current.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  current.count += 1;
  return { ok: current.count <= limit, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt };
}

export function buildQuotaLimit(request: Request) {
  const key = request.headers.get("x-build-key") || "";
  const verified = verifyAccessKey(key);
  if (!verified.valid) return { ok: true, remaining: null as number | null, resetAt: 0 };
  const windowMs = Math.max(1, verified.payload.exp - Date.now());
  return rateLimit(request, `build-quota:${verified.payload.sub}`, verified.payload.maxBuilds, windowMs);
}
