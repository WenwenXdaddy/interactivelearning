# Homepage/PWA acceptance record

Date: 2026-09-21. Worktree: E:/learning-pages/homepage-pwa.
Base: ce54375. Branch: feat/homepage-pwa.
Result: local implementation and Chromium acceptance passed within the coverage below. Production not published; native platform installation remains unverified.

## Review and preservation

- User authorized spec, independent review, GPT-5.6 Sol/high implementation agents and parent acceptance. User separately approved same-origin CSP requests/worker only.
- Independent spec review resolved four blockers before implementation. Later independent source review confirmed three cache/version findings resolved; see HOMEPAGE_PWA_REVIEW.md.
- All 14 source HTML hashes match course-baseline.json. git diff for content/courses and public/downloads is empty.
- Original inline scripts, notes, DOM IDs, download bytes and storage namespaces pass integrity checks. Portal additions are exact allowlisted same-origin external scripts on generated pages.
- No legacy memo reads, localStorage.clear(), account system, external telemetry or cloud sync added.

## Automated checks

- Baseline npm test: 122 static checks.
- Final npm test: 123 static checks plus homepage behavioral tests, all 14 resume source contracts/bridge tests, and worker behavioral tests: passed.
- Worker harness covers aliases, same-origin redirects, off-origin exclusion, online 404, offline shell, save/update/remove, network/quota rollback, version mismatch and pointer validation. These are in-memory tests, separate from browser evidence.
- Bridge harness covers invalid IDs, ordinary/opt-in entry, fast-exit pagehide capture, merging other-course records, untrusted-event exclusion, and fixed-header scroll margin.
- node scripts/verify-portal-http.mjs: 55 successful responses across 14 courses; MIME, CSP, attachments, original download bytes and unknown-route 404 passed.
- git diff --check: no whitespace errors; only Git LF normalization notice for generated favicon.
- Final generated shell version: d6b1c8812014b5a8.

## Actual Chromium browser evidence

Environment: Codex in-app Chromium at http://127.0.0.1:4186/, native localStorage/CacheStorage/Service Worker, secure local HTTP context. No storage shim for these UI checks.

### Homepage

- 14 cards, four categories, data center under industry/infrastructure. Newest sort puts unconditional-parenting first using source commit dates.
- Search 黄金 yields one course; combine with 健康与科学 gives empty state; clear restores all. Favorites-only shows the selected course.
- Favorite survives close/reopen. Second tab receives favorite update without reload.
- Malformed owned portal JSON does not break catalog; recent region hides and all courses remain accessible. Test records restored afterward.
- With page scripts disabled, 14 courses and 14 native details remain, with download links and no-script explanation. Enhanced controls stay hidden. Script execution restored afterward.
- Desktop, 390px and 320px inspected; light/dark modes inspected. At 320px viewport document width was 305px (scrollbar), with no horizontal overflow and search early on the page.
- All 14 integrated courses also had no horizontal overflow at 320px.
- No normal-online authored-page CSP/runtime errors observed in final check.

### Resume

Real navigation controls and deliberate scrolling captured reading positions. Explicit resume restored these targets:

| Course | Restored target | Level |
| --- | --- | --- |
| gold-volatility | lesson1 | station |
| us-data-center-buildout | #learn/2 | station |
| unknown-unknowable | st01-3 | step |
| pozsar-money-view | s1-3 | step |
| muscle-health-lyon | s1-3 | step |
| cognitive-flexibility-langer | s1-3 | step |
| reclaim-your-brain | s1-3 | step |
| why-learning-tools-fail | s1-2 | step |
| overcome-inner-resistance | s01-2 | step |
| diet-health-gardner | s01-3 | step |
| healthy-masculinity | step-01-3 | step |
| huberman-health-qa | step-1-2 | step |
| language-learning-science | step-1-2 | step |
| unconditional-parenting | s01-1 | step |

Unknown/unknowable additionally exercised the actual course -> homepage recent link -> course flow. Fixed-header clearance rechecked across step adapters: targets appear below measured sticky/fixed headers, preserving larger authored margins. Invalid stored step fell back to lesson 0 and removed resume query only. Owned test record restored. No mastery/completion percentage inferred.

### Offline and update lifecycle

- Saved gold through actual UI; final bundle reported 509 KB and had an owned generation/pointer.
- Actual server shutdown proves offline behavior. Tab-only network emulation did not stop all worker fetches, so it was not counted as proof and was reset.
- Server stopped: root and /index.html load 14-card catalog; saved gold loads through slash and index aliases; unsaved parenting course shows helpful offline fallback and saved-course link.
- Failed update while server stopped preserves old readable copy. Final UI: 更新未完成，原有离线副本仍可阅读。无法取得完整课程文件，请检查网络后重试。
- New worker observed installed/waiting while an active page remained open. Closing/reopening naturally activated it; no forced activation/reload. Old course survived shell transition and explicit update then succeeded.
- During a version transition, old worker rejected incompatible newer course bundle, preserving the old saved copy rather than committing mixed assets.
- Removing course cache removes only its owned generation and leaves favorites. Existing unrelated mlt-static-v7 and mlt-api-v7 caches stayed untouched. Final bundle saved again for final server-off replay.
- Network emulation and script-disable overrides restored; viewport override reset during delivery. Local test state is separate from production data.

## Limits and delivery

- Native Safari/iOS/Android install: not_run. Manifest/icon/MIME/Chromium registration checks are not native installation proof.
- Maskable icon generator checks foreground safe circle; logo visually inspected; SVG and raster variants delivered.
- Real storage quota exhaustion/browser eviction: not_run; failure/missing-asset behavior tested in worker harness only.
- Lighthouse/performance score: not_run; available connector targets another browser, not the acceptance tab. No score or formal accessibility audit claimed. Semantic controls, focus styling and responsive visuals inspected.
- No production push/deploy/live proof. Local preview runs at 127.0.0.1:4186. Main push deploys public site and remains a separate user decision.
