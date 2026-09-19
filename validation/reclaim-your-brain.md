# Reclaim your brain integration — v2 replacement, 2026-09-19

Course: 重新掌控你的大脑 · 节律、注意与习惯 (`reclaim-your-brain`). The user authorised replacing the published
v1 page with a from-scratch rebuild by interactive-learning-lab 2.3.2 of the same source material. This
supersedes the 2026-09-16 v1 integration record below the line.

## Source and boundaries

Input: `E:/learning-pages/reclaim-your-brain-v2/course/index.html`
(sha256 `12949cdbc423e222c7b9ac1a769bfaf46f5da287dab480a505b6e91514ba58ab`, 538,941 bytes as delivered with CRLF)
and `reclaim-your-brain_study_notes.md`, with the delivered `course-spec.md`, `source-ledger.csv`,
`qa-report.md` and `qa/` evidence. Both the hash and the byte count were re-checked before any repository file
was touched, and they matched.

The material is a Chinese transcript of Andrew Huberman's long interview on the Modern Wisdom podcast
(material date 2026-02-15). The rebuild reorders the argument by prerequisite rather than by the interview's own
flow, and deliberately develops only the three threads where the guest actually completes a chain of reasoning —
the cortisol circadian curve, where attention comes from, and bad habits versus the prefrontal cortex. What is
left out is listed explicitly on station 00, with the reason for each omission and its line range in the full
transcript.

Structure: 12 stations (00 map, 01–06 explanatory prose with the source folded under each step, 07–09 in
verbatim-source form where the body text *is* the transcript and the teaching sits in the lead-ins and margin
notes, 10 速查与自测, 11 原文全文), 67 steps carrying premise/reasoning/conclusion prose, 36 glossary terms,
and a 53-record verification ledger (verified 14, derived 1, unverified 32, disputed 6, hypothesis 0) surfaced
beside the steps it affects. Four errors that affected the course's own conclusions are corrected in place next
to the original wording. Station 10 holds four review tables (判据与公式, 关键数字, 关键对比, 定性结论) and five
free-text scenario self-checks whose drafts autosave. There is no numerical model, so the page has no sliders;
stations 05 and 07 carry three hand-drawn inline SVG figures instead (one on 05, two on 07). The page passed the
lab's reader gate (accuracy 4 / completeness 4 / exampleQuality 4) and was repaired against that review before
delivery.

The course is a learning aid, not medical advice. The guest's own qualifications stay in the body text; the page
carries the lab's disclosure that it explains the interview's reasoning and gives no doses or protocols.
Publication adds no new medical evidence review.

## Integration adaptations

- **CRLF → LF** on the HTML (1,014 line endings), UTF-8 without BOM. The study notes were already LF without BOM
  and were copied unchanged. CRLF conversion is required because the repository uses `core.autocrlf=input`:
  leaving CRLF in place makes the locally built `public/` hashes disagree with CI and with `verify:live`. After
  conversion the HTML is byte-identical to the delivered original apart from line endings (537,927 bytes).
  No effect on text, logic or learner records.

That is the only adaptation. Specifically **not** needed this time, each verified against the delivered file:

- All 12 sections are already exactly `<section class="lesson">` with no extra class, so `check.mjs` counts 12
  chapters directly.
- The storage key is already the literal `'learning:reclaim-your-brain:v1'` in source — unchanged from v1, so
  existing visitors' reading progress, one-line memos and quiz drafts still load.
- `COURSE_META.id` is already `reclaim-your-brain`, not the template default.
- No external scripts or stylesheets, no inline event attributes, no relative-path images (the three figures are
  inline SVG), no fetch/XHR/beacon.
- Neither `.github/workflows/live-site-check.yml` nor the publish skill's `site_checks.py` KNOWN table references
  this course, and the page's actual ids match the template defaults the checker falls back to
  (`[data-lesson-button]`, `#dictionary-button`, `#term-search`, `#theme-toggle`, `#export-button`,
  `dialog#dictionary-dialog`), so no selector table had to be kept in step with the new template.

Course JavaScript, wording, source excerpts, locators, conclusions, glossary, ledger and quiz were not modified.

## courses.json

