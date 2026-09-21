# Unconditional Parenting integration — 2026-09-21

Course: `unconditional-parenting`, 无条件养育 · 一起读. First release, existing 学习与成长 category.

## Source and integration

- Input: `E:/learning-pages/unconditional-parenting/index.html` and `无条件养育_学习手册.md`.
- Retained HTML SHA256: `d3eb5eca0b55ac260230ac86cd3ae928e7e5ed2da2f8e830d07acec097063e6e`.
- Original HTML and handbook copied byte-for-byte; no content, script, storage, or calculation adaptation.
- Browser snapshot counted 37 lesson sections, 17 TERMS entries and 116 step elements. No range/model controls; slider checks are not applicable.
- Storage remains `interactive-learning-lab:unconditional-parenting:v1`; original native persistence retained.
- Existing builder adds portal navigation and metadata; source download remains byte-identical. UTF-8 without BOM, LF.
- Actual 1120x960 preview screenshot shows station 01 step 1, 日常压力怎样缩小了目标, source paragraphs and navigation. No generated illustration.
- Only new course/preview/catalog/validation and generated public files changed. Existing course sources and outputs unchanged.

## Executed local verification

- `npm test`: 122 integrity checks passed.
- Skill preflight: zero blockers/warnings. Original browser snapshot: no errors or 390px overflow across all 37 stations.
- Real HTTP with generated CSP and native localStorage: site_checks 155 pass, 0 fail, 12 warn, 3 manual.
- Manual-selector gaps: navigation and free-text quiz supplemented with 46 passing course-specific assertions; sliders not applicable because this course has none.
- Supplement: all 37 navigation buttons, source jump and exact step return, draft reload, first/latest submission separation, glossary example search and Escape, actual export content, scoped reset preserving old-course sentinels. No storage shim.
- Common suite: home card, category filter, original-vs-published lesson text and defaults, exact downloads, offline open, all prior-course smoke checks, 390px layout, persistence and storage isolation, no local console/page/CSP errors.
- Warnings are existing-course behavior: gold search may require two Escape presses; other courses have no visible slider in the sampled station. No new-course failure.
- Actual preview, homepage card, course mobile screenshot and glossary screenshot visually inspected.
- Evidence outside repository: `%TEMP%/plc/unconditional-parenting/` (original.json, local-checks.json, local-supplement.json, screenshots and actual exports).

## Boundaries

User explicitly requested deployment using publish-learning-course. Release uses existing main -> Workers Builds: interactivelearning pipeline and learning.jiadi.ai; no DNS, Cloudflare protection or CSP relaxation.

Skill reference describes some repository docs/configuration as stale; current AGENTS.md already names interactivelearning correctly. Current repository code/configuration takes precedence.

Not run: real-device iOS/Safari, screen reader, long-term learning evaluation. Content reader gate and source audit remain recorded in the original delivery; no new content revision in this integration.

Commit/push, exact-commit Cloudflare deployment, and live verification are separate evidence boundaries and are reported after publication. This document records local pre-publication results.
