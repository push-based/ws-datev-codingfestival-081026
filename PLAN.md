# Workshop plan (trainer notes — delete before the workshop)

Base app: `push-based/ws-ng-modern-enterjs-2026` @ `d2eca9f` (Angular 22.0.1, `@angular/build:application`
(esbuild), zone.js still in polyfills). Builds clean (observed: `ng build` @ 2026-10-06).

Status legend: ✅ ready (copied, applies to this app) · 🔧 copied, needs a pass · 🚧 copied but must be
rewritten · 🆕 does not exist yet.

## 1. Introduction

Slides only.

## 2. Current State & Tooling

| Exercise | Source | Status | Notes |
|---|---|---|---|
| project setup | ng-modern | ✅ | |
| bundle-analysis-coverage_bundle-analyzer | perf | 🔧 | Covers the esbuild part (`ng build --stats-json` → esbuild analyzer, coverage tab). Check it against Angular 22 output. |
| nx-01-initialize-nx | nx | 🚧 | Uses the `nrwl/tuskydesign` sample repo. Rewrite as `npx nx@latest init` on *this* Angular CLI app (keeps `angular.json`, adds caching), then `nx graph`. |
| nx-02-task-pipelines | nx | 🚧 | Rewrite targets for the Angular project (`build`, `serve`, `lint`, `test`). |
| nx-03-affected-and-caching | nx | 🚧 | Mostly generic; swap the React project names. |

Nx best practices (library architecture, module boundaries): trainer demo on an existing Nx workspace, no
hands-on exercise. This app stays in the Angular CLI layout.

## 3. Modern Architectures & State Management

| Exercise | Source | Status | Notes |
|---|---|---|---|
| signal-introduction | ng-modern | ✅ | |
| signal-computed | ng-modern | ✅ | |
| signal-effect | ng-modern | ✅ | |
| signal-toSignal | ng-modern | ✅ | "Signals & Observables" |
| signal-resource-injectParams | ng-modern | ✅ | "Signals & Observables". Rewrites `movie-list-page` — see network-cancel-requests. |
| signal-migration | ng-modern | ✅ | Bonus. |

## 4. Performance

| Exercise | Source | Status | Notes |
|---|---|---|---|
| change-detection - Dirty Check | ng-modern | ✅ | Bonus. |
| change-detection - OnPush | ng-modern | ✅ | Bonus. |
| change-detection - signals | ng-modern | ✅ | Core. |
| change-detection - zoneless | ng-modern | ✅ | Core. |

## 5. Forms: Signal Forms

| Agenda item | Covered by | Status |
|---|---|---|
| Complex forms with the signal forms API | signal-forms steps 1, 5, 6 | ✅ |
| Custom validators | signal-forms step 1 (`validate`, unique-movie rule) | ✅ |
| Custom form fields | signal-forms step 2 (`FormValueControl`) | ✅ |
| Dynamic form fields | step 3 covers an array via `applyEach`; conditional fields (`hidden`, `disabled`, `applyWhen`) are not covered | 🆕 extension step |

## 6. AI-Assisted Performance Engineering

| Exercise | Source | Status | Notes |
|---|---|---|---|
| performance-tab-flame-charts | perf | 🔧 | Manual baseline; redo the same analysis with the DevTools MCP afterwards. |
| network-resource-hints-preconnect | perf | 🔧 | App starts without preconnect — applies. |
| network-resource-hints-preload-prefetch | perf | 🔧 | |
| network-lazy-loading | perf | 🔧 | `movie-card` has no `loading`/priority yet — applies. |
| network-prefetch-lcp-data | perf | 🔧 | Touches `app-shell`, which the signal exercises change too — verify on the post-signals state. |
| ng-optimized-images | perf (initial commit `0e75419`, later removed) | 🚧 | Step 1 (`ngSrc`, `priority`) is done; step 2 (srcset / `IMAGE_LOADER`) is marked DRAFT. |
| Chrome DevTools MCP | — | 🆕 | Separate session. |
| Performance engineering skills | — | 🆕 | Separate session. |

## 7. Q&A

## Decisions (2026-10-06)

1. One day.
2. Nx best practices: demo on an existing workspace; no `libs/` restructuring here.
3. Checkpoint branches per section — later; for now only `main` (start state).
4. Most section 6 performance exercises are not run hands-on; network-cancel-requests dropped.

## Open questions

1. Publish `push-based/ws-datev-codingfestival-081026` on GitHub — public or private?

## Dropped from the sources

ng-modern: inject migration, new control flow, defer, SSR (3), manual CD. perf: CSS, scheduling, event loop,
SSR, user flows, ngZone/zone optimizations. nx: library architecture + module boundaries (demo instead), custom plugins/executors/generators, Nx Cloud,
atomizer. perf: network-cancel-requests.
