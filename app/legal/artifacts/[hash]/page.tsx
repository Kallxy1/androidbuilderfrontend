import Link from "next/link";
import { Archive, ShieldCheck, TimerReset } from "lucide-react";

export default async function ArtifactLegalPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params;
  return <main className="mx-auto max-w-2xl px-5 py-12">
    <Link href="/" className="text-sm text-muted-foreground">← Kembali</Link>
    <section className="card mt-8 p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-foreground text-background"><Archive className="size-6" /></div>
        <div><div className="text-xs uppercase tracking-widest text-muted-foreground">legal/artifacts/{hash}</div><h1 className="text-3xl font-black">Artifact Policy</h1></div>
      </div>
      <div className="space-y-4 leading-7 text-muted-foreground">
        <p>BuildBox membuat artifact seperti APK, AAB, JAR, atau ZIP dari source yang diupload pengguna. Artifact disimpan sementara sesuai retention provider build.</p>
        <p>Pengguna bertanggung jawab memastikan source code, dependency, package name, icon, signing key, dan konten aplikasi adalah miliknya sendiri atau memiliki izin yang sah.</p>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-muted p-4"><TimerReset className="mb-2 size-4" />Artifact bisa expired otomatis dan tidak dijamin tersimpan permanen.</div>
          <div className="rounded-xl bg-muted p-4"><ShieldCheck className="mb-2 size-4" />Jangan upload credential, private key, keystore, token, atau data sensitif.</div>
        </div>
      </div>
    </section>
  </main>;
}
