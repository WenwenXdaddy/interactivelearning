# Muscle health course integration — v3 replacement, 2026-09-19

Course: 通过运动和饮食提升健康寿命 · 导读 (`muscle-health-lyon`). The user authorised replacing the published
v2 page with a from-scratch rebuild by interactive-learning-lab 2.3.2 of the same interview. This supersedes
the 2026-09-16 v2 integration record below the line.

## Source and boundaries

Input: `E:/learning-pages/muscle-health-lyon-v2/course/index.html`
(sha256 `5fa36268034c8e70d6b07fc6693eb1c622f5e665622012c18af13ea0e72b128c`, 548,162 bytes as delivered with CRLF)
and `muscle-health-lyon_study_notes.md`, with the delivered `course-spec.md`, `source-ledger.csv`,
`qa-report.md`, `model-test.mjs` and `qa/` evidence. Both the hash and the byte count were re-checked before any
repository file was touched, and they matched.

The material is the Chinese transcript of the Huberman Lab interview with Gabrielle Lyon. The rebuild reorders
the argument by prerequisite rather than by the interview's own flow: the interview alternates between nutrition,
training and mindset and repeats two passages almost verbatim, so the page first establishes the organ view and
the metabolic mechanism, then how much protein, then the evidence, and only then the training protocol and the
mindset needed to execute it.

Structure: 17 stations (00 map, 01–10 explanatory prose with the source folded under each step, 11–14 in
verbatim-source form where the body text *is* the transcript and the teaching sits in the lead-ins and margin
notes, 15 速查与自测 with five scenario questions, 16 原文全文), 85 steps carrying premise/reasoning/conclusion
prose, 55 glossary terms, and a 68-record verification ledger (verified 9, derived 9, hypothesis 2, unverified 34,
disputed 14) surfaced beside the steps it affects. Station 04 carries the page's only draggable model, a protein
allocation calculator (ideal weight and meals-per-day sliders, an age-band threshold toggle and an
animal-source/plant-only toggle) that shows when a compliant daily total still misses the per-meal threshold.
Numbers the interview stated but this course's checking revised — resting energy cost per pound of muscle, the
55 g per-meal utilisation cap, the 0.37 g/kg conversion, the position-paper year, the tendon turnover rate, the
1.6 g/kg plant-only figure and the urolithin A endpoint — are marked in place next to the original wording. The
page passed the lab's reader gate (accuracy 4 / completeness 4 / exampleQuality 4, conditional pass) and was
repaired against that review before delivery.

The course is a learning aid, not medical, nutritional or training advice; the page carries that disclosure once,
on station 00. Publication adds no new medical evidence review — the ledger's limitations remain the course's own.

## Integration adaptations

- **CRLF → LF** on the HTML (1,777 line endings), UTF-8 without BOM. The study notes were already LF without BOM
  and were copied unchanged. CRLF conversion is required because the repository uses `core.autocrlf=input`:
  leaving CRLF in place makes the locally built `public/` hashes disagree with CI and with `verify:live`. After
  conversion the HTML is byte-identical to the delivered original apart from line endings (546,385 bytes).
  No effect on text, calculations, glossary or learner records.

That is the only adaptation. Specifically **not** needed this time, each verified against the delivered file:

- All 17 sections are already exactly `<section class="lesson">` with no extra class, so `check.mjs` counts 17
  chapters directly. (The v2 integration had to strip an extra class from station 16; the rebuild does not carry
  one.)
- The storage key is already the literal `'learning-lab:muscle-health-lyon:v1'` in source — unchanged from v2, so
  existing visitors' reading progress, one-line memos, calculator state and quiz drafts still load.
- `COURSE_META.id` is already `muscle-health-lyon`, not the template default.
- No external scripts or stylesheets, no inline event attributes, no relative-path images, no fetch/XHR/beacon.
  The v2 page carried three sidecar attachments embedded as data URIs; the rebuild has no sidecar files, so
  nothing had to be embedded.
- Neither `.github/workflows/live-site-check.yml` nor the publish skill's `site_checks.py` KNOWN table references
  this course, and the page's actual ids match the template defaults the checker falls back to
  (`[data-lesson-button]`, `#dictionary-button`, `#term-search`, `#theme-toggle`, `#export-button`,
  `dialog#dictionary-dialog`, `section.lesson:not([hidden])`), so no selector table had to be kept in step with
  the new template.

Course JavaScript, wording, source excerpts, locators, conclusions, glossary, ledger, calculator constants and
quiz were not modified.

## courses.json

