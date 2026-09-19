# language-learning-science update to v2 — 2026-09-19

Course renamed on the card from 学习语言的科学 to 学习语言的科学 · 声音、经验与交流 (the page's own title).
Route unchanged: https://learning.jiadi.ai/courses/language-learning-science/

## Input

A from-scratch rebuild by `interactive-learning-lab` 2.3.2 (build directory
`E:/learning-pages/language-learning-science-v2/course`, index.html sha256
`325614c7…1920`, 477,594 bytes, verified against the delivery note before anything was copied; course-spec.md,
source-ledger.csv, qa-report.md and a qa/ evidence folder delivered alongside). Source material is the Chinese
transcript of the Huberman Lab interview with Eddie Chang, neurosurgery chair at UCSF (material date 2026-02-15).

The previous page, imported on 2026-09-16, had 23 stations and 24 glossary terms in the v1 "引导阅读" form.
The new page has 15 stations (00 map, 01–08 rebuilt prose with the source folded under each step, 09–12 in
verbatim-source form, 13 速查与自测, 14 原文全文), 59 steps carrying premise / reasoning / conclusion prose,
56 glossary terms, a 40-item verification ledger (原文这么说未做外部核查 22, 已查一手资料 13, 与一手资料有出入或
口径不同 4, 可按给定前提复算 1) and five free-text self-checks with draft autosave. The stations are ordered by
prerequisite rather than by the interview's own sequence: method (01–03), correction (04–05), mechanism (06–08),
application (09–12). There is no numerical model, so the page has no sliders.

Storage key `learning:language-learning-science:v1` is unchanged and appears literally once in the source, so
existing learner records still load. The station list is different, so an old "visited" record now points at a
rebuilt station.

Reader gate before integration: a reader that had not heard the interview read only the page, and a grader scored
its closed-book retelling at accuracy 4.5 / completeness 4 / exampleQuality 4.5. The page fixes raised by that gate
were applied by the lab before delivery; the retelling was not re-scored on the fixed page.

## Adaptations made for the site

- **Line endings only.** Both delivered files were CRLF throughout. They were copied in as UTF-8 without BOM and
  LF, per the repository's `autocrlf=input` setting, so the local build hashes match CI. Repository copies:
  index.html 477,150 bytes sha256 `bf5fa2b0…f808d`, study-notes.md 49,260 bytes sha256 `126851f9…431d`. No other
  change to the page: text, scripts, exports, glossary, the verification ledger and the storage key are as
  delivered. Preflight found no relative references, no inline event attributes, no template residue, and the
  storage key already written as a literal (no 5.1 adaptation needed).

Repository changes beyond the course files:

- `courses.json` entry rewritten in place as text (title, subtitle, description, 5 tags, 15 stations, 56 terms,
  metric "40 条主张核查", version "v2 · 推理导读版", level, firstTask, imageAlt). Category 学习与成长, tone gold
  and the storage key are unchanged. No other course entry was reformatted.
- `content/previews/language-learning-science.webp` replaced with an actual screenshot of station 13's 定性结论
  quick-reference table taken from the local build (1120×960, 98,648 bytes).
- `.github/workflows/live-site-check.yml` needed **no** change: its hard-coded course loop covers only
  gold-volatility and unknown-unknowable. The publish skill's `site_checks.py` KNOWN table likewise has no entry
  for this slug, and the template defaults it falls back to (`[data-lesson-button]`, `#dictionary-button`,
  `#term-search`, `#theme-toggle`, `#export-button`, `section.lesson:not([hidden])`) are exactly the ids this page
  uses, confirmed against the source before running.

## Checks run (local, http://127.0.0.1:4173, real HTTP, site CSP, native localStorage)

- `npm test`: **106 static integrity checks pass**, including all eight for this course.
- `site_checks.py snapshot` on the delivered file: 15 lessons, 56 terms, 0 range inputs, runtime storage key
  `learning:language-learning-science:v1`, no 390 px overflow, no console errors. Baseline for the comparison below.
- `site_checks.py check` against the built site: **135 pass, 0 fail, 10 warn, 6 manual**. Home card under 学习与成长
  showing 15 个学习站 / 40 条主张核查 / 56 个术语; both downloads byte-identical to the repository sources
  (index 477,150 bytes, notes 49,260 bytes); all 15 station texts and the 56-term count identical to the baseline;
  navigation, glossary (single Escape closes), inline terms, export, typed note restored after reload, state written
  only under the declared key, other courses' storage sentinels untouched, offline HTML opens from disk, no 390 px
  overflow on any of the 15 stations, no console errors or CSP violations. The `sliders` manual item is because this
  course has no numerical model; the `quiz` manual item is because the self-checks are free-text and have no answer
  buttons. Both are covered by the supplemental run below. The ten warnings are the pre-existing ones for other
  courses (gold-volatility's double-Escape glossary, and "no visible slider" on the eight prose courses).
- Course-specific supplemental Playwright run (`%TEMP%/plc/language-learning-science/supplement.py`): **25/25 pass** —
  five free-text self-check boxes on station 13 with their submit and clear buttons, submitting one revealing its
  feedback and reference answer, two typed drafts surviving reload, a draft appearing in the exported notes, the clear
  button emptying one box, the five cheat-sheet jump buttons scrolling to their sections, the 在原文中查看 jump from
  station 01 reaching station 14 and the generated 返回 link going back to the citing station, the 讲解 (review-mode)
  toggle collapsing and restoring commentary, the 复习清单 dialog opening and closing with Escape, glossary search on
  音素, theme persisting across reload, and no page or console errors.
- Screenshots inspected, not merely generated: home card, station 13 preview crop, 390 px course page, desktop
  glossary dialog.
- `git diff --stat` is empty for every other course's sources, previews, published pages and downloads; the only
  shared files touched are `public/_headers` (this course's script hash), `public/index.html` (its card) and
  `public/site-manifest.json` (its entry).

## Not covered

Real iPhone/Safari, screen readers, Firefox/Edge/WebKit. The closed-book reader gate was not re-run after the
post-gate fixes. The course is a guided reading of a podcast interview, not medical advice; the epilepsy, dyslexia,
stuttering and implant material describes what researchers do and is marked as such on the page. Production
deployment and live verification are reported separately.
