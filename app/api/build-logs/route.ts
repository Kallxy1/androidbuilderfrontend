import JSZip from "jszip";
import { NextResponse } from "next/server";
import { authorized, githubConfig, githubFetch, unauthorizedResponse } from "@/lib/github";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!authorized(request)) return unauthorizedResponse();
  const limited = rateLimit(request, "logs", 60, 5 * 60 * 1000);
  if (!limited.ok) return NextResponse.json({ error: "Log polling terlalu sering." }, { status: 429 });
  try {
    const runId = new URL(request.url).searchParams.get("runId");
    if (!runId || !/^\d+$/.test(runId)) return NextResponse.json({ error: "Valid runId is required" }, { status: 400 });
    const config = githubConfig();
    const response = await githubFetch(`/repos/${config.owner}/${config.repo}/actions/runs/${runId}/logs`);
    if (!response.ok) return NextResponse.json({ error: "Logs are not ready yet" }, { status: response.status });
    const zip = await JSZip.loadAsync(await response.arrayBuffer());
    const entries = Object.values(zip.files).filter((file) => !file.dir && file.name.endsWith(".txt"));
    const logs = (await Promise.all(entries.map(async (file) => `\n===== ${file.name} =====\n${await file.async("text")}`))).join("\n");
    return NextResponse.json({ logs: logs.slice(-120000) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not read logs" }, { status: 500 });
  }
}
