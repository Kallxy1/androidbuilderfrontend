# BuildBox Web

Frontend Next.js untuk personal ZIP-to-build tool.

- UI bergaya shadcn/ui dengan komponen custom
- Black/white theme
- Dark/light mengikuti system preference
- Toggle theme, switch, bottom sheet, input, loading, status badge
- Sound saat build selesai
- Browser notification dan service worker starter
- Upload ZIP ke Vercel Blob
- Trigger GitHub Actions
- Poll status dan download artifact
- Artifact ZIP otomatis diekstrak server-side; browser menerima APK/AAB/JAR langsung
- Optional `BUILD_ACCESS_KEY` untuk melindungi semua API endpoint

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Catatan

Web Push penuh membutuhkan VAPID key dan endpoint server untuk subscription. Starter ini sudah meminta permission browser, mendaftarkan service worker, dan memakai browser notification saat tab terbuka. Untuk personal use, itu cukup sebagai tahap awal.
