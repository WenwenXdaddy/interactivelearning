# Data-center course integration — 2026-09-15

Course: `us-data-center-buildout`, 美国数据中心建设：地理、容量与政策.
Input: completed research Wiki v2.18, report dated 2026-09-14. Five chapters, 27 reading sections, 20 glossary terms, six state profiles, 50 source sections. Capacity snapshot: 2026-09-04.

## Minimal integration

- Retain the six original JavaScript files and two stylesheets byte-for-byte inside a standalone HTML. Execute the scripts in their original order at the end of the body, equivalent to the original deferred scripts after DOM parsing. `import-manifest.json` records their SHA-256 hashes; `npm test` verifies them.
- Embed the original report as downloadable Markdown and the favicon as a data URL. No external runtime resources, backend, new storage, or weaker CSP. The handbook includes the Chinese reading text, practice explanations, glossary, and original report.
- Add an explicit portal insertion marker. The builder injects the home and download links without rewriting course scripts. Existing course outputs remain byte-identical.
- Extend the chapter-count check for the field guide's data-driven chapter structure; also verify the actual glossary count, section citations, imported script/style/report hashes, and storage isolation. Retain all existing course checks.
- The course has no memo editor or persisted answers/slider values. Refresh resets these values, as in the original; the URL retains the selected chapter. Do not imply a new persistence feature. Old course storage namespaces remain unchanged.
- Preview is an actual 1120 × 960 screenshot of the course capacity map, not an illustration.

## Executed before publication

`npm test`: 34 static integrity checks passed.

Isolated Chrome over real local HTTP (`scripts/serve.mjs`) with the generated CSP and native localStorage; no storage shim. Seventeen browser groups passed:

1. Homepage has three cards and opens the new course.
2. New course data, chapter counts, answer keys and defaults match a browser snapshot of the original multi-file page.
3. Keyboard slider: 100 MW × 10 hours = 1000 MWh; navigation within a chapter retains the value.
4. All five chapters and every practice's correct answer/explanation.
5. Term dialog opens/closes; search locates the matching paragraph.
6. Map has 51 shapes; all three stages switch; Virginia can be selected by keyboard.
7. All six state profiles; original tables; §4.8 round log; §1.1 consistency warning; §4.9 local layer.
8. Browser downloads: original report bytes match input; handbook; standalone HTML opens from disk and runs.
9. New course refresh retains the URL and original reset behavior without writing localStorage.
10. Return-to-home link.
11. Gold: all ten chapters, payoff chart changes with the allocation slider.
12. Gold: glossary, quiz saved across native reload, exported learning notes.
13. Unknown: all nine chapters, selection chart changes with the bid slider.
14. Unknown: glossary, quiz, synthetic memo, bid value and memo restored after reload, memo present in Markdown export.
15. Switching across the three courses leaves other courses' storage unchanged.
16. 390px and 320px layouts: homepage, all course entry pages, new course map and long report section; no document-wide horizontal overflow.
17. HTTP CSP, no script/CSP errors, missing path returns 404.

Not executed: Safari or real iOS/Android hardware; exhaustive numerical scenarios for the existing financial courses. Old course scripts and source remain unchanged. Gold slider values are not claimed to persist when the original course does not save them.

## Publication boundary

This file records pre-publication evidence. GitHub validation, Cloudflare deployment for the exact commit, and production checks must be reported separately after pushing. Use the existing `interactivelearning` Worker and Git Builds connection; no DNS or protection changes.
