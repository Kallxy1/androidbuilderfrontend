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
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 });
  }
}
