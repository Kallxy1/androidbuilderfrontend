import JSZip from "jszip";
import { NextResponse } from "next/server";
import { authorized, githubConfig, githubFetch, unauthorizedResponse } from "@/lib/github";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const allowedOutputs = [".apk", ".aab", ".jar", ".zip"];

export async function GET(request: Request) {
  if (!authorized(request)) return unauthorizedResponse();
  const limited = rateLimit(request, "artifact", 20, 10 * 60 * 1000);
  if (!limited.ok) return NextResponse.json({ error: "Terlalu banyak request download." }, { status: 429 });
  try {
    const runId = new URL(request.url).searchParams.get("runId");
    if (!runId || !/^\d+$/.test(runId)) {
      return NextResponse.json({ error: "Valid runId is required" }, { status: 400 });
    }

    const config = githubConfig();
    const list = await githubFetch(`/repos/${config.owner}/${config.repo}/actions/runs/${runId}/artifacts`);
    const data = await list.json();
    const artifact = data.artifacts?.find(
      (item: { name: string; expired: boolean }) => item.name === "build-output" && !item.expired
    ) || data.artifacts?.find((item: { expired: boolean }) => !item.expired);

    if (!artifact) return NextResponse.json({ error: "Artifact not found or expired" }, { status: 404 });

    const download = await githubFetch(`/repos/${config.owner}/${config.repo}/actions/artifacts/${artifact.id}/zip`);
    if (!download.ok) return NextResponse.json({ error: "Artifact download failed" }, { status: download.status });

    const artifactZip = await download.arrayBuffer();
    const zip = await JSZip.loadAsync(artifactZip);
    const files = Object.values(zip.files).filter((file) => !file.dir);
    const output = files.find((file) => allowedOutputs.some((extension) => file.name.toLowerCase().endsWith(extension)));

    if (!output) {
      return new NextResponse(artifactZip, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${artifact.name}.zip"`,
          "Cache-Control": "no-store"
        }
      });
    }

    const content = await output.async("uint8array");
    const lowerName = output.name.toLowerCase();
    const extension = allowedOutputs.find((item) => lowerName.endsWith(item)) || ".bin";
    const contentType = extension === ".apk"
      ? "application/vnd.android.package-archive"
      : extension === ".aab"
        ? "application/octet-stream"
        : extension === ".jar"
          ? "application/java-archive"
          : "application/zip";

    return new NextResponse(Buffer.from(content), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${output.name.split("/").pop() || `build${extension}`}"`,
        "Content-Length": String(content.byteLength),
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Download failed" }, { status: 500 });
  }
}
