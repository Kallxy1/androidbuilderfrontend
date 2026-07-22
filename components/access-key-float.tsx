"use client";

import { useEffect, useState } from "react";
import { X, KeyRound } from "lucide-react";
import Link from "next/link";

export function AccessKeyFloat() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const dismissed = window.localStorage.getItem("buildbox-access-key-dismissed");
    setVisible(dismissed !== "1");
  }, []);
  function close(event: React.MouseEvent) {
    event.preventDefault(); event.stopPropagation(); setVisible(false); window.localStorage.setItem("buildbox-access-key-dismissed", "1");
  }
  if (!visible) return null;
  return <div className="fixed bottom-24 left-3 z-40 sm:bottom-28 sm:left-5">
    <Link href="/access-key" aria-label="Get access key" className="access-float group relative block w-[92px] rounded-2xl border border-border bg-background p-2 shadow-2xl transition-transform hover:scale-105 sm:w-[118px]">
      <button type="button" aria-label="Close access key promo" onClick={close} className="absolute -right-2 -top-2 z-10 flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow hover:text-foreground"><X className="size-3.5" /></button>
      <div className="access-gif relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-muted"><img src="/access-key.gif" alt="Get access key" className="size-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /><KeyRound className="absolute size-8 text-muted-foreground/70" /></div>
      <div className="px-1 pb-1 pt-2 text-center text-[11px] font-bold leading-tight">Dapatkan<br />Access Key</div>
    </Link>
  </div>;
}
