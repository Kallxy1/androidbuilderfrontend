import { NextResponse } from "next/server";
import { authorized, githubConfig, githubFetch, unauthorizedResponse } from "@/lib/github";

export const runtime = "nodejs";

const allowedTypes = new Set(["android", "flutter", "java", "kotlin", "dart"]);
const allowedVariants = new Set(["debug", "release"]);
const allowedOutputs = new Set(["apk", "aab", "jar", "zip"]);
const allowedSdks = new Set(["34", "35", "36"]);

export async function POST(request: Request) {
  if (!authorized(request)) return unauthorizedResponse();
  try {
    const body = await request.json();
    const type = String(body.type || "");
    const variant = String(body.variant || "debug");
    const output = String(body.output || "apk");
    const sdk = String(body.sdk || "35");
    const sourceUrl = String(body.sourceUrl || "");
    if (!sourceUrl || !/^https:\/\//i.test(sourceUrl)) return NextResponse.json({ error: "Valid sourceUrl is required" }, { status: 400 });
    if (!allowedTypes.has(type)) return NextResponse.json({ error: "Unsupported project type" }, { status: 400 });
    if (!allowedVariants.has(variant) || !allowedOutputs.has(output) || !allowedSdks.has(sdk)) return NextResponse.json({ error: "Invalid build settings" }, { status: 400 });

    const config = githubConfig();
    const response = await githubFetch(`/repos/${config.owner}/${config.repo}/actions/workflows/${config.workflow}/dispatches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: config.ref, inputs: { source_url: sourceUrl, project_type: type, variant, output, sdk } })
    });
    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: `GitHub dispatch failed: ${detail}. Check GITHUB_OWNER, GITHUB_REPO, GITHUB_WORKFLOW (use 317945091), GITHUB_REF, and token Actions: Read and write.` }, { status: response.status });
    }
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const runs = await githubFetch(`/repos/${config.owner}/${config.repo}/actions/workflows/${config.workflow}/runs?per_page=5`);
    const data = await runs.json();
    const run = data.workflow_runs?.[0];
    if (!run) return NextResponse.json({ error: "Workflow started but run was not found yet" }, { status: 502 });
    return NextResponse.json({ id: crypto.randomUUID(), runId: run.id, status: run.status, url: run.html_url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Build could not start" }, { status: 500 });
  }
}
