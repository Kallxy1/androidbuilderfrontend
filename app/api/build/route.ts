import { NextResponse } from "next/server";
import { authorized, githubConfig, githubFetch, unauthorizedResponse } from "@/lib/github";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!authorized(request)) return unauthorizedResponse();
  try {
    const body = await request.json();
    if (!body.sourceUrl || !body.type) return NextResponse.json({ error: "sourceUrl and type are required" }, { status: 400 });
    const config = githubConfig();
    const response = await githubFetch(`/repos/${config.owner}/${config.repo}/actions/workflows/${config.workflow}/dispatches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: config.ref, inputs: { source_url: body.sourceUrl, project_type: body.type, variant: body.variant || "debug", output: body.output || "apk", sdk: body.sdk || "35" } })
    });
    if (!response.ok) return NextResponse.json({ error: `GitHub dispatch failed: ${await response.text()}` }, { status: response.status });
    // GitHub dispatch returns 204; find the newest run after dispatch.
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
