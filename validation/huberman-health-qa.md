# huberman-health-qa update to v3 — 2026-09-18

Course: 你最关心的健康问题 · 交互导读 (card title kept; the page's own title stays 你最关心的健康问题｜Huberman 问答导读).
Route unchanged: https://learning.jiadi.ai/courses/huberman-health-qa/

## Input

A full rebuild by `interactive-learning-lab` 2.3.2 from the same Chinese transcript (build directory
`E:\learning-pages\huberman-health-qa-v3`, page COURSE_META.version 3.2.0), delivered 2026-09-18 with
`huberman-health-qa_study_notes.md`, `course-spec.md`, `source-ledger.csv`, `stations/*.json` and `qa-report.md`.
Compared with v2: still 18 stations (00 map, 01–15 content, 16 速查与自测, 17 原文全文), but the content stations are
rebuilt under the 2.3.x rules — each step carries premise / reasoning / conclusion prose, stations 12–15 are
"source-as-body" (verbatim paragraphs with lead-in and annotations, announced at station 0 and at each station head),
verification labels moved out of the body into the handbook and glossary, corrections placed after the step prose,
quick reference gained a 定性结论 section with 30 linked rows, and the five self-checks are free-text (complete a
process / respond to a change / transfer to a new case) with separate folded answers. Glossary grew from 25 to 55 terms;
ledger 37 claims (verified 11, derived 2, unverified 15, disputed 9). No numeric model. Storage key
`interactive-learning-lab:huberman-health-qa:v1` is unchanged, so existing learner records still load (as before, an old
"visited" record now points at a rebuilt station).

## Adaptations made for the site

One mechanical adaptation, agreed by the user before integration:

1. **Handbook link target.** Station 00 linked to `huberman-health-qa_study_notes.md`, a sibling file the builder does
   not publish. The single `href` was changed to `study-notes.md` with `download="huberman-health-qa-study-notes.md"`
   (same change as v2). No other byte of the page differs from the delivered build.

One content fix, agreed by the user during integration and applied in the course build (not in the repository copy):
the self-check answer boxes said "只保存在本浏览器" but only saved when a mark button was pressed, so a reload lost an
unmarked draft. The build now saves the draft on input, restores it on reload and includes it in the exported notes
(`草稿：` line). The page was rebuilt, its own checks rerun (validate_page 17/17, smoke generic, browser_check 106/106,
leak_check 0 hits) and the repository copy replaced from that rebuild.

Files are UTF-8 without BOM, LF. `courses.json` entry rewritten for v3 (subtitle, description, one tag, terms 55,
"37 条主张核查", "v3 · 推理导读版", level, firstTask, imageAlt); title, category 健康与科学, tone gold and storage key
unchanged. The preview is an actual screenshot of station 16 (速查 table) from the local build.

## Checks run (local, http://127.0.0.1:4173, real HTTP, site CSP, native localStorage)

- `npm test`: 106 static integrity checks pass, including all 12 for this course.
- `site_checks.py snapshot` on the delivered file: 18 lessons, 55 terms, 0 range inputs, no 390 px overflow, no
  console errors. Baseline for the comparison below.
- `site_checks.py check` against the built site: **141 pass, 1 fail, 9 warn, 7 manual**. Home card under 健康与科学;
  downloads byte-identical to repository sources; all 18 station texts and the 55-term count match the baseline;
  navigation, glossary (search "皮质"), self-check typed note exported and restored after reload, persistence, other
  courses' storage sentinels untouched, offline HTML opens from disk, no 390 px overflow on any station, no console
  errors or CSP violations. The one `fail` ("answer button in lesson 9 shows feedback") is a selector mismatch: the
  script clicks the `[data-predict]` container, while this page's choices are `button[data-predict-q]`; covered by the
  course-specific check below. Warnings/manual items are the same pre-existing ones as for the other courses.
- Course-specific Playwright checks (`extra_checks.py` 6/6, `draft_check.py` 2/2): 先猜 choice buttons in stations 03
  and 09 record a choice, show feedback and persist across reload; a self-check answer marked with 部分对 is restored
  after reload and appears in the export; an unmarked draft is restored after reload and appears in the export as 草稿.
- Home card, mobile 390 and glossary screenshots inspected. `git diff --stat` for every other course directory is empty.

## Not covered

Real iPhone/Safari, screen readers, Firefox/Edge/WebKit. The medical-content note from the v1 record still applies.
Production deployment and live verification are reported separately.

---

# huberman-health-qa update to v2 — 2026-09-17

Course: 你最关心的健康问题 · 交互导读 (card title kept; the page's own title is now 你最关心的健康问题｜Huberman 问答导读).
Route unchanged: https://learning.jiadi.ai/courses/huberman-health-qa/

## Input

A full rebuild by `interactive-learning-lab` 2.2.0 (page COURSE_META.version 2.2.0) from the same Chinese transcript,
delivered on 2026-09-17 with `huberman-health-qa_study_notes.md`, `course-spec.md`, `source-ledger.csv` and
`qa-report.md`. Compared with v1 (published 2026-09-17 earlier the same day): 18 stations instead of 12 (16 = 速查与自测,
17 = 原文全文 with 99 inline backlinks), 25 glossary terms instead of 36, 3 self-checks instead of 4, and a 35-claim
ledger (verified 11, disputed 9, unverified 15) instead of 37 claims. No numeric model in either version.

## Adaptations made for the site

One, mechanical, agreed by the user before integration:

1. **Handbook link target.** Station 00 linked to `huberman-health-qa_study_notes.md`, a sibling file that the
   builder does not publish (it would 404 on the site). The single `href` was changed to `study-notes.md`, which is
   where the builder places the notes, with `download="huberman-health-qa-study-notes.md"` so the saved name matches
   the homepage download. No other byte of the page changed (432,362 → 432,388 bytes). In the offline HTML download
   this link has no sibling file to point at; the page's own 导出笔记 button still works offline.

Files were already UTF-8 without BOM, LF. Storage key `interactive-learning-lab:huberman-health-qa:v1` is already a
literal and unchanged, so existing learner records still load; as with Pozsar, the changed station list means an old
"visited" record now points at a different station. `courses.json` entry rewritten for v2 (subtitle, description,
tags, 18/25, "35 条主张核查", "v2 · 带核查的导读", firstTask, imageAlt); title, category 健康与科学, tone gold and
storage key unchanged. The preview is an actual screenshot of station 16 (速查 table) from the local build.

## Checks run (local, http://127.0.0.1:4173, real HTTP, site CSP, native localStorage)

- `npm test`: 106 static integrity checks pass, including all 12 for this course.
- `site_checks.py snapshot` on the delivered file: 18 lessons, 25 terms, 0 range inputs, no 390 px overflow, no
  console errors. Baseline for the comparison below.
- `site_checks.py check` against the built site: **138 pass, 0 fail, 9 warn, 7 manual**. Home card under
  健康与科学; downloads byte-identical to repository sources; all 18 station texts and the 25-term count match the
  baseline (the href change is outside the compared text); navigation, glossary (search "自主"), self-check
  feedback, export, persistence and reload work under CSP; other courses' storage sentinels untouched; offline HTML
  opens from disk; no 390 px overflow on any station; no console errors or CSP violations. Warnings/manual items
  are the same pre-existing ones as for Pozsar; "no visible range inputs" is accurate (no sliders).
- Course-specific Playwright checks (`extra_checks.py`, 7/7 pass): 对照原文 jump to station 17 with highlight,
  返回 restores station 01, inline backlink returns to the cited step, and the station 00 handbook link downloads
  `huberman-health-qa-study-notes.md` byte-identical to `content/courses/huberman-health-qa/study-notes.md`.
- Home card, mobile 390 and glossary screenshots inspected. `git diff --stat` for every other course directory is empty.

## Not covered

Real iPhone/Safari, screen readers, Firefox/Edge/WebKit. The medical-content note from the v1 record still applies.
Production deployment and live verification are reported separately.

---

# huberman-health-qa — integration record

Course: 你最关心的健康问题 · 交互导读
Added: 2026-09-17
Route: https://learning.jiadi.ai/courses/huberman-health-qa/

## Source

Authored with the `interactive-learning-lab` skill from a Chinese transcript of a
Huberman Lab listener Q&A episode (189 lines, nine caller questions). The page is a
guided re-reading of that transcript: 12 stations ordered by dependency rather than by
the order the questions were aired, 101 quoted source anchors, 36 glossary entries and
a four-question self-check on the last station.

The author's load-bearing claims were checked against primary literature before
publishing. 37 claims are recorded in the companion ledger with status
`verified` (9), `disputed` (21) and `unverified` (7). Where a claim did not survive the
check, a correction block sits next to that step in the page — it is not folded away.
Two of those are directional: the exercise/learning window on station 04 has its
causal order reversed relative to the cited study, and station 07 presents a regulatory
wording as a professional-society consensus.

Files supplied: `index.html`, `huberman-health-qa_study_notes.md`, plus
`source-ledger.csv`, `course-spec.md` and `qa-report.md` (kept with the author's working
copy; the site only carries the page and the study notes).

## Adaptations made for the site

Two, both mechanical. No wording, calculation, default value, glossary entry, source or
export was changed.

1. **Storage key written as a literal.** The page had
   `const KEY='interactive-learning-lab:'+COURSE_META.id+':v1'`. `check.mjs` asserts the
   declared `storage` string appears verbatim in the source, so the expression was
   replaced with the equal literal `'interactive-learning-lab:huberman-health-qa:v1'`.
   The runtime key is unchanged, so no learner state is affected. A comment in the source
   explains why the literal form is required.
2. **Line endings.** The authored files were CRLF; copied into the repository as UTF-8
   without BOM and LF, so the locally built `public/` hashes match CI.

`COURSE_META.id` was already the site slug, so 5.6 did not apply. The page has no
relative-path assets, no inline event attributes, and no external requests.

## Author-side fixes applied before publishing

Two rounds of reader-reported issues were fixed in the authored source and rebuilt, so
the repository copy is the corrected page. Neither was an integration change.

1. **Sidebar could not scroll on its own.** The station nav is `position: sticky`, which
   does not create a scroll container. With twelve stations the list is 675 px tall and
   overflowed viewports of 768 px and below by 17–65 px, so the last stations were only
   reachable by scrolling the whole page. Fixed with `max-height: calc(100dvh - 150px)`,
   `overflow-y: auto` and `overscroll-behavior: contain` on the nav, reset on phones where
   the same element is a horizontal strip. Verified at 1440×900 (no scrollbar needed),
   1440×768, 1280×720 and 1152×648: the nav now scrolls to station 11 with `window.scrollY`
   still 0.

2. **Authoring vocabulary and self-justification leaking into reader text.** The reader
   reported a sentence that read as an instruction to the author rather than content.
   A sweep of the page found two classes and both were fixed:
   - Four self-justifying negations in figure captions ("not a framework this page added",
     "not an inference this page supplied", and so on). These answer a reviewer's question
     about whether the author smuggled anything in, not a reader's question. Removed; the
     provenance half of each caption ("all of this comes from step 4–9 of the source") was
     kept because that does serve the reader.
   - Seventeen instances of the authoring skill's internal vocabulary shown to readers:
     每站眉标 read `01 / 推理单元一 · 原文「问题二」` where 推理单元 is the skill's internal
     name for a station; station 00 described the page layout using the component names
     位置卡, 辅助元素 and 分站; and 承重主张 (a spec term) appeared four times. Rewritten in
     plain reader-facing language — the eyebrows are now simply `01 / 原文「问题二」`.

   Two captions that disclose editorial additions were kept and reworded rather than
   removed, because flagging what is *not* from the source is information the reader needs:
   the "can you borrow it" column on station 05's人-vs-dog table, and station 08's warning
   that the three chronotypes are a continuum in the underlying data.

   The reader also mentioned a sentence about a 原文全文 station reading oddly. That phrase
   appears nowhere in this course or in any other course in the repository; this course has
   no such station. It was raised with the reader rather than guessed at.

   The baseline snapshot was retaken from the corrected source before re-running the
   comparison checks, so "integration did not alter the content" is still a meaningful
   assertion.

## Known difference, left as authored

The browser tab title is `你最关心的健康问题｜导读`; the homepage card shows the course
name `你最关心的健康问题 · 交互导读`. Raised with the user before integration and left as
authored — changing it would mean editing page content, which is outside integration.

## Content note

The page carries medical content: supplement doses, hormone-therapy discussion and
training prescriptions. Station 00 opens with a prominent "教学材料，非医疗建议"
notice, the same disclosure is repeated in the study notes, and every dose carries its
check status inline. The repository is public; the user was told this before publishing.

## Checks run

Local, against `http://127.0.0.1:4173` over real HTTP with the site's own security
headers and native localStorage:

- `npm test` — 106 static integrity checks pass, including all 12 for this course
  (byte-identical scripts, unchanged download and notes, DOM ids retained, 12 chapters,
  storage namespace present in both original and published copies and colliding with no
  other course).
- `site_checks.py snapshot` on the authored file — 12 lessons, 36 terms, 0 range inputs
  (this course has no numeric model), runtime storage key as declared, no 390 px
  horizontal overflow on any station, no console errors. Used as the baseline.
- `site_checks.py check` against the built site — **125 pass, 0 fail, 9 warn, 8 manual**.
  Confirmed: the homepage card renders under the existing 健康与科学 filter; both downloads
  are byte-identical to the repository sources (271,878 B and 51,274 B); all 12 station
  texts and the 36-term count match the pre-integration baseline; glossary, self-check
  feedback, export, persistence and reload all work under the site's CSP with native
  localStorage; the eleven existing courses' storage sentinels were untouched; the
  offline HTML opens from disk with no errors; no 390 px horizontal overflow on any of
  the twelve stations; no console errors or CSP violations on any page.

  Every warning and all but one manual item belong to other courses and predate this
  change: gold-volatility needs two Escape presses to close its glossary (documented
  pre-existing behaviour), and the eight newer courses expose no slider on their opening
  lesson and no navigation selector the checker recognises. The remaining manual item —
  "no visible range inputs found" for this course — is accurate rather than a gap: this
  course has no numeric model, so it has no sliders. Its own interactive surfaces
  (navigation, glossary, self-check, export, persistence, resume card, theme, coach
  toggle, reset) are covered here and by the author's 59-assertion suite.

## Note on a false alarm during integration

An earlier run of the same checks reported 8 failures — the seven newest courses' inline
scripts blocked by CSP, and their glossaries not opening. This was an artefact of the
integration environment, not of any course: a `serve.mjs` process started before the
repository was updated still held port 4173, so it was serving a `_headers` file from an
earlier build whose CSP listed only 12 of the 19 script hashes. Building a pristine
worktree from `origin/main` and comparing confirmed the diagnosis, and the header sent
after a clean restart carries all 19 hashes. Re-running the checks against a freshly
started server produced the 125/0 result above. `serve.mjs` reads `_headers` only at
startup; it must be restarted after every build.

## Not covered

- Real iPhone/Safari, screen readers, Firefox/Edge/WebKit.
- Three ledger claims (`C35`, `C36`, `C37`) were outside the author's fact-check scope
  and are marked `unverified` rather than assumed correct.
- The hormone-therapy entry (`C28`) reflects society positions as of 2026-09-16; that
  area was moving during 2025–2026 and should be re-checked from primary sources rather
  than trusted indefinitely.
