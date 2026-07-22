import Link from "next/link";
import { ArrowLeft, Clock3, KeyRound, ShieldCheck, TimerReset } from "lucide-react";

export default function AccessKeyPage() {
  return <main className="mx-auto min-h-screen max-w-xl px-5 py-8 sm:py-14">
    <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Kembali ke compiler</Link>
    <section className="card p-6 text-center sm:p-8">
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-foreground text-background"><KeyRound className="size-8" /></div>
      <h1 className="text-3xl font-black tracking-tight">Dapatkan Access Key</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Access key dipakai untuk membatasi build agar layanan tetap stabil, aman, dan tidak disalahgunakan.</p>
      <div className="mt-7 grid gap-3 text-left text-sm">
        <div className="flex gap-3 rounded-xl bg-muted p-4"><Clock3 className="mt-0.5 size-4 shrink-0" /><span>Rekomendasi key reward berlaku 1 hari dengan kuota build terbatas.</span></div>
        <div className="flex gap-3 rounded-xl bg-muted p-4"><TimerReset className="mt-0.5 size-4 shrink-0" /><span>Link klaim sementara berlaku 30 menit dan tidak menyimpan key asli di URL.</span></div>
        <div className="flex gap-3 rounded-xl bg-muted p-4"><ShieldCheck className="mt-0.5 size-4 shrink-0" /><span>Key dibuat random/signature dan diverifikasi server-side sebelum build dimulai.</span></div>
      </div>
      <div className="mt-7 rounded-xl border border-border bg-muted p-5 text-sm text-muted-foreground">Rewarded access sedang disiapkan untuk penayangan yang sesuai kebijakan. Jika kamu tester, minta link klaim sementara dari admin XyStudio.</div>
    </section>
    <p className="mt-6 text-center text-xs text-muted-foreground">Made XyStudio · Dev XyKelOmex</p>
  </main>;
}
