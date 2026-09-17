# Pozsar course update to v2 — 2026-09-17

Course: `pozsar-money-view`, card title changed to Pozsar 货币观：从资产负债表到全球储备 (was Pozsar 全球货币框架 · 交互导读).
Route unchanged: https://learning.jiadi.ai/courses/pozsar-money-view/

## Input

A full rebuild of the guided reading produced by `interactive-learning-lab` 2.2.1 (page COURSE_META.version 2.0.0) from
the same user-supplied Fzz report dated 2026-05-23, delivered on 2026-09-17 with `pozsar-money-view_study_notes.md`,
`course-spec.md`, `source-ledger.csv` and `qa-report.md`. Delivery manifest SHA-256 of index.html:
`01c2a8f2648802e3f60aa532001a4abd9a07e754938a95ba33b1bb484260be6f`. The repository copy is byte-identical to that file.

Compared with the v1 page published on 2026-09-16: 39 stations instead of 23 (37 = 速查与自测, 38 = 原文全文 with the
whole report and 447 inline backlinks), 40 glossary terms instead of 33, 4 scenario self-checks instead of 5, and an
84-claim ledger (verified 16, disputed 34, unverified 21, hypothesis 12, derived 1) shown next to the affected steps.
The v1 page embedded the handbook, ledger and QA notes as data-URI downloads; v2 keeps only the page's own 导出笔记
button. No numeric model in either version.

## Adaptations made for the site

None to the page or the notes. Both files were already UTF-8 without BOM with LF line endings, the storage key
`pozsar-money-view:v1` is already a literal in the source, and the page has no relative-path assets, inline event
attributes or external requests. `courses.json` entry rewritten for v2 (title, subtitle, description, tags, 39/40,
"84 条主张核查", "v2 · 带核查的导读", firstTask, imageAlt); category 投资与决策, tone gold and storage key unchanged.

The storage key was deliberately kept so existing learner records still load. Because the station list changed, an
old "visited up to station N" record now points at a different station and old self-check answers do not map onto
the new questions. This was explained to the user before integration and accepted.

The preview is an actual screenshot of station 37 (口径速查 table) taken from the local build at 1120×960.

## Checks run (local, http://127.0.0.1:4173, real HTTP, site CSP, native localStorage)

- `npm test`: 106 static integrity checks pass, including all 12 for this course (byte-identical scripts, unchanged
  download and notes, DOM ids retained, 39 chapters, storage namespace present and colliding with no other course).
- `site_checks.py snapshot` on the delivered file: 39 lessons, 40 terms, 0 range inputs, storage key as declared,
  no 390 px horizontal overflow on any station, no console errors. Used as the baseline.
- `site_checks.py check` against the built site: **180 pass, 0 fail, 9 warn, 7 manual**. Home card renders under
  投资与决策; both downloads byte-identical to the repository sources; all 39 station texts and the 40-term count
  match the baseline; navigation, glossary (search "货币"), self-check feedback, export, persistence and reload work
  under the site's CSP; the other eleven courses' storage sentinels were untouched; offline HTML opens from disk;
  no 390 px overflow on any of the 39 stations; no console errors or CSP violations.
  All warnings and manual items except one belong to other courses and predate this change (gold-volatility needs
  two Escape presses; the eight newer courses expose no slider and no recognised navigation selector). The remaining
  manual item, "no visible range inputs found", is accurate: this course has no sliders.
- Course-specific Playwright checks (`extra_checks.py`, 6/6 pass): a 对照原文 jump from station 01 opens station 38
  with the cited paragraph highlighted and in view; the 返回 button restores station 01; an inline `← 站 NN`
  backlink in the full-source station returns to the cited step; no console or page errors.
- Home card, mobile 390 and glossary screenshots inspected. `git diff --stat` for every other course directory is empty.

## Not covered

Real iPhone/Safari, screen readers, Firefox/Edge/WebKit. Financial correctness of the report's claims is the
ledger's job, not this integration's. Production deployment and live verification are reported separately.

---

# Pozsar course integration — 2026-09-16

Course: `pozsar-money-view`, Pozsar 全球货币框架 · 交互导读.

## Input and boundaries

Completed offline guided reading based on the user-supplied Fzz report dated 2026-05-23. 23 stations include orientation, 21 reasoning units and review; 33 glossary entries; five scenario questions; no numerical model. This is a critical guided reading, not a reproduction of verified Pozsar primary research or a live market dashboard.

## Approved adaptations

- Normalize UTF-8 without BOM and LF line endings before building.
- Embed handbook, evidence ledger and QA notes as downloadable data URIs. Update only the sentence that previously required sidecar files. Preserve all course scripts, terms, defaults and storage key `pozsar-money-view:v1`.
- Replace the handbook's machine-specific source path with its original filename. No content or calculation rewrite.
- Add catalog entry under existing 投资与决策, gold card tone. The preview is an actual screenshot of station 5 (ON RRP).
- Preserve and exclude pre-existing untracked `labs/huberman-health-qa/` files as explicitly authorized by the user.

## Evidence before integration

The standalone course passed 159 dedicated Chromium assertions, including real file opening, navigation, glossary, first/latest answers, export, reload, scoped reset, storage failure recovery, 1440/390/360 layouts. The skill snapshot confirms 23 stations, 33 terms, no 390px overflow and no script errors. Desktop, mobile and dark screenshots were inspected.

## Local publication checks

- Final npm test: 42 static integrity checks passed. All original course scripts remain unchanged.
- Generic site checks: 85 pass, 1 fail, 1 warning, 3 manual items. The failure is a checker selector mismatch: its button text fallback selects the sidebar navigation containing 导出 instead of the actual #export button. The raw report is retained; dedicated tests below prove actual export and subsequent actions.
- Dedicated HTTP/CSP browser tests: 88 checks passed, with zero console or page errors. Covered all 23 navigation buttons, five scenario questions (first/latest answers and feedback), glossary search and focus restoration, native reload/resume, #export download contents, scoped reset with old-course storage sentinels, three embedded downloads byte-for-byte, explanation toggle, dark mode, return-home navigation and every station at 390px/360px.
- Generic manual navigation and quiz items were resolved by dedicated tests. Sliders and free-text memo are not present and are not applicable.
- All three existing courses passed the generic regression suite. Existing gold glossary sometimes needs two Esc presses; this pre-existing warning is unchanged.
- Downloaded HTML and handbook match source bytes; standalone file opens offline. Desktop, mobile, glossary and preview screenshots inspected.
- Original and adapted snapshots match all station text except the approved attachment sentence. All glossary terms, scripts, defaults and storage namespace are preserved.
- Existing course source directories have no diff. git diff --check passed. Pre-existing labs files are excluded.

Evidence: local-checks.json, local-extra.json, original.json, adapted.json and screenshots in the temporary plc/pozsar-money-view working directory. The standalone source also retains its dedicated QA artifacts.

Production deployment and live verification remain pending final push approval. True-device Safari and screen-reader testing are not performed.
