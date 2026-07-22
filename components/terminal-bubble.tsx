"use client";

import { useEffect, useState } from "react";
import { Terminal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { runId?: number; accessKey: string };

export function TerminalBubble({ runId, accessKey }: Props) {
  const [open, setOpen] = useState(false); const [logs, setLogs] = useState("Waiting for a build...");
  useEffect(() => { if (!runId) return; let alive = true; const load = async () => { const response = await fetch(`/api/build-logs?runId=${runId}`, { headers: { "x-build-key": accessKey }, cache: "no-store" }); if (response.ok) { const data = await response.json(); if (alive && data.logs) setLogs(data.logs); } }; load(); const timer = setInterval(load, 2500); return () => { alive = false; clearInterval(timer); }; }, [runId, accessKey]);
  return <><button aria-label="Open terminal logs" onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-border bg-foreground px-4 py-3 text-sm font-bold text-background shadow-2xl transition-transform hover:scale-105"><Terminal className="size-4" />Terminal log</button>{open && <div className="fixed inset-0 z-50 bg-black/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}><div className="absolute bottom-4 right-4 flex h-[min(70vh,620px)] w-[min(94vw,850px)] flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-[#09090b] shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3"><div className="flex items-center gap-2 text-sm font-bold text-zinc-200"><span className="size-2 rounded-full bg-green-400" />Build terminal {runId ? `#${runId}` : ""}</div><Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white"><X className="size-4" /></Button></div><pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-4 text-[11px] leading-5 text-zinc-300">{logs}</pre></div></div>}</>;
}
