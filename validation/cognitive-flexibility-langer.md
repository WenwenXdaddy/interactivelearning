# Cognitive flexibility course integration — v2 replacement, 2026-09-19

Course: 认知灵活性 · 在变化中重新看见选择 (`cognitive-flexibility-langer`). The user authorised replacing the
published v1 page with a from-scratch rebuild by interactive-learning-lab 2.3.2 of the same source material.
This supersedes the 2026-09-16 v1 integration record below the line.

## Source and boundaries

Input: `E:/learning-pages/cognitive-flexibility-langer-v2/course/index.html`
(sha256 `eb0953de22152cb4da297f7d7e23aebce86edcd5e8b0cca65804dc013305b078`, 415,329 bytes as delivered with CRLF)
and `cognitive-flexibility-langer_study_notes.md`, with the delivered `course-spec.md`, `source-ledger.csv`,
`qa-report.md` and `qa/` evidence. Both the hash and the byte count were re-checked before any repository file
was touched, and they matched.

The material is the Huberman Lab long-form interview with Harvard psychologist Ellen Langer. The rebuild reorders
the argument by prerequisite rather than by the interview's own flow: 13 stations (00 map, 01–07 explanatory prose
with the source folded under each step, 08–10 in verbatim-source form where the body text *is* the transcript and
the teaching sits in the lead-ins and margin notes, 11 速查与自测, 12 原文全文), 74 steps carrying
premise/reasoning/conclusion prose, 14 glossary terms, a 34-record verification ledger
(verified 9, derived 1, hypothesis 1, unverified 17, disputed 6) surfaced beside the steps it affects, and five
free-text self-checks on station 11 whose drafts autosave. There is no numerical model, so the page has no sliders.
The page passed the lab's reader gate (accuracy 4 / completeness 4 / exampleQuality 5) and was repaired against
that review before delivery.

The course is a learning aid, not medical advice. Langer's own qualifications stay in the body text; the course's
added cautions live in each station's collapsible 边界 block. Publication adds no new medical evidence review.

## Integration adaptations

- **CRLF → LF** on both files (914 line endings in the HTML, 728 in the notes), UTF-8 without BOM. Required because
  the repository uses `core.autocrlf=input`: leaving CRLF in place makes the locally built `public/` hashes disagree
  with CI and with `verify:live`. After conversion both files are byte-identical to the delivered originals apart
  from line endings. No effect on text, logic or learner records.

That is the only adaptation. Specifically **not** needed this time, each verified against the delivered file:

- All 13 sections are already exactly `<section class="lesson">` with no extra class, so `check.mjs` counts 13
  chapters directly. (The healthy-masculinity rebuild needed a `class="lesson cheat"` rewrite; this one does not.)
- The storage key is already the literal `'learning:cognitive-flexibility-langer:v1'` in source — unchanged from v1,
  so existing visitors' reading progress, one-line memos and quiz drafts still load.
- `COURSE_META.id` is already `cognitive-flexibility-langer`, not the template default.
- No external scripts or stylesheets, no inline event attributes, no relative-path images, no fetch/XHR/beacon.
- Neither `.github/workflows/live-site-check.yml` nor the publish skill's `site_checks.py` KNOWN table references
  this course, so no selector table had to be kept in step with the new template.

Course JavaScript, wording, source excerpts, locators, conclusions, glossary, ledger and quiz were not modified.

## courses.json

Edited as text, this course's entry only; the other eleven entries are untouched. `slug`, `category` (健康与科学),
`tone` (gold), `title` and `storage` unchanged — the v1 card title already matched the new page title.
Rewritten: `chapters` 18 → 13, `metric` "46 处原文对照 · 完整原文" → "34 条核查记录", `version`
"v1 · 引导阅读版" → "v2 · 推理导读版", plus `subtitle`, `description`, `tags`, `level`, `firstTask`, `imageAlt`.
`terms` stays 14 — the rebuild happens to carry the same count, confirmed by reading the page's `TERMS` array
length in the browser rather than by copying the old number.

Preview replaced with an actual screenshot of station 11's 速查表 (the 可操作的提问式 table) taken from the locally
built site, framed so the table fills the top half the homepage card exposes; the image was inspected before
`imageAlt` was written.

