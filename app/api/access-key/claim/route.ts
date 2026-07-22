import { NextResponse } from "next/server";
import { createClaimId, getPlan, signClaim } from "@/lib/access-keys";
import { rateLimit } from "@/lib/rate-limit";
import { saveRewardClaim } from "@/lib/claim-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limited = rateLimit(request, "access-key-claim", 5, 24 * 60 * 60 * 1000);
  if (!limited.ok) return NextResponse.json({ error: "Klaim access key terlalu sering. Coba lagi besok." }, { status: 429 });

  const secret = process.env.REWARD_CLAIM_SECRET;
  const provided = request.headers.get("x-reward-secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Reward verification is not configured yet" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const plan = String(body.plan || "1day");
    const selected = getPlan(plan);
    if (!selected) return NextResponse.json({ error: "Invalid access key duration" }, { status: 400 });

    const claimId = createClaimId();
    const signature = signClaim(plan as "1day" | "3days" | "7days", claimId);
    const now = Date.now();
    await saveRewardClaim({
      plan: plan as "1day" | "3days" | "7days",
      claimId,
      signature,
      createdAt: now,
      expiresAt: now + 30 * 60 * 1000,
      status: "pending"
    });
    const origin = new URL(request.url).origin;
    return NextResponse.json({
      url: `${origin}/key/${plan}/${claimId}/${signature}`,
      expiresInMinutes: 30,
      accessKeyTtlMs: selected.ttlMs,
      maxBuilds: selected.maxBuilds
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create claim" }, { status: 500 });
  }
}
