"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Terminal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { runId?: number; accessKey: string };
type Step = { name: string; status: string; conclusion: string | null; startedAt?: string; completedAt?: string };

function formatSteps(steps: Step[]) {
  if (!steps.length) return "Waiting for GitHub job steps...";
  return steps.map((step, index) => {
    const mark = step.conclusion === "success" ? "✓" : step.conclusion === "failure" ? "✗" : step.status === "in_progress" ? "…" : "·";
    const suffix = step.conclusion ? ` (${step.conclusion})` : step.status === "in_progress" ? " (running)" : "";
    return `${String(index + 1).padStart(2, "0")} ${mark} ${step.name}${suffix}`;
  }).join("\n");
}

export function TerminalBubble({ runId, accessKey }: Props) {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState("Waiting for a build...");
  const [step, setStep] = useState("Waiting for a build...");
  const [steps, setSteps] = useState<Step[]>([]);
  const [lastUpdate, setLastUpdate] = useState("");
  const preRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    if (!runId) return;
    let alive = true;
    const load = async () => {
      const headers = { "x-build-key": accessKey };
      const status = await fetch(`/api/build-status?runId=${runId}`, { headers, cache: "no-store" });
      if (status.ok) {
        const data = await status.json();
        if (alive) {
          setStep(data.currentStep || data.status);
          setSteps(data.steps || []);
          setLastUpdate(new Date().toLocaleTimeString("id-ID"));
          if (!data.steps?.length) setLogs((current) => current === "Waiting for a build..." ? "GitHub run queued. Waiting for job steps..." : current);
        }
      }
      const response = await fetch(`/api/build-logs?runId=${runId}`, { headers, cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        if (alive && data.logs) setLogs(data.logs);
      }
    };
    load();
    const timer = window.setInterval(load, open ? 1500 : 2500);
    return () => { alive = false; window.clearInterval(timer); };
  }, [runId, accessKey, open]);

  useEffect(() => {
    if (open && preRef.current) preRef.current.scrollTop = preRef.current.scrollHeight;
  }, [open, logs, steps]);

  const terminalText = useMemo(() => {
    const live = `===== Live GitHub Steps =====\n${formatSteps(steps)}\n${lastUpdate ? `\nLast update: ${lastUpdate}\n` : ""}`;
    const realLogs = logs && !logs.startsWith("Waiting") ? `\n===== Downloaded Logs =====\n${logs}` : "\nLogs zip biasanya tersedia setelah GitHub membuat log artifact. Step list di atas lebih realtime.";
    return `${live}${realLogs}`;
  }, [steps, logs, lastUpdate]);

  return <>
    <button aria-label="Open terminal logs" onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-40 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-border bg-foreground px-4 py-3 text-sm font-bold text-background shadow-2xl transition-transform hover:scale-105"><Terminal className="size-4 shrink-0" /><span className="truncate">{runId ? step : "Terminal log"}</span></button>
    {open && <div className="fixed inset-0 z-50 bg-black/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="absolute bottom-4 right-4 flex h-[min(74vh,680px)] w-[min(94vw,900px)] flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-[#09090b] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3"><div className="min-w-0 text-sm font-bold text-zinc-200"><div className="flex items-center gap-2"><span className="size-2 shrink-0 rounded-full bg-green-400" />Build terminal {runId ? `#${runId}` : ""}</div><div className="mt-1 truncate text-xs font-normal text-yellow-300">Live step: {step}</div></div><Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white"><X className="size-4" /></Button></div>
        <pre ref={preRef} className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-4 text-[11px] leading-5 text-zinc-300">{terminalText}</pre>
      </div>
    </div>}
  </>;
}
