# pozsar-money-view update to v3 — 2026-09-19

Course: `pozsar-money-view`. Card title unchanged (Pozsar 货币观：从资产负债表到全球储备, which is also the
page's own `<title>`). Route unchanged: https://learning.jiadi.ai/courses/pozsar-money-view/

## Input

A from-scratch rebuild by `interactive-learning-lab` 2.3.2 (build directory
`E:/learning-pages/pozsar-money-view-v3/course`), delivered with `pozsar-money-view_study_notes.md`,
`course-spec.md`, `source-ledger.csv`, `qa-report.md`, `model-tests.mjs` and a `qa/` evidence folder.
Delivery manifest SHA-256 of index.html
`71f2c693fbe20fe32b0d102718c4ca663044a3bc94bc48ef8279b53b38cb6fab`, 701,314 bytes — verified against the
delivered file before anything was copied. Source material is unchanged: Fzz,
《Zoltan Pozsar 全球货币分析框架解析与实证检验》, dated 2026-05-23; this course's verification readings are
dated 2026-09-19, and station 00 states that four-month gap explicitly.

Compared with the v2 page published on 2026-09-17:

- 22 stations instead of 39 (00 起点与地图, 01–19 the argument in prerequisite order, 20 速查与自测,
  21 原文全文), carrying 110 steps of premise / reasoning / conclusion prose.
- 66 glossary terms instead of 40.
- **Two draggable numerical models, which v2 did not have**: station 05 的做市容量模型
  (上限 = 一级资本 ÷ 要求比率；余量 = 上限 − 现有暴露；可新增匹配账簿 = 余量 ÷ 2) and station 08 的准备金模型
  (准备金 = 美联储总资产 − ON RRP − TGA − 流通中现金与其他负债，冲击先由 ON RRP 吸收). Seven range inputs in
  total, each with a redrawn chart, an accessible chart description, preset buttons and a reset.
- A 30-record verification ledger computed from `source-ledger.csv` (verified 15, derived 3, hypothesis 2,
  unverified 8, disputed 2), shown on the page as 2 默认展开的「纠错」 and 18 折叠的「核查」 next to the steps
  they affect. v2 carried an 84-claim ledger built on a different, looser standard: v3 only takes primary
  sources for key numbers and named studies (H.4.1, FRED ON RRP/SOFR/10y, the eSLR final rule, NY Fed SRF
  operations, WGC, IMF COFER, Treasury Debt to the Penny, and a 2026-09-03 Fed research note), and presents
  people, anecdotes and the report's own estimates as-is. The two corrections are the eSLR capital release
  (report says $130B; the primary sources give ~$13B at holding-company level and ~$219B at depository level)
  and "黄金已超越美债" (foreign official holdings of Treasuries still exceed gold by about $1trn once five
  non-accumulating holders are excluded).
- Five free-text scenario self-checks on station 20 with per-question submit, clear, autosaved drafts and
  reference answers that carry jump buttons back to the cited step.

The page passed the lab's closed-book reader gate (accuracy 4 / completeness 5 / exampleQuality 5) and the
fixes raised by that gate were applied by the lab before delivery; the retelling was not re-scored on the
fixed page.

## Adaptations made for the site

- **Line endings.** The delivered index.html was CRLF throughout (study notes were already LF). Both files
  were copied in as UTF-8 without BOM and LF, per the repository's `autocrlf=input` setting, so local build
  hashes match CI. Repository copies: index.html 698,047 bytes sha256
  `2459ceb835ce9d88db3afff63b13cb35c988396696952621729bb6623b5302eb`, study-notes.md 20,577 bytes sha256
  `c414e472c33737a1203316b75a4f8fe3f39515f2125e55cc9d2ec8a9f1e4ca6e`.

Nothing else was changed in the page or the notes. Preflight found no relative-path references, no inline
event attributes, no external requests, no template residue, and the storage key already written as a
literal, so neither the 5.1 nor the 5.6 adaptation was needed. All 22 station elements are exactly
`<section class="lesson" …>`, so `scripts/check.mjs` (which matches the exact class attribute) counts 22 —
the extra-class problem hit on the previous course did not recur here and no markup rename was required.

Storage key `pozsar-money-view:v1` is unchanged and appears literally once in the source, so existing learner
records still load. Because the station list is completely different (22 instead of 39), an old "visited up
to station N" record now points at a rebuilt station and v2's four self-check answers do not map onto v3's
five questions.

Repository changes beyond the course files:

- `courses.json` entry rewritten in place as text (subtitle, description, 5 tags, 22 stations, 66 terms,
  metric "2 个可拖模型", version "v3 · 推理导读版", level, firstTask, imageAlt). Title, category 投资与决策,
  tone gold and the storage key are unchanged. No other course entry was reformatted. The metric names the
  two models rather than the ledger because the card already shows station and term counts, the models are
  what distinguishes this course from the site's prose courses, and "30 条主张核查" next to v2's "84 条主张
  核查" would read as a regression rather than as a different, stricter standard.
- `content/previews/pozsar-money-view.webp` replaced with an actual screenshot of station 08's reserve model
  taken from the local build (1120×960, 90,586 bytes), framed so the card's visible top half shows the
  sliders, the post-shock reserve readout and the chart.
- `.github/workflows/live-site-check.yml` needed **no** change: its hard-coded course loop covers only
  gold-volatility and unknown-unknowable, so the 39-station figure for this course appears nowhere in it.
  The publish skill's `site_checks.py` KNOWN table likewise has no entry for this slug, and the template
  defaults it falls back to (`[data-lesson-button]`, `#dictionary-button`, `#term-search`, `#theme-toggle`,
  `#export-button`, `section.lesson:not([hidden])`) are exactly the ids this page uses, confirmed against the
  source before running.

## Checks run (local, http://127.0.0.1:4173, real HTTP, site CSP, native localStorage)

- `npm test`: **106 static integrity checks pass**, including all eight for this course.
- `site_checks.py snapshot` on the delivered file: 22 lessons, 66 terms, 7 range inputs, runtime storage key
  `pozsar-money-view:v1`, no 390 px overflow, no console errors. Baseline for the comparison below.
- `site_checks.py check` against the built site: **151 pass, 0 fail, 10 warn, 4 manual**. Home card under
  投资与决策 showing 22 个学习站 / 2 个可拖模型 / 66 个术语; both downloads byte-identical to the repository
  sources (index 698,047 bytes, notes 20,577 bytes); all 22 station texts and the 66-term count identical to
  the baseline; navigation, **sliders a real check here — all seven update their readouts**, glossary (single
  Escape closes), inline terms, export, typed note restored after reload, state written only under the
  declared key, other courses' storage sentinels untouched, offline HTML opens from disk, no 390 px overflow
  on any of the 22 stations, no console errors or CSP violations. The single `quiz` manual item is because
  the self-checks are free-text and have no `[data-answer]` buttons; it is covered by the supplemental run
  below. The ten warnings and three other manual items are pre-existing ones for other courses
  (gold-volatility's double-Escape glossary, "no visible slider" on the prose courses, and three older
  courses with no known navigation selector).
- Course-specific supplemental Playwright run (`%TEMP%/plc/pozsar-money-view/supplement.py`): **52/52 pass** —
  the five free-text self-checks with submit, status-line change, expanding reference answers and the clear
  button; the SLR model (headroom 4,000 at 一级资本 2,000 / 要求比率 5%, a higher required ratio shrinking
  capacity, chart redraw, chart description, both presets, reset to defaults); the reserve model (opening
  reserves 31,200 and post-shock 26,200 at the default 67,000 / 0 / 8,800 / 5,000, an ON RRP buffer of 6,000
  absorbing the shock first and leaving 25,200, both presets, reset to defaults); a cheat-sheet 出处 button
  landing on the cited station; the 对照原文 fold expanding; the 讲解 toggle reporting `aria-pressed`;
  glossary search on 基差 and the 只看复习词 filter with one Escape closing; a submitted answer and an
  unsubmitted draft both surviving reload and both appearing in the exported notes; only this course's
  storage key written; `#reset-progress` clearing this course's answers and drafts; and no page or console
  errors.
- Screenshots inspected, not merely generated: home card, the 390 px course page, the desktop glossary
  dialog, and station 08's model (the capture used as the preview).
- `git diff --stat` is empty for every other course's sources, previews, published pages and downloads; the
  only shared files touched are `public/_headers` (this course's two script hashes replacing its one),
  `public/index.html` (its card) and `public/site-manifest.json` (its entry, sourceSha256 `2459ceb8…02eb`).

## Not covered

Real iPhone/Safari, screen readers, Firefox/Edge/WebKit. The closed-book reader gate was not re-run after the
post-gate fixes. The models are teaching identities with stated boundaries on the page (the reserve model
fixes 流通中现金与其他负债 at 27,000 亿美元 and treats "先 ON RRP、后准备金" as a determinate settlement order),
not forecasts; the eight claims the course presents as-is without external verification are listed in the
study notes. Nothing here is investment advice or real-time market data. Production deployment and live
verification are reported separately.
