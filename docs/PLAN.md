# BuildBox implementation plan

## Milestone 1 — Prove the engine

1. Put a known-good Jetpack Compose project in the GitHub build repository.
2. Run `build-universal.yml` manually.
3. Confirm `build-output` contains an APK.

## Milestone 2 — Connect Vercel

1. Create a Vercel Blob store.
2. Add the variables from `.env.example`.
3. Deploy this Next.js app.
4. Upload a ZIP and trigger a workflow from the UI.

## Milestone 3 — Hardening

- Verify the uploaded ZIP is really a ZIP.
- Delete temporary Blob files after the job finishes.
- Add a personal trigger secret.
- Limit upload size, build time and artifact retention.
- Add logs endpoint and better GitHub run selection.
- Add Android keystore secrets only when release builds are needed.
