# unknown-unknowable update to v2 — 2026-09-19

Course renamed on the card from 未知投资实验室 to 投资于未知与不可知：Zeckhauser 导读 (the page's own title).
Route unchanged: https://learning.jiadi.ai/courses/unknown-unknowable/

## Input

A from-scratch rebuild by `interactive-learning-lab` 2.3.2 (build directory `E:/learning-pages/unknown-unknowable-v2/course`,
index.html sha256 37d36f84…c4df, 500,288 bytes) from Zeckhauser, "Investing in the Unknown and Unknowable",
Capitalism and Society 1(2), 2006 (41-page journal PDF fetched from the author's Harvard site; paragraphs rebuilt from the
PDF layout and verified block by block). The previous page was the 1.x "lab" form imported on 2026-09-15 (9 stations,
5 experiments). The new page has 15 stations (00 map, 01–12 content with stations 10–12 in verbatim-source form,
13 速查与自测, 14 原文全文 with inline backlinks), 73 steps, 48 glossary terms, four draggable models with 59 model tests,
a 28-claim ledger (verified 6, derived 5, disputed 5, unverified 10, hypothesis 2) and five free-text self-checks with
draft autosave. Storage key `interactive-learning-lab:uu-investing:v1` is unchanged and appears literally once, so
existing learner records still load; the station list is different, so an old "visited" record now points at a rebuilt
station.

Reader gate before integration: an Opus reader that had not seen the paper read only the page, then a grader scored its
closed-book retelling against the source at accuracy 4.5 / completeness 4.5 / transfer 4.0 (see the build's qa-report.md).
Page fixes from that gate (Box E/F clarification note, maxims A–H quick-reference table, correction placement, Chinese
status labels, narrow-screen wrapping, three missing passages, "本课注" markers, quiz draft autosave) were applied before
this record.

## Adaptations made for the site

None to the page. Files were already UTF-8 without BOM, LF. No relative references.

Repository changes beyond the course files:

- `courses.json` entry rewritten (title, subtitle, description, tags, 15/48, "4 个可拖模型", "v2 · 推理导读版", level,
  firstTask, imageAlt); category 投资与决策, tone green and storage key unchanged.
- `.github/workflows/live-site-check.yml`: the manual production check hard-coded this course's old markup
  (`#nav button` ×9, `#glossaryBtn`, `#termSearch`, `#themeBtn`, `#exportBtn`, `section.lesson.active`). The course loop
  is now parameterised per course; gold-volatility keeps its selectors, unknown-unknowable uses the template ids
  (`[data-lesson-button]` ×15, `#dictionary-button`, `#term-search`, `#theme-toggle`, `#export-button`,
  `section.lesson:not([hidden])`, sliders on station 03) and the mobile glossary step takes the button per course.
  YAML parses and the embedded Python compiles; the workflow itself was not executed locally. Editing this file
  triggers a run on push, which from GitHub runners is expected to hit Cloudflare's 403 (INCONCLUSIVE), as documented
  in AGENTS.md.
- The preview is an actual screenshot of station 07's bidding model from the local build.

## Checks run (local, http://127.0.0.1:4173, real HTTP, site CSP, native localStorage)

- `npm test`: 106 static integrity checks pass, including all 12 for this course.
- `site_checks.py snapshot` on the delivered file: 15 lessons, 48 terms, 10 range inputs, no 390 px overflow, no
  console errors. Baseline for the comparison below.
- `site_checks.py check` against the built site: **134 pass, 0 fail, 10 warn, 7 manual**. Home card under 投资与决策;
  downloads byte-identical to repository sources; all 15 station texts and the 48-term count match the baseline;
  navigation, sliders update the lesson, glossary (search "UU"), export, typed self-check answer exported and restored
  after reload, other courses' storage sentinels untouched, offline HTML opens from disk, no 390 px overflow on any
  station, no console errors or CSP violations. The "quiz" manual item is because this page has free-text self-checks
  instead of answer buttons; they are covered by the build's own Playwright suite (119/119 on the same file, including
  draft persistence and export). Warnings are the same pre-existing ones as for the other courses.
- Home card, mobile 390 and glossary screenshots inspected. `git diff --stat` for every other course directory is empty.

## Not covered

Real iPhone/Safari, screen readers, Firefox/Edge/WebKit. Historical figures in the paper (Ricardo, the 1996 Berkshire
letter, Recovery Engineering) were first-hand checked where public; classroom statistics and private anecdotes are
presented as the author states them. Production deployment and live verification are reported separately.
