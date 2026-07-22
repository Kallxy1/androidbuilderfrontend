import { NextResponse } from "next/server";
import { authorized, githubConfig, githubFetch, unauthorizedResponse } from "@/lib/github";
import { buildQuotaLimit, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const allowedTypes = new Set(["android", "flutter", "java", "kotlin", "dart"]);
const allowedVariants = new Set(["debug", "release"]);
const allowedOutputs = new Set(["apk", "aab", "jar", "zip"]);
const allowedSdks = new Set(["34", "35", "36"]);

function sourceUrlAllowed(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    const extraHosts = (process.env.BLOB_ALLOWED_HOSTS || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
    return host.endsWith(".public.blob.vercel-storage.com") || host === "public.blob.vercel-storage.com" || extraHosts.includes(host);
  } catch {
    return false;
  }
}

async function findRecentRun(config: ReturnType<typeof githubConfig>, startedAt: number) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, attempt < 3 ? 900 : 1500));
    const runs = await githubFetch(`/repos/${config.owner}/${config.repo}/actions/workflows/${config.workflow}/runs?branch=${encodeURIComponent(config.ref)}&event=workflow_dispatch&per_page=10`);
    const data = await runs.json();
    const candidates = (data.workflow_runs || []).filter((run: { created_at: string }) => new Date(run.created_at).getTime() >= startedAt - 10_000);
    if (candidates[0]) return candidates[0];
  }
  return null;
}

export async function POST(request: Request) {
  if (!authorized(request)) return unauthorizedResponse();
  const limited = rateLimit(request, "dispatch", 6, 10 * 60 * 1000);
  if (!limited.ok) return NextResponse.json({ error: "Terlalu banyak request build. Tunggu sebentar." }, { status: 429 });
  const quota = buildQuotaLimit(request);
  if (!quota.ok) return NextResponse.json({ error: "Quota build access key sudah habis. Ambil key baru setelah expired atau tunggu cooldown." }, { status: 429 });

  try {
    const body = await request.json();
    const type = String(body.type || "");
    const variant = String(body.variant || "debug");
    const output = String(body.output || "apk");
    const sdk = String(body.sdk || "35");
    const sourceUrl = String(body.sourceUrl || "");
    if (!sourceUrl || !sourceUrlAllowed(sourceUrl)) return NextResponse.json({ error: "sourceUrl harus berasal dari temporary upload BuildBox yang valid" }, { status: 400 });
    if (!allowedTypes.has(type)) return NextResponse.json({ error: "Unsupported project type" }, { status: 400 });
    if (!allowedVariants.has(variant) || !allowedOutputs.has(output) || !allowedSdks.has(sdk)) return NextResponse.json({ error: "Invalid build settings" }, { status: 400 });

    const config = githubConfig();
    const buildId = `bbx-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const startedAt = Date.now();
    const response = await githubFetch(`/repos/${config.owner}/${config.repo}/actions/workflows/${config.workflow}/dispatches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: config.ref, inputs: { source_url: sourceUrl, project_type: type, variant, output, sdk, build_id: buildId } })
    });
    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: `GitHub dispatch failed: ${detail}. Check GITHUB_OWNER, GITHUB_REPO, GITHUB_WORKFLOW, GITHUB_REF, and token Actions: Read/write.` }, { status: response.status });
    }

    const run = await findRecentRun(config, startedAt);
    if (!run) return NextResponse.json({ error: "Workflow started, tapi runId belum muncul. Coba refresh status GitHub Actions atau start ulang beberapa detik lagi." }, { status: 502 });
    return NextResponse.json({ id: buildId, buildId, runId: run.id, status: run.status, url: run.html_url, quotaRemaining: quota.remaining });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Build could not start" }, { status: 500 });
  }
}
