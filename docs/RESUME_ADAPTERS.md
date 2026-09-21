# Portal reading-position adapters

The generated course page loads `/assets/portal/resume.js` with `data-course="<slug>"`. The bridge reads and writes only `jiadi-learning-portal:recent:v1`. Its current record is `{version:1,items:[{slug,visitedAt,lessonId,stepId,label,capability,adapterVersion:1}]}`. `lessonId` and `stepId` are nullable strings; `label` is a short rendered lesson heading. The homepage gets the course title from `courses.json`, checks the slug, date and adapter version, and offers an exact resume link only for `station` or `step` capability. It displays at most three recent courses. The bridge retains up to 14 distinct course records so a later visit need not erase another course's position.

An ordinary course link only records a visit; it does not force a portal restore over the course's native behavior. `/courses/<slug>/index.html?resume=1` asks the bridge to validate the saved target against the live DOM, activate an existing lesson control or the data-center guide's hash route, and scroll to a visible step where available. Before scrolling, the bridge measures the currently visible fixed or sticky header and uses at least its bottom edge plus 12 pixels as the target's scroll margin, retaining any larger authored margin. It removes only the `resume` query parameter. An old adapter version, deleted lesson, deleted step, or missing control falls back to the course start and becomes a `visit` record. Reading positions are independent of the course's own progress, quiz, memo, and export state.

| Course | Existing lesson control and DOM | Stable step example | Capture level |
| --- | --- | --- | --- |
| `gold-volatility` | `#nav button[data-go="1"]` → `section#lesson1.active` | none | station |
| `us-data-center-buildout` | `#chapter-select option[value="2"]` → `#learn/2`, rendered `#main[data-reading-chapter="2"]` | none | station |
| `unknown-unknowable` | `[data-lesson-button="1"]` → `.lesson[data-lesson="1"]` | `#st01-2` | step |
| `pozsar-money-view` | `[data-lesson-button="1"]` → `.lesson[data-lesson="1"]` | `#s1-2` | step |
| `muscle-health-lyon` | `[data-lesson-button="1"]` → `.lesson[data-lesson="1"]` | `#s1-2` | step |
| `cognitive-flexibility-langer` | `[data-lesson-button="1"]` → `.lesson[data-lesson="1"]` | `#s1-2` | step |
| `reclaim-your-brain` | `[data-lesson-button="1"]` → `.lesson[data-lesson="1"]` | `#s1-2` | step |
| `why-learning-tools-fail` | `[data-lesson-button="1"]` → `.lesson[data-lesson="1"]` | `#s1-2` | step |
| `overcome-inner-resistance` | `[data-lesson-button="1"]` → `.lesson[data-lesson="1"]` | `#s01-2` | step |
| `diet-health-gardner` | `[data-lesson-button="1"]` → `.lesson[data-lesson="1"]` | `#s01-2` | step |
| `healthy-masculinity` | `[data-lesson-button="1"]` → `.lesson[data-lesson="1"]` | `#step-01-2` | step |
| `huberman-health-qa` | `[data-lesson-button="1"]` → `.lesson[data-lesson="1"]` | `#step-1-2` | step |
| `language-learning-science` | `[data-lesson-button="1"]` → `.lesson[data-lesson="1"]` | `#step-1-2` | step |
| `unconditional-parenting` | `.nav-item[data-go="01"]` → `.lesson[data-lesson="01"]` | `#s01-2` | step |

The step examples are the **second** stable step in station 01, suitable for browser acceptance. All 12 step-capable sources contain visible `.step[id]` elements outside details and dialogs. The bridge records a step only when that element intersects the reading viewport. Clicking a lesson control records at least the station after the course responds; deliberate scrolling records the current visible step after a debounce. If the reader leaves before that debounce fires, `pagehide` flushes only a pending genuine user action and merges against the latest portal key. Source citations, glossary, dialog, quiz, and source-return jumps do not drive capture. Initial page load and programmatic restore cannot immediately replace a saved position with station zero.

`node scripts/test-resume.mjs` checks all 14 source control and ID contracts. It also executes the bridge in a minimal DOM harness to verify plain entry, opt-in step restore, malformed portal data, deleted step fallback, fast-exit capture, cross-tab merge, untrusted navigation exclusion, and that reads stay within the portal key. These are source and in-memory checks. Actual Chromium capture, reload, return from homepage, and restore on every course remain a separate acceptance result; do not label them passed from this test alone. The data-center adapter intentionally records chapters only even though the source has section hash routes, and gold intentionally records lessons only because its steps have no stable IDs.
