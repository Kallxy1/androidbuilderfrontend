import { NextResponse } from "next/server";
import { getAccessKeyFromRequest, verifyAccessKey } from "@/lib/access-keys";

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const token = process.env.GITHUB_TOKEN;
// Workflow ID is stable and avoids GitHub's 404 when a filename/env value is stale.
const workflow = process.env.GITHUB_WORKFLOW || "build-universal.yml";
const ref = process.env.GITHUB_REF || "main";

export function githubConfig() {
  if (!owner || !repo || !token) throw new Error("Missing GITHUB_OWNER, GITHUB_REPO or GITHUB_TOKEN");
  return { owner, repo, token, workflow, ref };
}

export function authorized(request: Request) {
  const expected = process.env.BUILD_ACCESS_KEY;
  const provided = getAccessKeyFromRequest(request);

  // Static admin/personal key for private deployments.
  if (expected && provided === expected) return true;

  // Reward/generated access key. Requires ACCESS_KEY_SECRET.
  const signed = verifyAccessKey(provided);
  if (signed.valid) return true;

  // If no protection env is configured, keep local/dev usage open.
  if (!expected && !process.env.ACCESS_KEY_SECRET) return true;

  return false;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Valid build access key is required" }, { status: 401 });
}

export async function githubFetch(path: string, init: RequestInit = {}) {
  const { token } = githubConfig();
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers || {})
    },
    cache: "no-store"
  });
}
