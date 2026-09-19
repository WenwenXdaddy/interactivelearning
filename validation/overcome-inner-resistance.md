# overcome-inner-resistance update to v2 — 2026-09-19

Course renamed on the card from 如何克服内心阻力 to 如何克服内心阻力 · 从想做到做成 (the page's own title).
Route unchanged: https://learning.jiadi.ai/courses/overcome-inner-resistance/

## Input

A from-scratch rebuild by `interactive-learning-lab` 2.3.2 (build directory
`E:/learning-pages/overcome-inner-resistance-v2/course`, index.html sha256
`e9a828e8…8860`, 397,373 bytes; study notes sha256 `ecd07adb…31e2`; course-spec, source-ledger.csv and
qa-report.md delivered alongside). Source material is the frozen Chinese transcript of the Huberman Lab
interview with Steven Pressfield (531 lines, 125,799 bytes, sha256 `fd8b0967…52ea`), copied byte for byte
from the previous build's source snapshot.

The previous page, imported on 2026-09-16, had 22 stations and 18 glossary terms in the v1 "引导阅读"
form. The new page has 13 stations (00 map, 01–10 content with stations 06–10 in verbatim-source form,
11 速查与自测, 12 原文全文 with inline return links), 52 steps carrying premise / reasoning / conclusion
prose, 26 glossary terms, a 22-item verification ledger (原文与核查不一致 8, 未外部核查 7, 已查一手材料 5,
可从材料推出 2) and five free-text self-checks with draft autosave. There is no numerical model, so the
page has no sliders.

Storage key `learning:overcome-inner-resistance:v1` is unchanged and appears literally once in the source,
so existing learner records still load. The station list is different, so an old "visited" record now points
at a rebuilt station.

Reader gate before integration: an Opus reader that had not heard the interview read only the page, and a
grader scored its closed-book retelling at accuracy 4 / completeness 4 / exampleQuality 5. The page fixes
from that gate (speaker-label notices on stations 01–05, corrected attribution on station 05, an added
mentor step on station 02, scope note on station 04, two restored quotations) were applied before this
record. The build's own re-run after the fixes was `verify.py` 254/254 and `behavior.py` 90/90; the closed-book
retelling was not re-scored on the fixed page.

## Adaptations made for the site

- **Line endings only.** Both delivered files were CRLF throughout (1,382 and 483 occurrences). They were
  copied in as UTF-8 without BOM and LF, per the repository's `autocrlf=input` setting, so the local build
  hashes match CI. Repository copies: index.html 395,991 bytes sha256 `25d4cf01…8895`, study-notes.md
  41,669 bytes sha256 `cb8f9f71…893b`. No other change to the page: text, scripts, exports, glossary,
  the verification ledger and the storage key are as delivered. No relative references to resolve.

Repository changes beyond the course files:

- `courses.json` entry rewritten in place as text (title, subtitle, description, 5 tags, 13 stations,
  26 terms, metric "22 条主张核查", version "v2 · 推理导读版", level, firstTask, imageAlt). Category 健康与科学,
  tone gold and the storage key are unchanged. No other course entry was reformatted.
- `content/previews/overcome-inner-resistance.webp` replaced with an actual screenshot of station 11's
  规则与比例 quick-reference table taken from the local build (1120×960, 83,900 bytes).
- `.github/workflows/live-site-check.yml` needed **no** change: its hard-coded course loop covers only
  gold-volatility and unknown-unknowable. The publish skill's `site_checks.py` KNOWN table likewise has no
  entry for this slug, and the template defaults it falls back to (`[data-lesson-button]`,
  `#dictionary-button`, `#term-search`, `#theme-toggle`, `#export-button`, `section.lesson:not([hidden])`)
  are exactly the ids this page uses, confirmed against the source before running.

## Checks run (local, http://127.0.0.1:4173, real HTTP, site CSP, native localStorage)

- `npm test`: **106 static integrity checks pass**, including all eight for this course.
- `site_checks.py snapshot` on the delivered file: 13 lessons, 26 terms, 0 range inputs, no 390 px overflow,
  no console errors. Baseline for the comparison below.
- `site_checks.py check` against the built site: **130 pass, 0 fail, 10 warn, 7 manual**. Home card under
  健康与科学 showing 13 个学习站 / 22 条主张核查 / 26 个术语; both downloads byte-identical to the repository
  sources; all 13 station texts, the 26-term count and every default identical to the baseline; navigation,
  glossary (search 阻力), inline terms, export, typed note restored after reload, state written only under the
  declared key, other courses' storage sentinels untouched, offline HTML opens from disk, no 390 px overflow
  on any station, no console errors or CSP violations. The `sliders` manual item is because this course has no
  numerical model; the `quiz` manual item is because the self-checks are free-text and have no answer buttons.
  Both are covered by the supplemental run below. The ten warnings are the pre-existing ones for other courses
  (gold-volatility's double-Escape glossary, and "no visible slider" on the eight prose courses).
- Course-specific supplemental Playwright run (`%TEMP%/plc/overcome-inner-resistance/supplement.py`):
  **13/13 pass** — five free-text self-check boxes on station 11, a typed draft surviving reload, the draft
  appearing in the exported notes, the 28 quick-reference rows carrying 站 XX · 第 N 步 back-jump buttons that
  land on the cited station, the 在原文中查看 jump from station 01 reaching station 12, the generated
  `← 站 01` return link there going back to the citing step, theme toggle persisting across reload, and no
  page or console errors.
- Screenshots inspected, not merely generated: home card, station 11 preview crop, 390 px course page,
  desktop glossary dialog.
- `git diff --stat` is empty for every other course's sources, previews, published pages and downloads.

## Not covered

Real iPhone/Safari, screen readers, Firefox/Edge/WebKit. The closed-book reader gate was not re-run after the
post-gate fixes. The interview's personal frameworks (阻力, 缪斯, 职业精神) are presented as the author states
them and are not treated as falsifiable claims; the host's training and neuroscience remarks are marked on
station 04 as spoken claims from the show. Production deployment and live verification are reported separately.
