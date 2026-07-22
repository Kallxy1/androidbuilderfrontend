"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Footprints, LoaderCircle, Terminal, XCircle } from "lucide-react";

type Props = { status?: string; currentStep?: string; message: string; startedAt?: number };

const phaseNames = ["Preparing project", "Installing toolchain", "Detecting project", "Compiling source", "Packaging output", "Uploading artifact"];

function phaseFromText(status: string | undefined, text: string) {
  const active = text.toLowerCase();
  if (!status) return 0;
  if (status === "success") return 6;
  if (status === "failure" || status === "cancelled") return 6;
  if (active.includes("download") || active.includes("prepar") || active.includes("uploading project")) return 1;
  if (active.includes("setup") || active.includes("install") || active.includes("jdk") || active.includes("sdk") || active.includes("flutter")) return 2;
  if (active.includes("detect") || active.includes("root")) return 3;
  if (active.includes("build") || active.includes("gradle") || active.includes("compile") || active.includes("assemble") || active.includes("bundle")) return 4;
  if (active.includes("package") || active.includes("output") || active.includes("artifact")) return 5;
  if (active.includes("upload")) return 6;
  return status === "queued" ? 1 : 2;
}

export function BuildProgress({ status, currentStep, message, startedAt }: Props) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const text = currentStep || message || "";
  const phase = useMemo(() => phaseFromText(status, text), [status, text]);
  const percent = !status ? 0 : status === "success" ? 100 : status === "failure" || status === "cancelled" ? 100 : Math.min(96, Math.max(8, Math.round((phase / 6) * 100)));
  const elapsed = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
  const time = elapsed ? `${Math.floor(elapsed / 60)}m ${String(elapsed % 60).padStart(2, "0")}s` : "starting...";
  const icon = status === "success" ? <CheckCircle2 className="size-7 text-green-500" /> : status === "failure" || status === "cancelled" ? <XCircle className="size-7 text-red-500" /> : status === "in_progress" || status === "queued" ? <LoaderCircle className="size-7 animate-spin" /> : <Terminal className="size-7" />;

  return <div className="mt-6 w-full">
    <div className="mb-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-full bg-black/20 text-muted-foreground dark:bg-black/30">{icon}</div>
        <div className="text-left"><div className="text-lg font-bold">{status === "success" ? "Build complete" : status === "failure" ? "Build failed" : status === "cancelled" ? "Build cancelled" : "In progress"}</div><div className="text-xs text-muted-foreground">{text || "Ready"}</div></div>
      </div>
      <Footprints className="size-7 text-yellow-500" />
    </div>
    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground"><span>Phase {Math.min(6, phase)} / 6</span><span>{percent}%</span></div>
    <div className="h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-foreground transition-all duration-500" style={{ width: `${percent}%` }} /></div>
    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground"><span className="truncate">{message}</span><span className="shrink-0">Elapsed {time}</span></div>
    <div className="mt-5 grid grid-cols-3 gap-2 text-[10px] text-muted-foreground sm:grid-cols-6">{phaseNames.map((name, index) => <div key={name} className={index + 1 <= phase ? "font-bold text-foreground" : ""}>{index + 1}. {name}</div>)}</div>
  </div>;
}
