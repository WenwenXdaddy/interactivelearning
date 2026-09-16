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