## Verification

- `npm test`: 106 static integrity checks passed across twelve courses.
- Local HTTP/CSP browser checks against the freshly built `public/` over real HTTP with native localStorage:
  **133 pass, 0 fail, 10 warn, 4 manual**. Covered the homepage card, byte-identical notes and offline download,
  per-station default text against the pre-integration snapshot, station navigation, glossary dialog and search,
  one-line memo, export, reload persistence, a sentinel test that other courses' storage is untouched, offline
  HTML, regression over the eleven older courses, 390 px layout, and console/CSP errors. The local server was
  restarted after the rebuild and its served CSP confirmed to carry all 23 current script hashes.
- All ten local warnings are pre-existing behaviour in *other* courses (gold-volatility's two-press Escape on its
  `type="search"` glossary box; "no visible slider on the current lesson" for the courses that have no model).
- Two `manual` items for this course, both expected and both covered by a purpose-written supplemental script
  (`%TEMP%/plc/cognitive-flexibility-langer/supplemental.py`): the page has no sliders (no numerical model, not
  applicable), and station 11's five self-checks are free-text scenario questions with no `[data-answer]` button.
  The supplemental script passed 8/8 locally: 13 station buttons, five free-text boxes present, a typed draft
  surviving a reload through native localStorage, that draft reaching the actual export, the 34-record ledger
  count reaching the export, and the source-jump round trip (station 01 → station 12 transcript → back-link → 01,
  opening the collapsed 对照原文 block first, as a reader would).
- Screenshots inspected rather than merely generated: homepage card, 390 px mobile, glossary dialog with a live
  search, and the preview image itself before `imageAlt` was written.
- `git diff --stat` confirmed no other course's files changed; the commit touches exactly twelve files.
- Production, commit `fa88245`: `Workers Builds: interactivelearning` and `validate` both succeeded.
  `npm run verify:live` passed — homepage, all twelve courses' hashes, downloads and 404.
  Live browser checks: **131 pass, 1 fail, 12 warn, 4 manual**; the supplemental script passed 7/7 functional
  assertions against `https://learning.jiadi.ai`, including native persistence and a real export.
- The single live `fail` (`defaults-vs-original: no page errors on first load`) is Cloudflare edge noise, not this
  course. Verified directly against the live response: the page carries two inline scripts — the course's own
  20,419-character script, whose hash **is** in the live CSP and which therefore executes, and Cloudflare's
  921-character bot-detection script, which is blocked — plus the blocked `static.cloudflareinsights.com` beacon.
  The dedicated `[console]` probe downgrades this to `warn` in `--live` mode; this one probe does not apply the
  same allowance, so it is a checker inconsistency rather than a site defect. The ~367-byte edge tag appended to
  browser-downloaded HTML is the same known noise. Both are documented in the skill's site contract §6.1;
  removing them would mean changing Cloudflare zone settings or the CSP, which is the user's decision.
- Not tested: real-device iPhone/Safari, screen readers, and the factual accuracy of the underlying interview
  beyond the course's own 34-record ledger.

Evidence: `%TEMP%/plc/cognitive-flexibility-langer/`. Commit, deployment and production verification are reported
separately in the release report.

---

## Previous record — v1 integration, 2026-09-16

Input: E:/learning-pages/cognitive-flexibility-langer/index.html and study-notes.md, with original QA, source
ledger and source snapshot. 18 stations including start, 15 reasoning units, review and full-source appendix;
14 glossary entries; five scenarios. No numerical model. Original QA passed 191 assertions. Adaptations were:
UTF-8/LF normalisation; the source-ledger.csv download embedded as a data URI; the appendix's extra `source-full`
class replaced by its existing `#appendix` selector so the checker could count all 18 sections; storage key
`learning:cognitive-flexibility-langer:v1` preserved; an actual station-1 screenshot added under the existing
健康与科学 category. Final eight-course browser checks were 101 pass / 0 fail / 5 warn / 7 manual, with 192
course-specific assertions passed. True-device Safari and screen readers were not tested.
