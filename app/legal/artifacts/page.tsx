import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ArtifactPolicyIndex() {
  redirect(`/legal/artifacts/${Math.random().toString(36).slice(2, 12)}`);
}
