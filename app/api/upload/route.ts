import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { authorized, unauthorizedResponse } from "@/lib/github";
import { rateLimit } from "@/lib/rate-limit";
import { inspectZip } from "@/lib/zip-security";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!authorized(request)) return unauthorizedResponse();
  const limited = rateLimit(request, "upload", 8, 10 * 60 * 1000);
  if (!limited.ok) return NextResponse.json({ error: "Too many uploads. Tunggu sebentar lalu coba lagi." }, { status: 429 });

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "ZIP file is required" }, { status: 400 });
    if (!file.name.toLowerCase().endsWith(".zip")) return NextResponse.json({ error: "Only .zip files are accepted" }, { status: 400 });
    if (file.size > 100 * 1024 * 1024) return NextResponse.json({ error: "ZIP maximum is 100 MB" }, { status: 413 });

    const buffer = await file.arrayBuffer();
    const report = await inspectZip(buffer);
    if (report.tooManyFiles) return NextResponse.json({ error: "ZIP berisi terlalu banyak file. Maksimal 5000 file." }, { status: 400 });
    if (report.unsafePaths.length) return NextResponse.json({ error: "ZIP mengandung path tidak aman.", detail: report.unsafePaths.slice(0, 5) }, { status: 400 });
    if (report.sensitive.length) {
      return NextResponse.json({
        error: "ZIP terlihat mengandung file sensitif. Hapus file credential/keystore/.env sebelum upload.",
        detail: report.sensitive.slice(0, 8)
      }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
    const blob = await put(`build-input/${crypto.randomUUID()}-${safeName}`, new Blob([buffer], { type: "application/zip" }), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/zip"
    });
    return NextResponse.json({ url: blob.url, fileCount: report.fileCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    const friendly = message.toLowerCase().includes("store does not exist")
      ? "Vercel Blob store tidak terhubung ke project ini. Di Vercel buka Storage → Blob → Connect Store, lalu redeploy."
      : message;
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
