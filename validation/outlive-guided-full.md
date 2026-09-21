# 《超越百岁》全书导读 integration — 2026-09-21

Course: `outlive-guided-full`, 《超越百岁》｜全书导读. First release in the existing 健康与科学 category.

## Source and integration

- Input page: `E:/learning-pages/outlive-guided-full/index.html`; handbook: `outlive_study_notes.md`.
- Retained HTML SHA256: `c6567566cedfbf7635bfbc44edcf5aa18f7e19d7c9fceaad38d31357b96373eb`.
- Retained handbook SHA256: `2f1bf260b7c724d0d597c672d9471f0bc0dee2fe9b7f2d9cc7020dcd8802ff6d`.
- Both files were copied byte-for-byte as UTF-8 without BOM and canonical LF. No course prose, source text, images, calculations, state, export, storage, or interaction logic changed.
- Source counts: 32 `section.lesson` stations, 153 stable `.step[id]` elements and 35 glossary terms. The card uses the source ledger's `64 项核查记录` as its metric. The delivery also records 29 body stations, five synthesis self-checks and 15 embedded source images.
- Storage remains `learning-lab:outlive-guided-full:schema2`; it is distinct from every existing course namespace.
- The source already defaults a fresh state to `theme: 'light'` and adds `body.light`. Restore accepts only an explicitly stored `dark` value as dark, while the theme control continues to save either explicit choice. No theme-script adaptation was needed.
- The page title is retained exactly as `《超越百岁》｜全书导读`; the catalog uses the same title.
- Preview source: `E:/learning-pages/outlive-guided-full/qa/station-01-desktop.png`, converted to a 1280×720 catalog WebP. It shows station 01's longevity goal, reading steps and left station navigation.
- Commit-derived `sourceAddedAt`, `sourceAddedCommit`, `sourceUpdatedAt` and `sourceUpdatedCommit` are frozen from the first source commit `a478c3b`, committer date `2026-09-21T11:35:34+08:00`.

## Portal integration

- Catalog route: `https://learning.jiadi.ai/courses/outlive-guided-full/`.
- Card metadata: 健康与科学, 32 stations, 35 terms, 64 verification records, `v1 · 全书导读版`.
- Portal resume adapter: 32 controls use `[data-lesson-button]`, lessons use `.lesson[data-lesson]`, and stable reading steps use IDs matching `^s\d+-\d+$`. The adapter records only the portal key and does not read the course namespace.
- `scripts/test-resume.mjs` checks the 32 lesson/control pairs, unique lesson IDs, stable step IDs and the new adapter registration.

## Verification in this integration lane

- Publish-skill static preflight: zero blockers. It found 32 exact lesson sections, 32 sections carrying the lesson class, no relative assets, no inline event attributes, no BOM and no CRLF.
- Source-browser count supplied by the release coordinator: 32 lessons, 153 steps and 35 rendered glossary results; a fresh load has `body.light`.
- `node scripts/test-resume.mjs`: passed all source contracts and bridge storage/restore checks for 15 courses.
- Repository copies match the two source hashes above. JSON parsing and source-level adapter checks were run without building `public/`.

## Boundaries

This lane did not run the site builder, mutate `public/`, commit, push, deploy, or perform production verification. It did not open a browser. The release coordinator owns the integrated build, HTTP/browser checks, commit-derived dates and commits, publication, and live proof.

## Coordinator acceptance — 2026-09-21

- `npm test`: 131 integrity checks plus home, 15-course resume, executable source-theme and platform tests passed.
- Browser on local HTTP: all 15 courses default light; all 13 switchable courses retained an explicit dark choice after reload and could return to light. Two courses are intrinsically light.
- Integrated Outlive's 32 lesson text blocks match the original source DOM exactly; 153 steps and 35 glossary entries retained.
- Chromium at 390x844: visited all 32 stations; no horizontal document overflow.
- Independent GPT-5.6 Sol high review found no remaining release blockers after metadata, invalid-theme fallback and resume-capacity corrections.
- Production verification follows deployment; the earlier lane-specific boundaries above describe the worker's scope only.