Edited as text, this course's entry only; the other eleven entries are untouched. `slug`, `category` (健康与科学),
`tone` (green) and `storage` unchanged. Rewritten: `title` 通过运动和饮食提升健康寿命 → 通过运动和饮食提升健康寿命 · 导读
(the page's own title), `terms` 23 → 55, `metric` "42 处原文对照" → "68 条核查记录", `version` "v2 · 原文增强版" →
"v3 · 推理导读版", plus `subtitle`, `description`, `tags`, `level`, `firstTask` and `imageAlt`. `chapters` stays 17,
which is again the page's own section count. The term count was read in the browser from the page's own term data
(55) rather than taken from the hand-off note; the 68 is the figure the page prints on station 00 and the study
notes repeat. `metric` names the ledger rather than the calculator because one draggable model is a thin number on
a card; the calculator is named in `description`, `firstTask` and `imageAlt` instead.

Preview replaced with an actual screenshot of station 04's protein allocation calculator taken from the locally
built site, framed so the two sliders, the per-meal figure and the three-line chart fill the top half the homepage
card exposes; the image was inspected before `imageAlt` was written.

## Verification

- `npm test`: 106 static integrity checks passed across twelve courses.
- Local HTTP/CSP browser checks against the freshly built `public/` over real HTTP with native localStorage:
  **143 pass, 0 fail, 10 warn, 2 manual**. Covered the homepage card, byte-identical notes (28,268 B) and offline
  download (546,385 B), per-station default text against the pre-integration snapshot, all 17 station buttons,
  both sliders driving the chart (`updated=2 sliders`), the glossary dialog opening on one Escape, export, reload
  persistence, a sentinel test that the other eleven courses' storage is untouched, offline HTML, regression over
  those eleven courses, 390 px layout on the homepage and all 17 stations, and console/CSP errors (zero).
  The local server was restarted after the rebuild and both of this course's inline-script hashes were confirmed
  present in the served CSP.
- All 10 local warnings and one of the two `manual` items are pre-existing behaviour in *other* courses
  (gold-volatility's two-press Escape on its `type="search"` glossary box; "no visible slider on the current
  lesson" for the nine courses with no numerical model; why-learning-tools-fail's navigation selector).
- The one `manual` item for this course is expected: station 15's five self-checks are free-text scenario
  questions, so there are no `[data-answer]`/`[data-predict]` buttons for the generic checker to press.
- That item and this course's own interactions are covered by a purpose-written supplemental script
  (`%TEMP%/plc/muscle-health-lyon/supplemental.py`), which passed **34/34** locally: 17 station buttons, 85 steps,
  55 inline term triggers, exactly two sliders on station 04, the 60.0 g default, the meals slider taking the
  per-meal figure to exactly the 30 g threshold with the page's own "最多摆 6 餐还能每餐过线" verdict agreeing,
  the ideal-weight slider (180 → 115 lb gives 38.3 g), the "回到原文的例子" reset, the plant-source toggle leaving
  the daily target at 180 g while dropping the leucine estimate and surfacing the 1.6 g/kg side reference with its
  "换来源不会让需求下降" caveat, the 50+ band moving the threshold to 40 g, the chart drawing nine shapes, five
  free-text boxes and zero answer buttons on station 15, a typed draft reaching `learning-lab:muscle-health-lyon:v1`
  and surviving a native reload, that draft plus the calculator's parameters and all five self-check origins
  reaching the real export, the glossary listing 55 terms and a search narrowing it to 3 and opening a definition,
  the source-jump round trip from station 04 into station 16, and 390 px station 04 with no horizontal overflow.
- Screenshots inspected rather than merely generated: the homepage card (17 个学习站 / 68 条核查记录 / 55 个术语),
  390 px station 04, the glossary dialog with a live search narrowed to three terms, the station 04 calculator in
  plant-source mode, and the preview image itself before `imageAlt` was written.
- `git diff --stat` over every other course's source directory is empty; the commit touches exactly twelve files,
  and `public/index.html` and `public/site-manifest.json` change only this course's card and hashes.
- Not tested: real-device iPhone/Safari, screen readers, and the factual accuracy of the underlying interview
  beyond the course's own 68-record ledger.

Evidence: `%TEMP%/plc/muscle-health-lyon/`. Commit, deployment and production verification are reported
separately in the release report.

---

## Previous record — v2 integration, 2026-09-16

Course: 通过运动和饮食提升健康寿命 (`muscle-health-lyon`). User requested publication of the completed source-enhanced course.

Input: E:/learning-pages/muscle-health-lyon/index.html and its study notes, source ledger and QA report. 17 stations, 23 terms, 42 complete source excerpts, five scenario questions, text-only original transcript appendix. No numerical model. Original standalone QA: 130 behavior assertions and 682 source-reader assertions passed.

An independent clone was used because E:/interactivelearning contains unrelated uncommitted huberman-health-qa work. Those files were not touched or included. Existing repository, main branch, Worker interactivelearning and learning.jiadi.ai are retained.

Integration adaptations: normalize UTF-8 without BOM and LF before building; embed three original sidecar attachments as downloadable data URIs with attachment bytes preserved, adjusting the no-JavaScript handbook sentence accordingly; remove the unused original-lesson class from station 16 so the existing builder counts all 17 stations. All original JavaScript, glossary terms, quiz content, full transcript, excerpt mapping and the storage key learning-lab:muscle-health-lyon:v1 were preserved. A green card was added under 健康与科学 with an actual station-1 screenshot.

- npm test: 50 static integrity checks passed.
- Generic HTTP/CSP browser checks: 103 pass, zero fail, three warnings, four manual items.
- Dedicated HTTP browser checks: 156 assertions passed, covering glossary count, actual Markdown export, first/latest answers, native reload persistence, full-source jump/return and resume, all station widths and expanded excerpts at 390/360px, all three embedded downloads byte-for-byte, scoped reset and Pozsar navigation.
- Generic manual term count/export/Pozsar navigation items were resolved by dedicated checks. Slider checks were not applicable to that version of the course. Escape can first clear a search field before closing the glossary; this was recorded, not changed.
- Generic regression checks passed for all existing courses; their source directories had no diff.
- Source snapshot confirmed all 17 station texts unchanged after integration. Local security-policy console errors: zero.
- Preview, homepage card, mobile course and glossary screenshots inspected. No clipping observed.
- True-device Safari and screen readers were not tested. Medical statements were not newly reviewed during publication.
