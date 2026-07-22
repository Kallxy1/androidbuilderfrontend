import Link from "next/link";
import { Clock3, KeyRound, ShieldCheck, Sparkles, Ticket, XCircle } from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";
import { CopyKeyButton } from "@/components/copy-key-button";
import { verifyClaim } from "@/lib/access-keys";
import { consumeRewardClaim } from "@/lib/claim-store";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

function InvalidCard({ error }: { error: string }) {
  return <main className="mx-auto min-h-screen max-w-xl px-5 py-10 sm:py-16">
    <Link href="/access-key" className="text-sm text-muted-foreground hover:text-foreground">← Kembali ke access key</Link>
    <section className="card mt-8 p-6 text-center sm:p-8">
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-red-500/15 text-red-600"><XCircle className="size-8" /></div>
      <h1 className="text-3xl font-black">Voucher sudah tidak tersedia</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{error}. Link voucher hanya bisa dibuka sekali, lalu otomatis hangus.</p>
      <Link href="/access-key" className="btn mt-6 inline-flex h-11 items-center rounded-xl border border-border px-5 font-semibold">Ambil access key baru</Link>
    </section>
  </main>;
}

export default async function RewardKeyPage({ params }: { params: Promise<{ duration: string; claim: string; signature: string }> }) {
  noStore();
  const { duration, claim, signature } = await params;
  const result = verifyClaim(duration, claim, signature);
  if (!result.valid) return <InvalidCard error={result.error} />;

  const consumed = await consumeRewardClaim(result.plan, claim, signature);
  if (!consumed.ok) return <InvalidCard error={consumed.error} />;

  const expiredAt = new Date(result.timestamp + result.ttlMs).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

  return <main className="mx-auto min-h-screen max-w-xl px-5 py-10 sm:py-16">
    <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Kembali ke BuildBox</Link>
    <section className="relative mt-8 overflow-hidden rounded-[28px] border border-border bg-foreground p-1 text-background shadow-2xl">
      <div className="absolute -right-16 -top-16 size-44 rounded-full bg-yellow-300/30 blur-2xl" />
      <div className="absolute -bottom-20 -left-16 size-52 rounded-full bg-white/20 blur-2xl" />
      <div className="relative rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.22),transparent_35%),linear-gradient(135deg,#111113,#27272a)] p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-background text-foreground"><Ticket className="size-7" /></div>
            <div><h1 className="text-2xl font-black">BuildBox Voucher</h1><p className="text-xs text-zinc-300">Access key reward · {result.label}</p></div>
          </div>
          <Sparkles className="size-7 text-yellow-300" />
        </div>

        <div className="rounded-2xl border border-dashed border-zinc-500/80 bg-black/30 p-5 shadow-inner">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-300"><KeyRound className="size-3.5" /> Your access key</div>
          <div className="select-all break-all rounded-xl bg-black/40 p-4 font-mono text-xs font-bold leading-6 text-yellow-200 sm:text-sm">{consumed.accessKey}</div>
          <CopyKeyButton value={consumed.accessKey} />
        </div>

        <div className="mt-5 grid gap-3 text-sm text-zinc-300">
          <div className="flex gap-3 rounded-xl bg-white/5 p-3"><Clock3 className="size-4 shrink-0 text-yellow-300" />Berlaku sampai {expiredAt}. Halaman voucher ini sudah ditandai used setelah dibuka.</div>
          <div className="flex gap-3 rounded-xl bg-white/5 p-3"><ShieldCheck className="size-4 shrink-0 text-green-300" />Maksimal {result.maxBuilds} build untuk key ini. Jangan bagikan ke orang lain.</div>
        </div>
      </div>
    </section>
    <p className="mt-5 text-center text-xs text-muted-foreground">Jika lupa copy lalu halaman ditutup, kamu perlu klaim voucher baru.</p>
  </main>;
}
