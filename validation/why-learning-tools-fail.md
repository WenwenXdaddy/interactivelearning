# Learning-tools course integration — v2 replacement, 2026-09-19

Course: 大多数学习工具失败的原因 · 从读过到理解 (`why-learning-tools-fail`). The user authorised replacing the
published v1 page with a from-scratch rebuild by interactive-learning-lab 2.3.2 of the same interview. This
supersedes the 2026-09-16 v1 integration record below the line.

## Source and boundaries

Input: `E:/learning-pages/why-learning-tools-fail-v2/course/index.html`
(sha256 `e14219f23879d014c64cce2c5e36cc52377d61a9a7e6a2508032fef48b2fa77d`, 635,795 bytes as delivered with CRLF)
and `why-learning-tools-fail_study_notes.md`, with the delivered `course-spec.md`, `source-ledger.csv`,
`qa-report.md` and `qa/` evidence. Both the hash and the byte count were re-checked before any repository file
was touched, and they matched.

The material is the Chinese transcript of a three-hour interview with an independent researcher who works on
learning tools and teaching media. The rebuild follows the interview's own argument rather than regrouping it by
topic: reading failure, then metacognition under load, then what reading leaves behind, then memory and
forgetting, then media and tools, ending with why spaced repetition has not spread.

Structure: 24 stations (00 map, 01–21 content, 22 速查与自测, 23 原文全文), 129 steps carrying
premise/reasoning/conclusion prose, 34 glossary terms, and a 34-record verification ledger (verified 13,
derived 2, hypothesis 1, unverified 8, disputed 10) which station 00 prints and which is surfaced beside the
steps it affects; the ten disputed records are marked in place next to the original wording. Stations 18–21 are
in verbatim-source form, where the body text *is* the transcript and the teaching sits in the lead-ins and
margin notes. Station 22 holds five free-text scenario self-checks with autosaved drafts. There is **no
numerical model** in this course — no sliders, no calculator. The page passed the lab's reader gate
(accuracy 4 / completeness 4 / exampleQuality 4) and was repaired against that review before delivery.

The course is a reading aid, not a substitute for the interview; the page carries that disclosure once, on
station 00. Publication adds no new evidence review — the ledger's limitations remain the course's own.

## Integration adaptations

- **CRLF → LF** on both files, UTF-8 without BOM. The HTML lost 659 line endings (635,795 → 635,136 bytes) and
  the notes 482 (70,212 → 69,730 bytes). CRLF conversion is required because the repository uses
  `core.autocrlf=input`: leaving CRLF in place makes the locally built `public/` hashes disagree with CI and
  with `verify:live`. After conversion both files are byte-identical to the delivered originals apart from line
  endings. No effect on text, glossary, ledger or learner records.

That is the only adaptation. Specifically **not** needed this time, each verified against the delivered file:

- All 24 sections are already exactly `<section class="lesson">` with no extra class, so `check.mjs`'s
  `<section class="lesson(?: active)?"` count returns 24 directly.
- The storage key is already the literal `'learning:why-learning-tools-fail:v1'` in source — unchanged from v1,
  so existing visitors' reading progress, self-check drafts and theme still load.
- `COURSE_META.id` is already `why-learning-tools-fail`, not the template default.
- No external scripts or stylesheets, no inline event attributes, no `<img>` elements at all, no relative-path
  files, no fetch/XHR/beacon/WebSocket.
- `.github/workflows/live-site-check.yml` hardcodes only `gold-volatility` (10 chapters, `#glossaryBtn`,
  `#glossarySearch`) and `unknown-unknowable` (15 chapters, `[data-lesson-button]`, `#dictionary-button`); it
  does not reference this course, so nothing had to be kept in step there. The publish skill's `site_checks.py`
  KNOWN table likewise has no entry for this slug, and the rebuilt page's actual ids match the template
  defaults the checker falls back to (`[data-lesson-button]`, `#dictionary-button`, `#term-search`,
  `#theme-toggle`, `#export-button`, `dialog#dictionary-dialog`, `section.lesson:not([hidden])`). Under v1 that
  fallback found no navigation selector and the previous release logged this course's chapter navigation as a
  `manual` regression item; with the rebuild the fallback resolves and the regression check compares against
  `chapters` directly. No table edit was needed in either direction.

