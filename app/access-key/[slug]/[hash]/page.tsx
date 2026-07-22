import Link from "next/link";
import { Clock3, KeyRound, ShieldCheck } from "lucide-react";

export default async function AccessKeyCard({ params }: { params: Promise<{ slug: string; hash: string }> }) {
  const { slug, hash } = await params;
  return <main className="mx-auto min-h-screen max-w-xl px-5 py-10 sm:py-16">
    <Link href="/access-key" className="text-sm text-muted-foreground hover:text-foreground">← Kembali ke Access Key</Link>
    <section className="card mt-8 p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-foreground text-background"><KeyRound className="size-6" /></div>
        <div><h1 className="text-xl font-black">Access Key Info</h1><p className="text-xs text-muted-foreground">Protected info · {slug}</p></div>
      </div>
      <div className="rounded-2xl border border-border bg-muted p-5 text-sm leading-6 text-muted-foreground">
        Halaman ini hanya untuk informasi dynamic route lama. Access key asli sekarang diterbitkan lewat route aman <span className="font-mono">/key/[duration]/[claim]/[signature]</span> setelah reward diverifikasi.
      </div>
      <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
        <div className="flex gap-3"><Clock3 className="size-4 shrink-0" />Claim link dibuat sekali pakai secara server-side dan expired cepat.</div>
        <div className="flex gap-3"><ShieldCheck className="size-4 shrink-0" />Hash route: <span className="truncate font-mono">{hash}</span></div>
      </div>
    </section>
  </main>;
}
