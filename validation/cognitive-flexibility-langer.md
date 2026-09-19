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
- Local HTTP/CSP browser checks against the freshly built `public/` over real HTTP with native localStorage
  (results recorded in the release report): homepage card, byte-identical notes and offline download, per-station
  default text against the pre-integration snapshot, station navigation, glossary dialog and search, one-line memo,
  export, reload persistence, sentinel test that other courses' storage is untouched, offline HTML, regression over
  the older courses, 390 px layout, and console/CSP errors.
- Station 11's five self-checks are free-text scenario questions with no answer button, so the scripted quiz probe
  reports `manual`; the free-text drafts and their persistence were exercised through the memo/persistence probes.
- The page has no sliders, so the slider probe is not applicable.
- Screenshots inspected rather than merely generated: homepage card, desktop course page, 390 px mobile, glossary
  dialog, and the preview image itself.
- `git diff --stat` confirmed no other course's files changed.
- Production: Cloudflare Workers Builds check on the pushed commit, `npm run verify:live`, and the same browser
  checks re-run against `https://learning.jiadi.ai`. Cloudflare's edge injects bot-detection and Web Analytics
  scripts that this site's CSP blocks; those console errors and the ~367-byte difference in browser-downloaded
  HTML are known, pre-existing noise, recorded as warnings rather than failures.
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
