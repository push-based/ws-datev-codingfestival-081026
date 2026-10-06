# Workshop plan (trainer notes — delete before the workshop)

Base app: `push-based/ws-ng-modern-enterjs-2026` @ `d2eca9f` (Angular 22.0.1, `@angular/build:application`
(esbuild), zone.js still in polyfills). Builds clean (observed: `ng build` @ 2026-10-06).

Format: one day, 4 blocks × 90 min. Minutes below are estimates (assumed), not measured.

Status legend: ✅ ready (copied, applies to this app) · 🔧 copied, needs a pass · 🚧 copied but must be
rewritten · 🆕 does not exist yet.

## Block 1 — Introduction, Current State & Tooling (90 min)

| Min | Item | Source | Status | Notes |
|---|---|---|---|---|
| 10 | Introduction | slides | — | |
| 5 | project setup | ng-modern | ✅ | Ideally done before the workshop. |
| 20 | Angular CLI & esbuild: bundle-analysis-coverage_bundle-analyzer | perf | 🔧 | `ng build --stats-json` → esbuild analyzer, coverage tab. Check against Angular 22 output. |
| 20 | nx-01-initialize-nx | nx | 🚧 | Uses the `nrwl/tuskydesign` sample repo. Rewrite as `npx nx@latest init` on *this* Angular CLI app (keeps `angular.json`, adds caching), then `nx graph`. |
| 10 | nx-02-task-pipelines | nx | 🚧 | Rewrite targets for the Angular project (`build`, `serve`, `lint`, `test`). Could merge into 01. |
| 10 | nx-03-affected-and-caching | nx | 🚧 | Mostly generic; swap the React project names. |
| 15 | Nx best practices | demo | — | Library architecture + module boundaries, shown on an existing Nx workspace. No hands-on. |

## Block 2 — Signals, Signals & Observables, Signal Change Detection (90 min)

| Min | Item | Source | Status | Notes |
|---|---|---|---|---|
| 15 | signal-introduction | ng-modern | ✅ | |
| 10 | signal-computed | ng-modern | ✅ | |
| 10 | signal-effect | ng-modern | ✅ | First to cut if the block runs long. |
| 10 | signal-toSignal | ng-modern | ✅ | Signals & Observables. |
| 15 | signal-resource-injectParams | ng-modern | ✅ | Signals & Observables. Rewrites `movie-list-page`. |
| 15 | change-detection - signals | ng-modern | ✅ | |
| 15 | change-detection - zoneless | ng-modern | ✅ | |
| — | signal-migration, change-detection - Dirty Check, change-detection - OnPush | ng-modern | ✅ | Bonus. |

90 min of exercise time with no slot for slides — this block is the tightest.

## Block 3 — Signal Forms (90 min)

| Min | Agenda item | Covered by | Status |
|---|---|---|---|
| 15 | Intro | slides | — |
| 50 | Complex forms with the signal forms API | signal-forms steps 1, 5, 6 | ✅ |
| (incl.) | Custom validators | signal-forms step 1 (`validate`, unique-movie rule) | ✅ |
| (incl.) | Custom form fields | signal-forms step 2 (`FormValueControl`) | ✅ |
| 25 | Dynamic form fields | step 3 covers an array via `applyEach`; conditional fields (`hidden`, `disabled`, `applyWhen`) are not covered | 🆕 extension step |

## Block 4 — AI-Assisted Performance Engineering + Q&A (90 min)

| Min | Item | Source | Status | Notes |
|---|---|---|---|---|
| 25 | Flame charts, network, image optimization | perf | 🔧 / 🚧 | Not run hands-on one by one; the exercises are the known problems in this app. Shape is up to the DevTools MCP session. |
| | ↳ performance-tab-flame-charts | perf | 🔧 | |
| | ↳ network-resource-hints-preconnect | perf | 🔧 | App starts without preconnect — applies. |
| | ↳ network-resource-hints-preload-prefetch | perf | 🔧 | |
| | ↳ network-lazy-loading | perf | 🔧 | `movie-card` has no `loading`/priority yet — applies. |
| | ↳ network-prefetch-lcp-data | perf | 🔧 | Touches `app-shell`, which block 2 changes too — verify on the post-block-2 state. |
| | ↳ ng-optimized-images | perf (initial commit `0e75419`, later removed) | 🚧 | Step 1 (`ngSrc`, `priority`) is done; step 2 (srcset / `IMAGE_LOADER`) is marked DRAFT. |
| 30 | Chrome DevTools MCP | — | 🆕 | Separate session. |
| 25 | Performance engineering skills | — | 🆕 | Separate session. |
| 10 | Q&A | — | — | |

## Decisions (2026-10-06)

1. One day, 4 blocks × 90 min (structure above).
2. Nx best practices: demo on an existing workspace; no `libs/` restructuring here.
3. Checkpoint branches per block — later; for now only `main` (start state).
4. Block 4 performance exercises are not run hands-on one by one; network-cancel-requests dropped.

## Open questions

1. Publish `push-based/ws-datev-codingfestival-081026` on GitHub — public or private?

## Dropped from the sources

ng-modern: inject migration, new control flow, defer, SSR (3), manual CD. perf: CSS, scheduling, event loop,
SSR, user flows, ngZone/zone optimizations, network-cancel-requests. nx: library architecture + module
boundaries (demo instead), custom plugins/executors/generators, Nx Cloud, atomizer.
