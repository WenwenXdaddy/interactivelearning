# Brain vitality guided course

The new course “衰老大脑与身体的活力 · 导读” is built from the user-provided Chinese podcast transcript. The original file is retained outside the repository; the authorized cleaned transcript is embedded in the standalone course and downloadable through its UI. Cleanup removes ads, promotional calls to action, mechanical repeats and non-substantive fillers; scientific claims remain verbatim and corrections are separated in the learning layer. The source contains a missing transition and uncertain speaker/name details, which are explicitly identified rather than invented.

## Integration

- New slug: `brain-vitality`; existing `健康与科学` category. Browser snapshot: 17 lessons, 20 terms, 41 steps, no numerical model. Counts are generated and checked.
- Standalone source and notes are UTF-8 without BOM, canonical LF. Actual course screenshot provides the preview. Existing course source files and memo namespaces are untouched.
- A narrow portal resume registration reuses the existing two-digit station and step adapter. Its source-contract test includes the new course; actual Chromium homepage return restored `s04-2`.
- Frozen catalog provenance points to source commit `ba59d1f`; a separate integration commit includes metadata and generated output.

## Verification

- Course validator: 27 checks, no warnings/errors.
- Final local HTTP course-specific Chromium test: 173 assertions, including all stations at 1440/390/360, source navigation and back stack, glossary, draft/first/latest answer persistence, real downloads, theme restore, offline interactions, corrupt/disabled storage, scoped reset.
- `npm test`: 147 static integrity checks plus home/resume/theme/platform behavior tests passed.
- Local site checks: 157 pass, zero failures. Four manual findings and 14 warnings are generic-selector/model-absence or existing-course limitations; custom navigation and freeform quiz have separate actual browser assertions, and numerical models are not applicable.
- PWA: activated controlling service worker; real save button, complete CacheStorage pointer/generation/files, homepage entry into cached course, and reload passed locally.
- Screenshots reviewed: desktop/mobile/light/dark course, homepage card and mobile shelf.
- Independent reader and grader: understanding gate passed; seven focused fixes rechecked against final page. Original reader scores are pre-fix, and are not represented as a post-fix reader rerun or population learning evidence.
- Not run: physical iPhone/Safari, screen reader. Live deployment and production proof are recorded in the delivery record after push; local checks alone do not establish either.

Evidence stays outside this repository under `E:/learning-pages/brain-vitality/qa/`.
