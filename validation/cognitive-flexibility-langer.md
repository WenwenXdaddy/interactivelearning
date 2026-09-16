# Cognitive flexibility course integration — 2026-09-16

Course: 认知灵活性 · 在变化中重新看见选择 (`cognitive-flexibility-langer`). The user explicitly requested publication together with two newly commissioned companion courses.

## Source and boundaries

Input: E:/learning-pages/cognitive-flexibility-langer/index.html and study-notes.md, with original QA, source ledger and source snapshot. 18 stations including start, 15 reasoning units, review and full-source appendix; 14 glossary entries; five scenarios. No numerical model. Original QA passed 191 assertions.

An independent clone was used because E:/interactivelearning contains unrelated uncommitted huberman-health-qa work. Those files were not modified. Existing main branch, repository, Worker interactivelearning and learning.jiadi.ai are retained.

## Integration adaptations

- Normalize UTF-8 without BOM and LF.
- Embed the source-ledger.csv download as a data URI; decoded bytes match the original sidecar file.
- Replace the appendix's extra source-full class with its existing #appendix selector, preserving CSS behavior while allowing the current checker to count all 18 sections.
- Preserve all course JavaScript, source text, excerpt ranges, conclusions, glossary, quiz and the storage key learning:cognitive-flexibility-langer:v1.
- Add an actual station-1 screenshot under the existing 健康与科学 category. No new category or infrastructure.

## Verification

- Initial local integration: 58 static checks passed with six courses; the final combined build is recorded in the release report.
- Final eight-course HTTP/CSP browser checks: 101 pass, zero fail, five warnings, seven manual items.
- Course-specific HTTP browser checks: 192 assertions passed, including all original source/excerpt comparisons, native persistence, source jump/return, first/latest quiz records, actual export, scoped reset and mobile layouts.
- Six supplemental assertions passed: source reader present, complete source/excerpt/locator text retained, actual glossary count, appendix counted, embedded ledger bytes, and Pozsar navigation.
- Generic manual items for terms, navigation, export and Pozsar navigation are covered by the dedicated tests. Sliders are not applicable. Existing gold-volatility double-Escape behavior and non-model-course slider warnings remain unchanged.
- Actual preview and mobile screenshot inspected. Full-source, glossary and home-card screenshots are retained outside the repository.
- True-device Safari and screen readers were not tested. Publication does not add a new medical evidence review; the source course's limits remain visible.

Evidence: %TEMP%/plc/mind-courses/cognitive-flexibility-langer/. Deployment and production verification are separate release checks.
