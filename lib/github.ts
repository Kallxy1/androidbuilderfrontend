import { NextResponse } from "next/server";

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const token = process.env.GITHUB_TOKEN;
// Workflow ID is stable and avoids GitHub's 404 when a filename/env value is stale.
const workflow = process.env.GITHUB_WORKFLOW || "317945091";
const ref = process.env.GITHUB_REF || "main";

export function githubConfig() {
  if (!owner || !repo || !token) throw new Error("Missing GITHUB_OWNER, GITHUB_REPO or GITHUB_TOKEN");
  return { owner, repo, token, workflow, ref };
}

export function authorized(request: Request) {
  const expected = process.env.BUILD_ACCESS_KEY;
  if (!expected) return true;
  return request.headers.get("x-build-key") === expected;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Build access key is required" }, { status: 401 });
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
