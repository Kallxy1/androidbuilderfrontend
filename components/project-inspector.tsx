"use client";

import { useState } from "react";
import JSZip from "jszip";
import { AlertTriangle, CheckCircle2, FileArchive, ShieldAlert, UploadCloud } from "lucide-react";

type Props = { file: File | null; onFile: (file: File | null) => void };
type Report = { fileName: string; size: string; detected: string[]; found: string[]; missing: string[]; warnings: string[]; suggestions: string[]; sensitive: string[] };

const sensitivePatterns = [/\.env/i, /local\.properties$/i, /google-services\.json$/i, /\.(jks|keystore|p12|pem|key)$/i, /(^|\/)id_rsa$/i, /secret|credential|service-account/i];

export function ProjectInspector({ file, onFile }: Props) {
  const [report, setReport] = useState<Report | null>(null);
  const [reading, setReading] = useState(false);

  async function inspect(next: File | null) {
    onFile(next); setReport(null); if (!next) return;
    if (!next.name.toLowerCase().endsWith(".zip")) { setReport({ fileName: next.name, size: `${(next.size / 1024 / 1024).toFixed(2)} MB`, detected: [], found: [], missing: ["File harus berformat .zip"], warnings: [], suggestions: ["Pilih file ZIP project yang benar."], sensitive: [] }); return; }
    setReading(true);
    try {
      const zip = await JSZip.loadAsync(await next.arrayBuffer());
      const allOriginal = Object.keys(zip.files);
      const all = allOriginal.map((path) => path.toLowerCase().replace(/\\/g, "/"));
      const found: string[] = []; const missing: string[] = []; const detected: string[] = []; const warnings: string[] = []; const suggestions: string[] = []; const sensitive: string[] = [];
      const has = (name: string) => all.some((path) => path.endsWith(name) || path.includes(`/${name}`));
      const hasDir = (name: string) => all.some((path) => path.includes(`/${name}/`) || path.startsWith(`${name}/`));
      allOriginal.forEach((path) => { if (sensitivePatterns.some((pattern) => pattern.test(path))) sensitive.push(path); });
      if (has("pubspec.yaml")) { detected.push("Flutter / Dart"); found.push("pubspec.yaml"); if (!hasDir("android")) warnings.push("Folder android/ tidak ditemukan; Flutter APK mungkin gagal."); }
      if (has("pom.xml")) { detected.push("Maven Java/Kotlin"); found.push("pom.xml"); }
      if (has("settings.gradle") || has("settings.gradle.kts") || has("gradlew")) { detected.push("Gradle Android/JVM"); found.push(has("gradlew") ? "gradlew" : "settings.gradle"); if (!hasDir("app")) warnings.push("Folder app/ tidak ditemukan; pastikan root project benar."); }
      if (all.some((path) => path.endsWith(".kt"))) detected.push("Kotlin");
      if (all.some((path) => path.endsWith(".java"))) detected.push("Java");
      if (all.some((path) => path.endsWith(".dart"))) detected.push("Dart");
      if (all.some((path) => path.includes("compose"))) detected.push("Jetpack Compose / Compose dependency");
      if (!detected.length) missing.push("Tidak bisa mendeteksi project Android, Flutter, Java, Kotlin, atau Dart.");
      if (has("gradlew") && !has("gradle-wrapper.jar")) warnings.push("gradlew ada tapi gradle/wrapper/gradle-wrapper.jar tidak terlihat; fallback Gradle system akan dipakai.");
      if (!has("gradlew") && (detected.includes("Gradle Android/JVM") || detected.includes("Jetpack Compose / Compose dependency"))) warnings.push("gradlew tidak ada; workflow akan coba fallback ke Gradle system, tapi wrapper lebih direkomendasikan.");
      if (!has("settings.gradle") && !has("settings.gradle.kts") && detected.includes("Gradle Android/JVM")) missing.push("settings.gradle(.kts) tidak ditemukan.");
      if (sensitive.length) warnings.push("File sensitif terdeteksi. Upload akan ditolak server sampai file tersebut dihapus.");
      if (all.length > 5000) warnings.push("Jumlah file sangat banyak; upload server membatasi maksimal 5000 file.");
      if (missing.length) suggestions.push(`Saran otomatis: tambahkan ${missing.join(" ")}`);
      if (warnings.length) suggestions.push("Saran otomatis: cek struktur project dan upload ulang ZIP setelah file penting/sensitif dibereskan.");
      setReport({ fileName: next.name, size: `${(next.size / 1024 / 1024).toFixed(2)} MB`, detected: [...new Set(detected)], found: [...new Set(found)], missing: [...new Set(missing)], warnings: [...new Set(warnings)], suggestions: [...new Set(suggestions)], sensitive: [...new Set(sensitive)].slice(0, 8) });
    } catch { setReport({ fileName: next.name, size: `${(next.size / 1024 / 1024).toFixed(2)} MB`, detected: [], found: [], missing: ["ZIP rusak atau tidak bisa dibaca."], warnings: [], suggestions: ["Buat ulang ZIP dari folder project yang valid."], sensitive: [] }); }
    finally { setReading(false); }
  }

  return <div>
    <label className="dropzone flex cursor-pointer flex-col items-center justify-center rounded-2xl p-8 text-center">
      <input className="hidden" type="file" accept=".zip,application/zip" onChange={(e) => inspect(e.target.files?.[0] || null)} />
      <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted">{reading ? <FileArchive className="size-6 animate-pulse" /> : file ? <FileArchive className="size-6" /> : <UploadCloud className="size-6" />}</div>
      <div className="font-semibold">{file ? file.name : "Upload project ZIP"}</div>
      <div className="mt-1 text-xs text-muted-foreground">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · ${report?.detected.join(" / ") || "menganalisis..."}` : "Maksimal 100 MB · struktur project akan diperiksa otomatis"}</div>
    </label>
    {report && <div className="mt-3 space-y-2 rounded-xl border border-border bg-muted p-4 text-xs">
      <div className="font-bold">Project inspection</div>{report.fileName && <div className="text-muted-foreground">File: {report.fileName} · Size: {report.size}</div>}
      {report.detected.length > 0 && <div className="flex gap-2 text-green-600 dark:text-green-400"><CheckCircle2 className="size-4 shrink-0" /><span>Terdeteksi: {report.detected.join(", ")}</span></div>}
      {report.found.length > 0 && <div className="text-muted-foreground">Ditemukan: {report.found.join(", ")}</div>}
      {report.sensitive.map((item) => <div className="flex gap-2 text-red-600 dark:text-red-400" key={item}><ShieldAlert className="size-4 shrink-0" /><span>Sensitif: {item}</span></div>)}
      {report.missing.map((item) => <div className="flex gap-2 text-red-600 dark:text-red-400" key={item}><AlertTriangle className="size-4 shrink-0" /><span>Kurang: {item}</span></div>)}
      {report.warnings.map((item) => <div className="flex gap-2 text-yellow-600 dark:text-yellow-400" key={item}><AlertTriangle className="size-4 shrink-0" /><span>Peringatan: {item}</span></div>)}
      {report.suggestions.map((item) => <div className="rounded-lg border border-border bg-background/60 p-2 text-muted-foreground" key={item}>💡 {item}</div>)}
      {report.missing.length === 0 && report.warnings.length === 0 && <div className="text-green-600 dark:text-green-400">Struktur dasar terlihat siap untuk build.</div>}
    </div>}
  </div>;
}
