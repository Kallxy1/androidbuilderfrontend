import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { authorized, unauthorizedResponse } from "@/lib/github";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!authorized(request)) return unauthorizedResponse();
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "ZIP file is required" }, { status: 400 });
    if (!file.name.toLowerCase().endsWith(".zip")) return NextResponse.json({ error: "Only .zip files are accepted" }, { status: 400 });
    if (file.size > 100 * 1024 * 1024) return NextResponse.json({ error: "ZIP maximum is 100 MB" }, { status: 413 });
    const blob = await put(`build-input/${crypto.randomUUID()}-${file.name}`, file, { access: "public", addRandomSuffix: false });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    const friendly = message.toLowerCase().includes("store does not exist")
      ? "Vercel Blob store tidak terhubung ke project ini. Di Vercel buka Storage → Blob → Connect Store ke androidbuilderfrontend, pastikan BLOB_READ_WRITE_TOKEN/BLOB_STORE_ID tersedia, lalu Redeploy."
      : message;
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
