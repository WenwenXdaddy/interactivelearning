# Muscle health course integration — 2026-09-16

Course: 通过运动和饮食提升健康寿命 (`muscle-health-lyon`). User requested publication of the completed source-enhanced course.

## Source and boundaries

Input: E:/learning-pages/muscle-health-lyon/index.html and its study notes, source ledger and QA report. 17 stations, 23 terms, 42 complete source excerpts, five scenario questions, text-only original transcript appendix. No numerical model. Original standalone QA: 130 behavior assertions and 682 source-reader assertions passed.

An independent clone was used because E:/interactivelearning contains unrelated uncommitted huberman-health-qa work. Those files were not touched or included. Existing repository, main branch, Worker interactivelearning and learning.jiadi.ai are retained.

## Integration adaptations

- Normalize UTF-8 without BOM and LF before building.
- Embed three original sidecar attachments as downloadable data URIs; attachment bytes are preserved. Adjust the no-JavaScript handbook sentence accordingly.
- Remove the unused original-lesson class from station 16 so the existing builder counts all 17 stations. No CSS or script refers to that class.
- Preserve all original JavaScript, glossary terms, quiz content, full transcript, excerpt mapping and storage key learning-lab:muscle-health-lyon:v1.
- Add a green card under 健康与科学. The preview is an actual screenshot of station 1, not an illustration.

## Local verification

- npm test: 50 static integrity checks passed.
- Generic HTTP/CSP browser checks: 103 pass, zero fail, three warnings, four manual items.
- Dedicated HTTP browser checks: 156 assertions passed, covering glossary count, actual Markdown export, first/latest answers, native reload persistence, full-source jump/return and resume, all station widths and expanded excerpts at 390/360px, all three embedded downloads byte-for-byte, scoped reset and Pozsar navigation.
- Generic manual term count/export/Pozsar navigation items are resolved by dedicated checks. Slider checks are not applicable to this course or Pozsar. Escape can first clear a search field before closing the glossary; this is recorded, not changed.
- Generic regression checks passed for all existing courses; their source directories have no diff.
- Source snapshot confirms all 17 station texts are unchanged after integration. Local security-policy console errors: zero.
- Preview, homepage card, mobile course and glossary screenshots inspected. No clipping observed.

Evidence: original.json, local-checks.json, local-extra.json and screenshots in %TEMP%/plc/muscle-health-lyon/. Published source and generated downloads retain identical scripts and expected bytes. git diff --check passed.

Deployment and production verification are separate subsequent checks. True-device Safari and screen readers were not tested. Medical statements were not newly reviewed during publication; the original evidence limitations remain in the course.
