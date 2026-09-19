# healthy-masculinity update to v2 — 2026-09-19

Course renamed on the card from 健康的男性气质 to 健康的男性气质 · 坚定与联结 (the page's own title).
Route unchanged: https://learning.jiadi.ai/courses/healthy-masculinity/

## Input

A from-scratch rebuild by `interactive-learning-lab` 2.3.2 (build directory
`E:/learning-pages/healthy-masculinity-v2/course`, index.html sha256
`ac267ac3…efc4c`, 482,712 bytes, verified against the delivery note before anything was copied;
course-spec.md, source-ledger.csv, qa-report.md and a qa/ evidence folder delivered alongside). Source material
is the Chinese transcript of the Huberman Lab episode "定义健康的男性气质——及如何建立它" with psychotherapist
Terry Real (material dated 2026-02-15, last updated 2026-03-16).

The previous page, imported earlier, had 24 stations and 23 glossary terms in the v1 "引导阅读" form. The new
page has 14 stations (00 map, 01–06 rebuilt prose with the source folded under each step, 07–11 in
verbatim-source form, 12 速查与自测, 13 原文全文), 65 steps carrying premise / reasoning / conclusion prose,
42 glossary terms, a 24-item verification ledger (原文这么说但本课未另行取证 12, 已查一手材料 5,
来源与原文说法不一致 5, 教学假设 2) and five free-text self-checks with draft autosave. The stations are
ordered by prerequisite rather than by the interview's own sequence: diagnosis (01), definition (02–03),
the self-esteem hinge (04), emotion and the adaptive child (05–06), then the skills and the places to practise
them (07–11). There is no numerical model, so the page has no sliders.

Storage key `learning:healthy-masculinity:v1` is unchanged and appears literally once in the source, so existing
learner records still load. The station list is different, so an old "visited" record now points at a rebuilt
station.

Reader gate before integration: a reader that had not heard the interview read only the page, and a grader scored
its closed-book retelling at accuracy 4 / completeness 4 / exampleQuality 4.5. The page fixes raised by that gate
were applied by the lab before delivery; the retelling was not re-scored on the fixed page.

## Adaptations made for the site

- **Line endings.** Both delivered files were CRLF throughout. They were copied in as UTF-8 without BOM and LF,
  per the repository's `autocrlf=input` setting, so the local build hashes match CI.
- **Station 12's class attribute.** The delivered page marked the 速查与自测 station
  `<section class="lesson cheat" data-lesson="12">`. `scripts/check.mjs` counts chapters with
  `/<section class="lesson(?: active)?"/g`, which matches the exact attribute value only, so it counted 13 while
  the DOM (and the page's own text, "左边一共 14 项") has 14. Declaring `chapters: 14` would have failed the
  build check, and declaring 13 would have put a number on the card that the page contradicts. The attribute was
  changed to `class="lesson" data-cheat` and the 15 CSS selector tokens that targeted `.cheat` were rewritten to
  `[data-cheat]`. The `cheat` name is used nowhere in the page's JavaScript, so this is a markup/CSS rename with
  no visual or behavioural change: rendering, text, glossary, self-checks, export and the storage key are as
  delivered. Verified after the change: the check.mjs regex counts 14 and the station renders identically.

No other change to the page. Preflight found no relative references, no inline event attributes, no template
residue, and the storage key already written as a literal (no 5.1 adaptation needed). Repository copies:
index.html 481,876 bytes sha256 `b138ee4f…ef0c`, study-notes.md 59,775 bytes sha256 `1ff2425e…9b4a9`.

Repository changes beyond the course files:

- `courses.json` entry rewritten in place as text (title, subtitle, description, 5 tags, 14 stations, 42 terms,
  metric "24 条主张核查", version "v2 · 推理导读版", level, firstTask, imageAlt). Category 学习与成长, tone green
  and the storage key are unchanged. No other course entry was reformatted.
- `content/previews/healthy-masculinity.webp` replaced with an actual screenshot of station 12's
  可照做的固定步骤 quick-reference table taken from the local build (1120×960, 115,208 bytes).
- `.github/workflows/live-site-check.yml` needed **no** change: its hard-coded course loop covers only
  gold-volatility and unknown-unknowable. The publish skill's `site_checks.py` KNOWN table likewise has no entry
  for this slug, and the template defaults it falls back to (`[data-lesson-button]`, `#dictionary-button`,
  `#term-search`, `#theme-toggle`, `#export-button`, `section.lesson:not([hidden])`) are exactly the ids this page
  uses, confirmed against the source before running.

## Checks run (local, http://127.0.0.1:4173, real HTTP, site CSP, native localStorage)

- `npm test`: **106 static integrity checks pass**, including all eight for this course.
- `site_checks.py snapshot` on the delivered file: 14 lessons, 42 terms, 0 range inputs, runtime storage key
  `learning:healthy-masculinity:v1`, no 390 px overflow, no console errors. Baseline for the comparison below.
- `site_checks.py check` against the built site: **134 pass, 0 fail, 10 warn, 5 manual**. Home card under
  学习与成长 showing 14 个学习站 / 24 条主张核查 / 42 个术语; both downloads byte-identical to the repository
  sources (index 481,876 bytes, notes 59,775 bytes); all 14 station texts and the 42-term count identical to the
  baseline; navigation, glossary (single Escape closes), inline terms, export, typed note restored after reload,
  state written only under the declared key, other courses' storage sentinels untouched, offline HTML opens from
  disk, no 390 px overflow on any of the 14 stations, no console errors or CSP violations. The `sliders` manual
  item is because this course has no numerical model; the `quiz` manual item is because the self-checks are
  free-text and have no answer buttons. Both are covered by the supplemental run below. The ten warnings are the
  pre-existing ones for other courses (gold-volatility's double-Escape glossary, and "no visible slider" on the
  prose courses).
- Course-specific supplemental Playwright run (`%TEMP%/plc/healthy-masculinity/supplement.py`): **27/27 pass** —
  the five free-text self-checks on station 12 with their submit buttons, submitting q1 changing its status line,
  a reference answer expanding, two typed drafts surviving reload, a draft appearing in the exported notes, the
  six cheat-sheet jump buttons reaching their sections, a cheat-table 出处 button jumping to the cited station,
  the 对照原文 fold expanding and its 在原文中查看 jump reaching station 13 with the generated 返回 link coming
  back to station 01, the 讲解 (`#coach-toggle`) toggle collapsing and restoring commentary and reporting
  `aria-pressed`, the 我的复习单 panel opening, an inline term opening the glossary, glossary search on 自尊,
  one Escape closing it, theme toggling and persisting across reload, the resume card continuing at a visited
  station, `#reset-progress` clearing this course's record, and no page or console errors.
- Screenshots inspected, not merely generated: home card, 390 px course page, desktop glossary dialog, and a
  dedicated 390 px capture of station 12's quick-reference table (`shots/mobile-390-station12.png`) confirming the
  table is readable and the page does not overflow.
- `git diff --stat` is empty for every other course's sources, previews, published pages and downloads; the only
  shared files touched are `public/_headers` (this course's script hash), `public/index.html` (its card) and
  `public/site-manifest.json` (its entry, sourceSha256 `b138ee4f…ef0c`).

## Not covered

Real iPhone/Safari, screen readers, Firefox/Edge/WebKit. The closed-book reader gate was not re-run after the
post-gate fixes. The course is a guided reading of a podcast interview, not medical or psychotherapeutic advice;
the suicide, loneliness and mortality statistics it quotes are marked with their verification status on the page,
and the five substantive discrepancies found against primary sources are written into the steps that use them.
Production deployment and live verification are reported separately.
