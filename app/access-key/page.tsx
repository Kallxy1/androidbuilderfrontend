"use client";

import Link from "next/link";
import { ArrowLeft, Clock3, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccessKeyPage() {
  return <main className="mx-auto min-h-screen max-w-xl px-5 py-8 sm:py-14">
    <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Kembali ke compiler</Link>
    <section className="card p-6 text-center sm:p-8">
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-foreground text-background"><KeyRound className="size-8" /></div>
      <h1 className="text-3xl font-black tracking-tight">Dapatkan Access Key</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Access key nantinya berlaku 7 hari. Satu user dapat mengambil satu key setelah menyelesaikan rewarded ad.</p>
      <div className="mt-7 grid gap-3 text-left text-sm"><div className="flex gap-3 rounded-xl bg-muted p-4"><Clock3 className="mt-0.5 size-4 shrink-0" /><span>Key memiliki masa berlaku dan otomatis expired.</span></div><div className="flex gap-3 rounded-xl bg-muted p-4"><ShieldCheck className="mt-0.5 size-4 shrink-0" /><span>Key dibuat random dan disimpan dalam bentuk hash di server.</span></div></div>
      <div className="mt-7 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">Rewarded ad belum dikonfigurasi. Setelah Monetag Zone ID dan postback dipasang, tombol klaim akan aktif di halaman ini.</div>
      <Button className="mt-6 w-full" disabled>Watch 30s ad → Get access key</Button>
    </section>
    <p className="mt-6 text-center text-xs text-muted-foreground">Made XyStudio · Dev XyKelOmex</p>
  </main>;
}
