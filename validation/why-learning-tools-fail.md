# 大多数学习工具失败的原因 — integration verification, 2026-09-16

User requested the same creation and publication workflow as the preceding three-course release.

## Source and scope

Input: E:/learning-pages/why-learning-tools-fail/index.html and study-notes.md, with course-spec.md, source-ledger.csv, source-snapshot.md and qa-report.md.
Original HTML SHA-256: 4eb853a2021cf157eb36b6c89d1f899da4e6f6d1311eac2a77cc0c75e3c4b05f.

28 stations including start, 25 reasoning units, review and full-source appendix; 22 glossary entries. Full-source and excerpt order were checked against the original source snapshot by the course-specific browser tests. No numerical model. Evidence limits remain in the course and notes.

## Integration

- Source HTML and notes copied byte-identically (already UTF-8 without BOM, LF).
- Course JavaScript, text, exports and storage learning:why-learning-tools-fail:v1 retained unchanged.
- Real course screenshot preview; add card under 学习与成长. This new category is the only homepage classification addition.
- Existing repository, main branch, Worker interactivelearning and domain learning.jiadi.ai retained. All eight existing course sources unchanged.
- Work performed in the clean E:/learning-pages/publish-mind-courses clone; unrelated work in E:/interactivelearning is untouched.

## Checks

- Original offline: 16 static, six generic browser and 253 dedicated assertions passed.
- Final combined npm test: 98 static integrity checks across 11 courses.
- Real HTTP/CSP generic browser: 123 pass, zero fail, 8 warnings, 10 manual items.
- Real HTTP course-specific: 253 assertions passed. Includes all station navigation, full text and excerpt comparisons, jump/return, glossary, first/latest quiz, notes export, native persistence, scoped reset, malformed/blocked storage and 1440/390/360 layouts in both themes.
- Ten supplemental assertions passed: source presence and complete text preservation, actual glossary/appendix counts, and navigation through six other courses using this shell.
- Generic manual terms/navigation/export items are covered by those dedicated checks. Slider items are not applicable to non-model courses; existing gold-volatility double-Escape behavior is unchanged.
- Preview, home card, glossary and mobile screenshots actually inspected.
- True-device Safari, screen readers and original audio/video transcription were not tested; these checks do not establish learning effectiveness.

Evidence retained outside Git at %TEMP%/plc/growth-learning/why-learning-tools-fail/. Deployment and production verification are subsequent, separate release checks. Known Cloudflare injected scripts must be distinguished from course errors without changing CSP.