Edited as text, this course's entry only; the other eleven entries are untouched. `slug`, `category` (健康与科学),
`tone` (green) and `storage` unchanged. Rewritten: `title` 如何重新掌控你的大脑 → 重新掌控你的大脑 · 节律、注意与习惯
(the page's own title), `chapters` 22 → 12, `terms` 19 → 36, `metric` "57 处原文对照 · 完整原文" → "53 条核查记录",
`version` "v1 · 引导阅读版" → "v2 · 推理导读版", plus `subtitle`, `description`, `tags`, `level`, `firstTask` and
`imageAlt`. The term count was read from the page's `TERMS` array length in the browser (36) rather than taken
from the hand-off note, which said 33; the chapter count is the page's section count and the 53 is the figure the
page and the study notes both print.

Preview replaced with an actual screenshot of station 07's 头盔 vs 手机 figure taken from the locally built site,
framed so the two-column comparison fills the top half the homepage card exposes; the image was inspected before
`imageAlt` was written.

## Verification

- `npm test`: 106 static integrity checks passed across twelve courses.
- Local HTTP/CSP browser checks against the freshly built `public/` over real HTTP with native localStorage:
  **132 pass, 0 fail, 10 warn, 3 manual**. Covered the homepage card, byte-identical notes and offline download,
  per-station default text against the pre-integration snapshot, station navigation, glossary dialog and search,
  export, reload persistence, a sentinel test that other courses' storage is untouched, offline HTML, regression
  over the eleven older courses, 390 px layout on the homepage and all twelve stations, and console/CSP errors.
  The local server was restarted after the rebuild and its served CSP confirmed to carry all 23 current script
  hashes.
- All 10 local warnings are pre-existing behaviour in *other* courses (gold-volatility's two-press Escape on its
  `type="search"` glossary box; "no visible slider on the current lesson" for the courses that have no model).
  One of the three `manual` items also belongs to another course (why-learning-tools-fail's navigation selector).
- The two `manual` items for this course are both expected and both covered by a purpose-written supplemental
  script (`%TEMP%/plc/reclaim-your-brain/supplemental.py`): the page has no sliders (no numerical model, not
  applicable), and station 10's five self-checks are free-text scenario questions with no `[data-answer]` button.
  The supplemental script passed **16/16** locally: 12 station buttons, zero range inputs, five free-text boxes,
  zero answer buttons, a typed draft surviving a reload through native localStorage, that draft living under
  `learning:reclaim-your-brain:v1`, the draft reaching the actual export, the 53-record ledger count reaching the
  export, `TERMS.length` = 36, the glossary dialog opening and its search narrowing the list, the source-jump
  round trip (station 01 → 对照原文 → station 11 transcript → generated back link → station 01), the three inline
  SVG figures rendering with non-zero geometry (two on station 07, one on station 05), and `reset()` leaving a
  sentinel key from another course alone.
- Screenshots inspected rather than merely generated: homepage card (12 个学习站 / 53 条核查记录 / 36 个术语),
  390 px mobile, glossary dialog with a live search, both station 07 figures at 1440 px and at 390 px, and the
  preview image itself before `imageAlt` was written.
- `git diff --stat` confirmed no other course's files changed; the commit touches exactly twelve files.
- Production verification: recorded below once run.

Evidence: `%TEMP%/plc/reclaim-your-brain/`. Commit, deployment and production verification are reported
separately in the release report.

---

## Previous record — v1 integration, 2026-09-16

Course: 如何重新掌控你的大脑 (`reclaim-your-brain`). User explicitly commissioned the course and authorized publication with two companion courses.

Input: E:/learning-pages/reclaim-your-brain/index.html and study-notes.md, accompanied by course-spec.md, source-ledger.csv, source-snapshot.md and qa-report.md. Original HTML SHA-256: 6d2b680a60b52f32b2a6e1f8f996667f46d7d592f9d1cd248fdbc40d2bdcaef5.

22 stations: start, 19 reasoning units, review and full-source appendix. 19 glossary entries; four scenarios. All source paragraphs and 57 excerpt ranges checked against the retained source snapshot. Scientific and medical claims retain explicit evidence limitations; no numerical model or personalized health prescription.

Integration only normalizes UTF-8 without BOM and LF. Course scripts, text, exports and learning:reclaim-your-brain:v1 storage remain unchanged after newline normalization. Add an actual station-1 screenshot and card in the existing 健康与科学 category. No infrastructure or other course sources changed.

- Original offline checks: 16 static, six generic browser and 208 dedicated assertions passed.
- Combined build: 74 static integrity checks, eight courses.
- Real local HTTP/CSP: 105 generic passes, zero failures, five warnings and seven manual items; 208 dedicated assertions and five supplemental assertions passed.
- Dedicated coverage: full-source/excerpt equality and navigation/return, all stations, glossary, first/latest quiz, export, scoped reset, native persistence and malformed/blocked storage; 1440/390/360 layouts in both themes.
- Supplement checks: source reader present, complete source/excerpt/locator text preserved, glossary and appendix card counts, Pozsar navigation.
- Generic manual items for navigation, terms and export are covered by dedicated/supplemental tests for all three new courses. Sliders are not applicable; existing gold double-Escape behavior is unchanged.
- Actual preview, home card, glossary and mobile full-source screenshots inspected.
- True-device Safari, screen readers and original audio/video transcription were not tested.

Evidence retained outside Git at %TEMP%/plc/mind-courses/reclaim-your-brain/. Deployment and live verification are separate release checks.
