# Seven-course source TOC upgrade validation

Date: 2026-09-17  
Branch: `upgrade-seven-toc`  
Scope: the seven requested `content/courses/<slug>/index.html` files, their generated `public/` copies/downloads, `courses.json`, generated catalog/CSP artifacts, and task-specific validation artifacts. No push or deployment was performed.

## Per-course changes

| Course | Source TOC | Reader-wording replacements | New `metric` |
|---|---:|---:|---|
| `muscle-health-lyon` | 18 actual h3/h4 headings; replaced the old non-sticky inline TOC | 0 | `14 站 · 完整原文` |
| `cognitive-flexibility-langer` | 51 actual h3/h4 headings | 3: start meta `15 个推理单元` → `15 站`; start audit `关键承重主张` → `关键主张`; station 8 `承重点` → `要点` | `15 站 · 完整原文` |
| `reclaim-your-brain` | 19 retained editorial anchors because the verbatim source has no h3/h4 headings | 1: start meta `19 个推理单元` → `19 站` | `19 站 · 完整原文` |
| `overcome-inner-resistance` | 21 actual h3/h4 headings | 2: start meta `19 个推理单元` → `19 站`; station 17 `承重点` → `要点` | `19 站 · 完整原文` |
| `healthy-masculinity` | 65 actual h3/h4 headings | 1: start meta `21 个推理单元` → `21 站` | `21 站 · 完整原文` |
| `language-learning-science` | 13 actual h3/h4 headings | 1: start meta `20 个推理单元` → `20 站` | `20 站 · 完整原文` |
| `why-learning-tools-fail` | 26 actual h3/h4 headings | 2: start meta `25 个推理单元` → `25 站`; start audit `承重主张` → `关键主张` | `25 站 · 完整原文` |

Every source station now has one `.source-layout`: source content on the left and a 230px `.source-side` on the right. The TOC is sticky with viewport-bounded vertical scrolling on desktop and becomes a non-wrapping horizontal sticky strip at `<=900px`, with `top:0` at `<=600px`. The shared enhancement uses a requestAnimationFrame-throttled scroll spy, keeps exactly one active chapter, auto-scrolls the TOC, and maintains a maximum 20-entry `{lesson, scrollY}` return stack. Existing return-button IDs remain in the DOM but their old UI is hidden; `#source-back` is the only visible history control.

## Commands and results

1. Before-change snapshot:

   `python -X utf8 validation/upgrade_seven_toc.py snapshot --out validation/evidence/upgrade-seven-before.json`

   Result: passed. Saved all 154 station texts plus a separate normalized verbatim-source text and SHA-256 for each course.

2. Static before/after and implementation-contract verification:

   `python -X utf8 validation/upgrade_seven_toc.py static --before validation/evidence/upgrade-seven-before.json --out validation/evidence/upgrade-seven-toc/static-results.json`

   Result: 189 passed, 0 failed. This proves station count preservation, per-station text allowlisting, verbatim-source hash identity, single TOC/back markup, required responsive CSS/20-step/rAF code presence, UTF-8 without BOM, and LF endings. It is not a browser-runtime test.

3. Inline JavaScript syntax:

   Node `vm.Script` parsed both inline scripts in each of the seven source pages.

   Result: all seven passed.

4. Skill validator (run once per course):

   `python -X utf8 C:/Users/xueji/.claude/skills/interactive-learning-lab/scripts/validate_page.py content/courses/<slug>/index.html --out validation/evidence/upgrade-seven-toc/validate-<slug>.json`

   Result: all seven overall statuses passed. `no_agent_facing_text` passed for six courses. `why-learning-tools-fail` has the sole expected warning `脚手架`; it is the source material's learning-scaffolding concept and was intentionally retained.

5. Build:

   `node scripts/build.mjs`

   Result: `Built 12 courses for learning.jiadi.ai; original course scripts unchanged.` Generated `public/` contains the seven upgraded course pages and standalone downloads. `public/_headers` changed only through the builder's CSP hash regeneration for the new identical inline enhancement script; no CSP directive was loosened.

6. Repository test:

   `npm test`

   Result: 106 static integrity checks passed. The check covered generated manifest/catalog agreement, CSP hashes, all course/download script parsing, retained DOM IDs and storage namespaces, standalone assets, links, and absence of deployment code/secrets/external runtime calls.