Course JavaScript, wording, source excerpts, locators, conclusions, glossary, ledger and self-checks were not
modified.

## courses.json

Edited as text, this course's entry only; the other eleven entries are untouched. `slug`, `category` (学习与成长),
`tone` (green) and `storage` unchanged. Rewritten: `title` 大多数学习工具失败的原因 → 大多数学习工具失败的原因 ·
从读过到理解 (the page's own title), `chapters` 28 → 24, `terms` 22 → 34, `metric` "75 处原文对照 · 完整原文" →
"34 条核查记录", `version` "v1 · 引导阅读版" → "v2 · 推理导读版", plus `subtitle`, `description`, `tags`, `level`,
`firstTask` and `imageAlt`.

Every number on the card was counted in the page, not taken from the hand-off note: 24 from
`document.querySelectorAll('section.lesson')`, 34 terms from the page's own `TERMS` array read in the browser,
129 steps from `.step`, and the 34 is the ledger figure station 00 prints and the study notes repeat.

Preview replaced with an actual screenshot of station 22's 速查表 "定性结论" taken from the locally built site,
framed so the table heading and its first dozen rows fill the top half the homepage card exposes; the image was
inspected before `imageAlt` was written.

## Verification

- `npm test`: 106 static integrity checks passed across twelve courses.
- Local HTTP/CSP browser checks against the freshly built `public/` over real HTTP with native localStorage:
  **156 pass, 0 fail, 10 warn, 2 manual**. Covered the homepage card, byte-identical notes and offline download,
  per-station default text against the pre-integration snapshot, all 24 station buttons, the glossary dialog
  opening and closing on one Escape, export, reload persistence, a sentinel test that the other eleven courses'
  storage is untouched, offline HTML, regression over those eleven courses, 390 px layout on the homepage and
  all 24 stations, and console/CSP errors (zero). The local server was restarted after the rebuild and this
  course's inline-script hash was confirmed present in the served CSP.
- All 10 local warnings are pre-existing behaviour in *other* courses: gold-volatility's two-press Escape on its
  `type="search"` glossary box, and "no visible slider on the current lesson" for the nine other courses with no
  numerical model.
- Both `manual` items for this course are expected and are properties of the course, not gaps in it: it has no
  range inputs (no numerical model by design), and station 22's five self-checks are free-text scenario
  questions, so there are no `[data-answer]`/`[data-predict]` buttons for the generic checker to press.
- Those items and this course's own interactions are covered by a purpose-written supplemental script
  (`%TEMP%/plc/why-learning-tools-fail/extra_checks.py`), which passed **17/17** locally: five self-check cards
  each with a free-text box and zero answer buttons, a model answer opening from its disclosure, a typed draft
  reaching `learning:why-learning-tools-fail:v1` and surviving a native reload, the 讲解 toggle hiding
  `coach-only` commentary while leaving every 对照原文 quote and every 边界 card visible (and restoring them when
  switched back on), the source-jump round trip from station 02 into station 23 and back via the runtime-built
  `[data-back-step]` link, and the page's own counts of 34 terms / 24 stations / 129 steps.
- Screenshots inspected rather than merely generated: the homepage card (24 个学习站 / 34 条核查记录 / 34 个术语),
  390 px station 00, the glossary dialog with a live search narrowed to one term, station 02 with 讲解 off, and
  the preview image itself before `imageAlt` was written.
- Known cosmetic quirk in the page, pre-existing and not caused by integration: on desktop the station list is
  `position: sticky` while the `已浏览 N / 24` progress line below it stays in normal flow, so while the page is
  scrolled that line can overlap a station button in the sidebar. It is legible again once scrolling stops at the
  top or bottom of a station. Not changed here — page text and layout belong to interactive-learning-lab.
- `git diff --stat` over every other course's source directory is empty; the commit touches exactly eleven files,
  and `public/index.html` and `public/site-manifest.json` change only this course's card and hashes.
- Production, commit `8598e82`: `Workers Builds: interactivelearning` and `validate` both succeeded.
  `npm run verify:live` passed — homepage, all twelve courses' hashes, downloads and 404, after removing the
  938 bytes of edge-injected script Cloudflare adds to every course page.
  Live browser checks against `https://learning.jiadi.ai`: **154 pass, 1 fail, 12 warn, 2 manual**; the
  supplemental script passed **16/17** against production, the one exception being its own console probe (below).
- The single live `fail` in each run (`defaults-vs-original: no page errors on first load`, and the supplemental
  script's `no console or page errors`) is Cloudflare edge noise, not this course: the blocked
  `static.cloudflareinsights.com` beacon and the blocked bot-detection script. This course's inline-script hash
  `sha256-XqAeU5nDJUMSVfo+TsajYaOYXMUqRIVo1XYFXJWSogY=` **is** in the live CSP and executes — all 16 functional
  supplemental assertions ran against the live page, which would be impossible otherwise. The dedicated
  `[console]` probe downgrades the same 212 messages to `warn` in `--live` mode; these two probes do not apply
  the same allowance, so it is a checker inconsistency rather than a site defect. The ~367-byte edge tag appended
  to browser-downloaded HTML is the same known noise. Both are documented in the skill's site contract §6.1;
  removing them would mean changing Cloudflare zone settings or the CSP, which is the user's decision.
- The live warnings and both `manual` items are the same pre-existing items as locally, in other courses or
  inherent to this course's design.
- Live screenshots inspected: the homepage card (24 个学习站 / 34 条核查记录 / 34 个术语) and the 390 px glossary
  dialog listing the course's terms.
- Not tested: real-device iPhone/Safari, screen readers, and the factual accuracy of the underlying interview
  beyond the course's own 34-record ledger.

Evidence: `%TEMP%/plc/why-learning-tools-fail/`. Commit, deployment and production verification are reported
separately in the release report.

---

## Previous record — v1 integration, 2026-09-16

User requested the same creation and publication workflow as the preceding three-course release.

### Source and scope

Input: E:/learning-pages/why-learning-tools-fail/index.html and study-notes.md, with course-spec.md, source-ledger.csv, source-snapshot.md and qa-report.md.
Original HTML SHA-256: 4eb853a2021cf157eb36b6c89d1f899da4e6f6d1311eac2a77cc0c75e3c4b05f.

28 stations including start, 25 reasoning units, review and full-source appendix; 22 glossary entries. Full-source and excerpt order were checked against the original source snapshot by the course-specific browser tests. No numerical model. Evidence limits remain in the course and notes.

### Integration

- Source HTML and notes copied byte-identically (already UTF-8 without BOM, LF).
- Course JavaScript, text, exports and storage learning:why-learning-tools-fail:v1 retained unchanged.
- Real course screenshot preview; add card under 学习与成长. This new category is the only homepage classification addition.
- Existing repository, main branch, Worker interactivelearning and domain learning.jiadi.ai retained. All eight existing course sources unchanged.
- Work performed in the clean E:/learning-pages/publish-mind-courses clone; unrelated work in E:/interactivelearning is untouched.

### Checks

- Original offline: 16 static, six generic browser and 253 dedicated assertions passed.
- Final combined npm test: 98 static integrity checks across 11 courses.
- Real HTTP/CSP generic browser: 123 pass, zero fail, 8 warnings, 10 manual items.
- Real HTTP course-specific: 253 assertions passed. Includes all station navigation, full text and excerpt comparisons, jump/return, glossary, first/latest quiz, notes export, native persistence, scoped reset, malformed/blocked storage and 1440/390/360 layouts in both themes.
- Ten supplemental assertions passed: source presence and complete text preservation, actual glossary/appendix counts, and navigation through six other courses using this shell.
- Generic manual terms/navigation/export items are covered by those dedicated checks. Slider items are not applicable to non-model courses; existing gold-volatility double-Escape behavior is unchanged.
- Preview, home card, glossary and mobile screenshots actually inspected.
- True-device Safari, screen readers and original audio/video transcription were not tested; these checks do not establish learning effectiveness.

Evidence retained outside Git at %TEMP%/plc/growth-learning/why-learning-tools-fail/. Deployment and production verification are subsequent, separate release checks. Known Cloudflare injected scripts must be distinguished from course errors without changing CSP.
