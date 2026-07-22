"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";

export function AccessKeyFloat() {
  const [visible, setVisible] = useState(false); const [position, setPosition] = useState({ x: 0, y: 110 }); const dragging = useRef(false); const offset = useRef({ x: 0, y: 0 });
  useEffect(() => { const dismissed = window.localStorage.getItem("buildbox-access-key-dismissed"); const saved = window.localStorage.getItem("buildbox-access-key-position"); if (saved) { try { setPosition(JSON.parse(saved)); } catch {} } else setPosition({ x: Math.max(12, window.innerWidth - 154), y: 110 }); setVisible(dismissed !== "1"); }, []);
  function start(event: React.PointerEvent<HTMLDivElement>) { dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); offset.current = { x: event.clientX - position.x, y: event.clientY - position.y }; }
  function move(event: React.PointerEvent<HTMLDivElement>) { if (!dragging.current) return; const x = Math.max(8, Math.min(window.innerWidth - 120, event.clientX - offset.current.x)); const y = Math.max(56, Math.min(window.innerHeight - 120, event.clientY - offset.current.y)); setPosition({ x, y }); }
  function end() { if (!dragging.current) return; dragging.current = false; window.localStorage.setItem("buildbox-access-key-position", JSON.stringify(position)); }
  function close(event: React.MouseEvent) { event.preventDefault(); event.stopPropagation(); setVisible(false); window.localStorage.setItem("buildbox-access-key-dismissed", "1"); }
  if (!visible) return null;
  return <div className="fixed z-40 touch-none select-none" style={{ left: position.x, top: position.y }} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
    <Link href="/access-key" aria-label="Get access key" className="group relative block w-[128px] cursor-grab active:cursor-grabbing sm:w-[154px]">
      <button type="button" aria-label="Close access key promo" onPointerDown={(event) => event.stopPropagation()} onClick={close} className="absolute -right-2 -top-2 z-10 flex size-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-lg hover:text-foreground"><X className="size-4" /></button>
      <img src="/access-key.gif" alt="Get access key" className="block w-full rounded-2xl shadow-2xl" />
    </Link>
  </div>;
}