## Browser acceptance and screenshots

Status: `not_run` due host policy, not a page assertion failure.

- Python Playwright was attempted exactly as requested, but the managed Windows sandbox rejected creation of the Playwright driver pipes with `PermissionError: [WinError 5] 拒绝访问`.
- The installed `browser-use` CLI passed its package/browser diagnostics but its daemon could not start in this sandbox.
- The final browser control channel rejected the local `file://` URL under its Browser URL security policy and explicitly prohibited retrying through CDP, another browser surface, or an indirect workaround.

Therefore the following requested runtime checks remain unexecuted: computed sticky behavior; exactly-one-active state after real scrolling; click/back scroll restoration; 1280×720 sidebar-bottom geometry; 1440/390/360 runtime overflow; existing comparison-link click behavior; and visual inspection.

Screenshot paths: `not_run` — no screenshots were created, so no screenshot paths are claimed.

The intended command remains available for an environment that permits Playwright:

`python -X utf8 validation/upgrade_seven_toc.py verify --before validation/evidence/upgrade-seven-before.json --out validation/evidence/upgrade-seven-toc/browser-results.json --screenshots validation/evidence/upgrade-seven-toc/screenshots`

## Git commit

Status: `blocked` by the managed filesystem boundary.

`git add` was attempted with the exact requested source, generated `public/`, and validation paths. Git failed before staging with:

`fatal: Unable to create 'E:/learning-pages/upgrade-seven-courses/.git/index.lock': Permission denied`

The workspace root is writable but `.git` is read-only in this session, so no commit could be created. No alternate repository, branch mutation, push, or deployment was attempted.

## Scope and preservation notes

- The seven verbatim source blocks match the before snapshot hashes.
- All non-source station text matches the before snapshot after applying only the ten listed reader-wording replacements.
- Existing storage keys, course metadata/IDs, existing DOM IDs, quizzes, terms, calculations, exports, and quoted source excerpts were not changed.
- The other five courses (`gold-volatility`, `unknown-unknowable`, `us-data-center-buildout`, `pozsar-money-view`, `huberman-health-qa`) have no source-file diffs.


## Browser acceptance (run by the supervising session, 2026-09-17)

Codex's sandbox could not launch Playwright; the supervising Claude session ran the browser acceptance against the same working tree with Python Playwright + Chromium over `file://`, viewport 1280×720 unless noted.

| Course | Sections | 对照原文 blocks | TOC entries | Sticky | Highlight after TOC click | Back returns to origin | Quote jump → hit highlighted | No overflow 1440/390/360 | Page errors |
|---|---:|---:|---:|---|---|---|---|---|---|
| muscle-health-lyon | 17 | 42 | 18 | yes | 1 | yes | yes | yes | 0 |
| cognitive-flexibility-langer | 18 | 46 | 51 | yes | 1 | yes | yes | yes | 0 |
| reclaim-your-brain | 22 | 57 | 19 | yes | 1 | yes | yes | yes | 0 |
| overcome-inner-resistance | 22 | 57 | 21 | yes | 1 | yes | yes | yes | 0 |
| healthy-masculinity | 24 | 64 | 65 | yes | 1 | yes | yes | yes | 0 |
| language-learning-science | 23 | 61 | 13 | yes | 1 | yes | yes | yes | 0 |
| why-learning-tools-fail | 28 | 75 | 26 | yes | 1 | yes | yes | yes | 0 |

Notes: at scrollY 0 the sticky TOC box sits at its natural position, so its bottom edge can exceed a 720px viewport by 9px (six courses) or ~100px (muscle-health-lyon, whose page header is taller); once the page scrolls the box sticks at 110px and fits, and the box scrolls internally. Screenshots (1440 and 390, source station) are in `evidence/upgrade-seven-toc/screenshots/`.

`courses.json` metric values were corrected after Codex's pass: the "N 站" wording it chose conflicted with the card's own "N 个学习站" count, and muscle-health-lyon's original metric had no internal vocabulary and was restored. The six other courses now show "<对照原文 count> 处原文对照 · 完整原文", counts taken from the DOM above.
