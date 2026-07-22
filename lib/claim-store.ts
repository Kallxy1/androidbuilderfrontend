import { createAccessKeyFromClaim, hashValue, type AccessKeyPayload } from "@/lib/access-keys";

type ClaimRecord = {
  plan: AccessKeyPayload["plan"];
  claimId: string;
  signature: string;
  createdAt: number;
  expiresAt: number;
  status: "pending" | "used";
  usedAt?: number;
  keyHash?: string;
};

const memory = new Map<string, ClaimRecord>();

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

function keyFor(claimId: string) {
  return `bbx:claim:${claimId}`;
}

async function redisCommand<T>(command: unknown[]) {
  const config = redisConfig();
  if (!config) return null;
  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify([command]),
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Redis command failed: ${response.status}`);
  const data = await response.json();
  return data?.[0]?.result as T;
}

export function claimStoreConfigured() {
  return Boolean(redisConfig()) || process.env.ALLOW_IN_MEMORY_CLAIMS === "true";
}

export async function saveRewardClaim(record: ClaimRecord) {
  const ttlSeconds = Math.max(60, Math.ceil((record.expiresAt - Date.now()) / 1000));
  const config = redisConfig();
  if (config) {
    await redisCommand(["SET", keyFor(record.claimId), JSON.stringify(record), "EX", ttlSeconds, "NX"]);
    return;
  }
  if (process.env.ALLOW_IN_MEMORY_CLAIMS === "true") {
    memory.set(record.claimId, record);
    return;
  }
  throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required for one-time claim links");
}

async function getRewardClaim(claimId: string) {
  const config = redisConfig();
  if (config) {
    const raw = await redisCommand<string | null>(["GET", keyFor(claimId)]);
    return raw ? JSON.parse(raw) as ClaimRecord : null;
  }
  if (process.env.ALLOW_IN_MEMORY_CLAIMS === "true") return memory.get(claimId) || null;
  return null;
}

async function updateRewardClaim(record: ClaimRecord) {
  const ttlSeconds = Math.max(60, Math.ceil((record.expiresAt - Date.now()) / 1000));
  const config = redisConfig();
  if (config) {
    await redisCommand(["SET", keyFor(record.claimId), JSON.stringify(record), "EX", ttlSeconds]);
    return;
  }
  if (process.env.ALLOW_IN_MEMORY_CLAIMS === "true") memory.set(record.claimId, record);
}

export async function consumeRewardClaim(plan: AccessKeyPayload["plan"], claimId: string, signature: string) {
  if (!claimStoreConfigured()) {
    return { ok: false, error: "One-time claim storage belum dikonfigurasi. Set Upstash Redis env dulu." } as const;
  }

  const record = await getRewardClaim(claimId);
  if (!record) return { ok: false, error: "Claim tidak ditemukan atau sudah expired" } as const;
  if (record.status !== "pending") return { ok: false, error: "Link klaim sudah pernah dibuka. Ambil access key baru." } as const;
  if (record.plan !== plan || record.signature !== signature) return { ok: false, error: "Claim tidak cocok dengan signature" } as const;
  if (Date.now() > record.expiresAt) return { ok: false, error: "Claim link expired" } as const;

  const accessKey = createAccessKeyFromClaim(plan, claimId);
  const used: ClaimRecord = { ...record, status: "used", usedAt: Date.now(), keyHash: hashValue(accessKey) };
  await updateRewardClaim(used);
  return { ok: true, accessKey } as const;
}
