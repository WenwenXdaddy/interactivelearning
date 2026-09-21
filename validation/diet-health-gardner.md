# Gardner course integration - 2026-09-21

Course: 不同饮食对健康的影响：Gardner 对话导读 (`diet-health-gardner`). New listing, card v1, category 健康与科学.
Input: E:/learning-pages/diet-health-gardner-v3/index.html and diet-health-gardner_study_notes.md. Original HTML SHA-256: 590a705f05d8e6252eb026498a0813b4e0343f95692950f4f067f6b28c124f0a.

## Integration

Only source adaptation: move class="lesson" to the first attribute of 15 section tags so the existing textual chapter checker recognizes them. No text, DOM IDs, styles, scripts, calculations or storage changes. Both script blocks verified byte-identical to the delivered page; notes copied byte-for-byte. Keep isolated storage key interactive-learning-lab:diet-health-gardner:v3. Homepage title matches the page. Browser snapshot confirms 15 stations, 44 terms and one range model; default weight 70 kg. New preview is an actual local HTTP screenshot of station 06's model. Existing course sources and their generated course files have no diff.

## Verification

- npm test: 114 static integrity checks passed after final preview build.
- Publisher browser suite over real HTTP and generated CSP: 146 pass, zero fail, 11 warn, zero manual. Warnings: gold glossary requires two Escape presses; ten older courses have no visible slider on the default station. These are coverage/known-behavior notes, not failures introduced by this course.
- Course-specific HTTP suite: 107/107 assertions passed. Covers all 15 stations at 1280/390/360 widths, original-source roundtrip, review layer, dictionary search/step jump/Escape focus, first/latest/draft persistence, export, isolated reset and corrupt state. No page errors.
- Publisher checks compare all station text/default model output to the original snapshot, test downloads and offline opening, persistent storage and other-course sentinels, glossary/slider interactions, all existing course navigation regression, 390px layouts, security policy and 404. Zero local console/CSP errors.
- Inspected homepage card, desktop course, mobile course, glossary and final preview screenshots.
- Evidence: %TEMP%/plc/diet-health-gardner/original.json, local-checks.json, qa/behavior-report.json and shots/.
- Not run: real Safari/iOS/Android devices, screen readers. Original content limitations remain: eight source illustrations represented by captions; uncertain transcript speaker attribution explicitly labeled. Integration does not revalidate clinical claims.

## Release boundary

User explicitly requested publication to the existing site. Push, exact-commit Workers Builds/validate checks and production readback are separate evidence; at this commit production verification is pending. No DNS, Worker settings or CSP changes. The skill reference's claim that AGENTS.md still names an old Worker is stale: current AGENTS.md and wrangler.jsonc both correctly name interactivelearning.
