import { NextResponse } from "next/server";
import { authorized, githubConfig, githubFetch, unauthorizedResponse } from "@/lib/github";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!authorized(request)) return unauthorizedResponse();
  const limited = rateLimit(request, "status", 120, 5 * 60 * 1000);
  if (!limited.ok) return NextResponse.json({ error: "Status polling terlalu sering." }, { status: 429 });

  try {
    const runId = new URL(request.url).searchParams.get("runId");
    if (!runId || !/^\d+$/.test(runId)) return NextResponse.json({ error: "Valid runId is required" }, { status: 400 });
    const config = githubConfig();
    const response = await githubFetch(`/repos/${config.owner}/${config.repo}/actions/runs/${runId}`);
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data.message || "Status failed" }, { status: response.status });

    const jobsResponse = await githubFetch(`/repos/${config.owner}/${config.repo}/actions/runs/${runId}/jobs?per_page=20`);
    const jobsData = await jobsResponse.json();
    const job = jobsData.jobs?.[0];
    const steps = job?.steps?.map((step: { name: string; status: string; conclusion: string | null; started_at?: string; completed_at?: string }) => ({
      name: step.name,
      status: step.status,
      conclusion: step.conclusion,
      startedAt: step.started_at,
      completedAt: step.completed_at
    })) || [];
    const activeStep = steps.find((step: { status: string }) => step.status === "in_progress") || steps.find((step: { conclusion: string | null }) => step.conclusion === null);
    const status = data.status === "completed" ? (data.conclusion === "success" ? "success" : data.conclusion || "failure") : data.status;

    return NextResponse.json({
      status,
      conclusion: data.conclusion,
      url: data.html_url,
      runStartedAt: data.run_started_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      currentStep: activeStep?.name || job?.name || status,
      steps
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Status failed" }, { status: 500 });
  }
}
