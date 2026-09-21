# Course theme-default validation

Scope: the 14 retained standalone course sources that predated `outlive-guided-full`.

The theme initialization was changed only where a course previously defaulted to dark. Existing storage keys, learning-state fields, light/dark controls, and explicit saved `light` or `dark` preferences remain in place. For state objects created before a `theme` field existed, a missing or invalid theme now resolves to `light`.

## Theme controls

| Course | Theme mechanism | Result |
| --- | --- | --- |
| cognitive-flexibility-langer | `state.theme` in `learning:cognitive-flexibility-langer:v1` | Fresh and theme-less saved state default to `light`; explicit `dark` remains dark. |
| diet-health-gardner | `state.theme` in `interactive-learning-lab:diet-health-gardner:v3` | Fresh and theme-less saved state default to `light`; explicit `dark` remains dark. |
| gold-volatility | `au-lab-theme` preference | Missing preference defaults to `light`; saved `light`/`dark` and the toggle are unchanged. |
| healthy-masculinity | `state.theme` in `learning:healthy-masculinity:v1` | Fresh and theme-less saved state default to `light`; explicit `dark` remains dark. |
| huberman-health-qa | `state.theme` in `interactive-learning-lab:huberman-health-qa:v1` | Already used the requested light default and dark-only override; unchanged. |
| language-learning-science | `state.theme` in `learning:language-learning-science:v1` | Fresh and theme-less saved state default to `light`; explicit `dark` remains dark. |
| muscle-health-lyon | `state.theme` in `learning-lab:muscle-health-lyon:v1` | Fresh and theme-less saved state default to `light`; explicit `dark` remains dark. |
| overcome-inner-resistance | `state.theme` in `learning:overcome-inner-resistance:v1` | Fresh and theme-less saved state default to `light`; explicit `dark` remains dark. |
| pozsar-money-view | `state.theme` in `pozsar-money-view:v1` | Fresh and theme-less saved state default to `light`; explicit `dark` remains dark. |
| reclaim-your-brain | `state.theme` in `learning:reclaim-your-brain:v1` | Fresh and theme-less saved state default to `light`; explicit `dark` remains dark. |
| unknown-unknowable | `state.theme` in `interactive-learning-lab:uu-investing:v1` | Fresh and theme-less saved state default to `light`; explicit `dark` remains dark. |
| why-learning-tools-fail | `state.theme` in `learning:why-learning-tools-fail:v1` | Fresh and theme-less saved state default to `light`; explicit `dark` remains dark. |
| unconditional-parenting | Fixed `color-scheme: light` presentation, no theme control | Already light; unchanged. |
| us-data-center-buildout | Fixed `color-scheme: light` presentation, no theme control | Already light; unchanged. |

## Static verification

Run:

```text
node scripts/test-theme-defaults.mjs
```

The test reads the standalone `content/courses/*/index.html` sources and checks all 14 courses. It verifies light defaults, the legacy theme-less fallback, both-way switching, existing preference keys, and preference persistence. Browser behavior is intentionally left to the parent task's 15-course CUA acceptance pass.

## Coordinator acceptance — 2026-09-21

- `npm test`: 131 integrity checks plus home, 15-course resume, executable source-theme and platform tests passed.
- Browser on local HTTP: all 15 courses default light; all 13 switchable courses retained an explicit dark choice after reload and could return to light. Two courses are intrinsically light.
- Integrated Outlive's 32 lesson text blocks match the original source DOM exactly; 153 steps and 35 glossary entries retained.
- Chromium at 390x844: visited all 32 stations; no horizontal document overflow.
- Independent GPT-5.6 Sol high review found no remaining release blockers after metadata, invalid-theme fallback and resume-capacity corrections.
- Production verification follows deployment; the earlier lane-specific boundaries above describe the worker's scope only.
