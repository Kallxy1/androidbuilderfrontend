"use client";

import { Footprints, LoaderCircle, Terminal } from "lucide-react";

type Props = { status?: string; currentStep?: string; message: string; startedAt?: number };

const phaseNames = ["Preparing project", "Installing toolchain", "Detecting project", "Compiling source", "Packaging output", "Uploading artifact"];

export function BuildProgress({ status, currentStep, message, startedAt }: Props) {
  const active = (currentStep || message || "").toLowerCase();
  const phase = !status ? 0 : active.includes("download") || active.includes("prepar") ? 1 : active.includes("setup") || active.includes("install") ? 2 : active.includes("detect") ? 3 : active.includes("build") || active.includes("gradle") || active.includes("compile") ? 4 : active.includes("upload") ? 6 : status === "success" ? 6 : 1;
  const percent = !status ? 0 : status === "success" ? 100 : status === "failure" ? 100 : Math.min(94, Math.max(5, Math.round((phase / 6) * 100)));
  const elapsed = startedAt ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000)) : 0;
  const time = elapsed ? `${Math.floor(elapsed / 60)}m ${String(elapsed % 60).padStart(2, "0")}s` : "starting...";
  return <div className="mt-6 w-full"><div className="mb-5 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="flex size-14 items-center justify-center rounded-full bg-black/20 text-muted-foreground dark:bg-black/30">{status === "in_progress" || status === "queued" ? <LoaderCircle className="size-7 animate-spin" /> : <Terminal className="size-7" />}</div><div className="text-left"><div className="text-lg font-bold">{status === "success" ? "Build complete" : status === "failure" ? "Build failed" : "In progress"}</div><div className="text-xs text-muted-foreground">{currentStep || message}</div></div></div><Footprints className="size-7 text-yellow-500" /></div><div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground"><span>Phase {Math.min(6, phase)} / 6</span><span>{percent}%</span></div><div className="h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-foreground transition-all duration-700" style={{ width: `${percent}%` }} /></div><div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>{message}</span><span>Elapsed {time}</span></div><div className="mt-5 grid grid-cols-3 gap-2 text-[10px] text-muted-foreground sm:grid-cols-6">{phaseNames.map((name, index) => <div key={name} className={index + 1 <= phase ? "font-bold text-foreground" : ""}>{index + 1}. {name}</div>)}</div></div>;
}
