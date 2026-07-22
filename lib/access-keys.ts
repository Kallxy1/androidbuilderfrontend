import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";

export type AccessKeyPayload = {
  v: 1;
  sub: string;
  plan: "1day" | "3days" | "7days";
  iat: number;
  exp: number;
  maxBuilds: number;
};

const plans: Record<AccessKeyPayload["plan"], { ttlMs: number; maxBuilds: number; label: string }> = {
  "1day": { ttlMs: 24 * 60 * 60 * 1000, maxBuilds: 2, label: "1 hari" },
  "3days": { ttlMs: 3 * 24 * 60 * 60 * 1000, maxBuilds: 5, label: "3 hari" },
  "7days": { ttlMs: 7 * 24 * 60 * 60 * 1000, maxBuilds: 10, label: "7 hari" }
};

const claimTtlMs = 30 * 60 * 1000;

function secret() {
  return process.env.ACCESS_KEY_SECRET || process.env.BUILD_ACCESS_KEY || "";
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sign(value: string) {
  const key = secret();
  if (!key || key.length < 16) throw new Error("ACCESS_KEY_SECRET must be set with at least 16 characters");
  return createHmac("sha256", key).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getPlan(plan: string | undefined) {
  return plans[(plan || "") as AccessKeyPayload["plan"]] || null;
}

export function allowedPlans() {
  return Object.entries(plans).map(([id, value]) => ({ id, ...value }));
}

export function createClaimId(now = Date.now()) {
  const random = randomBytes(18).toString("base64url");
  return `clm_${now}_${random}`;
}

export function signClaim(plan: AccessKeyPayload["plan"], claimId: string) {
  return sign(`claim.${plan}.${claimId}`);
}

export function verifyClaim(plan: string, claimId: string, signature: string) {
  const selected = getPlan(plan);
  if (!selected) return { valid: false, error: "Unknown key duration" } as const;
  if (!/^clm_\d{10,13}_[A-Za-z0-9_-]{16,64}$/.test(claimId)) return { valid: false, error: "Invalid claim format" } as const;
  const timestamp = Number(claimId.split("_")[1]);
  if (!Number.isFinite(timestamp)) return { valid: false, error: "Invalid claim timestamp" } as const;
  if (Date.now() - timestamp > claimTtlMs) return { valid: false, error: "Claim link expired" } as const;
  if (timestamp - Date.now() > 60_000) return { valid: false, error: "Claim timestamp is invalid" } as const;
  try {
    const expected = signClaim(plan as AccessKeyPayload["plan"], claimId);
    if (!safeEqual(signature, expected)) return { valid: false, error: "Invalid claim signature" } as const;
    return { valid: true, plan: plan as AccessKeyPayload["plan"], ttlMs: selected.ttlMs, maxBuilds: selected.maxBuilds, label: selected.label, timestamp } as const;
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : "Claim verification failed" } as const;
  }
}

export function createAccessKeyFromClaim(plan: AccessKeyPayload["plan"], claimId: string) {
  const selected = plans[plan];
  const issuedAt = Number(claimId.split("_")[1]) || Date.now();
  const payload: AccessKeyPayload = {
    v: 1,
    sub: hashValue(claimId).slice(0, 24),
    plan,
    iat: issuedAt,
    exp: issuedAt + selected.ttlMs,
    maxBuilds: selected.maxBuilds
  };
  const encoded = base64url(JSON.stringify(payload));
  return `bbx_${encoded}.${sign(`key.${encoded}`)}`;
}

export function verifyAccessKey(key: string | null | undefined) {
  if (!key || !key.startsWith("bbx_")) return { valid: false, error: "Missing access key" } as const;
  const [encodedWithPrefix, signature] = key.split(".");
  const encoded = encodedWithPrefix?.replace(/^bbx_/, "");
  if (!encoded || !signature) return { valid: false, error: "Invalid access key format" } as const;
  try {
    const expected = sign(`key.${encoded}`);
    if (!safeEqual(signature, expected)) return { valid: false, error: "Invalid access key signature" } as const;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AccessKeyPayload;
    if (payload.v !== 1 || !payload.exp || !payload.sub) return { valid: false, error: "Invalid access key payload" } as const;
    if (Date.now() > payload.exp) return { valid: false, error: "Access key expired" } as const;
    return { valid: true, payload } as const;
  } catch {
    return { valid: false, error: "Access key verification failed" } as const;
  }
}

export function getAccessKeyFromRequest(request: Request) {
  return request.headers.get("x-build-key") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
}
