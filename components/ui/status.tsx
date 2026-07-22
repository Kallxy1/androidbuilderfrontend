import { CheckCircle2, CircleAlert, LoaderCircle, Clock3, XCircle } from "lucide-react";

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const done = normalized === "success";
  const failed = ["failure", "failed", "cancelled"].includes(normalized);
  const running = ["queued", "in_progress", "building"].includes(normalized);
  const Icon = done ? CheckCircle2 : failed ? XCircle : running ? LoaderCircle : normalized === "ready" ? CheckCircle2 : normalized === "error" ? CircleAlert : Clock3;
  return <span className={`status-badge ${done ? "status-success" : failed ? "status-failed" : running ? "status-running" : "status-idle"}`}><Icon className={running ? "animate-spin" : ""} />{status.replaceAll("_", " ")}</span>;
}
