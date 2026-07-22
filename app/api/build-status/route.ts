import { NextResponse } from "next/server";
import { authorized, githubConfig, githubFetch, unauthorizedResponse } from "@/lib/github";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!authorized(request)) return unauthorizedResponse();
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
    const activeStep = job?.steps?.find((step: { status: string }) => step.status === "in_progress") || job?.steps?.find((step: { conclusion: string | null }) => step.conclusion === null);
    const status = data.status === "completed" ? (data.conclusion === "success" ? "success" : data.conclusion || "failure") : data.status;
    return NextResponse.json({ status, url: data.html_url, currentStep: activeStep?.name || job?.name || status, steps: job?.steps?.map((step: { name: string; status: string; conclusion: string | null }) => ({ name: step.name, status: step.status, conclusion: step.conclusion })) || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Status failed" }, { status: 500 });
  }
}
