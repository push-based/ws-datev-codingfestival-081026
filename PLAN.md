# Workshop plan (trainer notes — delete before the workshop)

**Base app:** `push-based/ws-ng-modern-enterjs-2026` @ `d2eca9f` — movies app on Angular 22.0.1 (bumped to 22.2 with the Nx start state — `@nx/angular` 23.3 does not resolve against 22.0.1), `@angular/build:application`
(esbuild), ngxtension 6, TypeScript 6. Requires node `^22.22.3 || ^24.15.0 || >=26` (from `@angular/core` engines).

**Format:** one day, 4 blocks × 90 min. Each block is a numbered sequence of theory (📖) and exercise (🛠) or
trainer demo (🎬) steps; a theory step may have no exercise after it. Minutes are estimates (assumed), not measured.

**Status:** ✅ ready · 🔧 needs a pass · 🚧 must be rewritten · 🆕 does not exist yet.

---

## The story of the day

**"From *runs on* Angular 22 to *is* Angular 22."**

The movies app was migrated with `ng update`. It compiles on Angular 22 — but it runs in compatibility mode:

- zone.js is switched on explicitly (`provideZoneChangeDetection()` in `main.ts`), although zoneless is the default since v21
- every page component is pinned to `ChangeDetectionStrategy.Eager`, although OnPush is the default since v22
- state lives in plain fields that are set inside `subscribe` callbacks
- inputs / outputs are decorators, forms are reactive forms

Over the day we remove that compatibility layer piece by piece, and every block builds on the previous one:

| Block | Act | Question |
|---|---|---|
| 1 | **Inventory** | What do we actually ship, and how do we keep a growing codebase fast to build? |
| 2 | **Make it reactive** | Move state to signals — then flip the switches: Eager → OnPush, zone.js → zoneless. Each switch breaks something, signals fix it. |
| 3 | **Forms** | Reactive forms are the last part on the old model (and do not notify zoneless CD). Rebuild them on signal forms, stable since v22. |
| 4 | **Make it fast** | The app is modern — is it fast? Measure, then let an agent with Chrome DevTools MCP and skills find and fix the problems. Compare against the baseline from block 1. |

---

## Block 1 — Inventory: the workspace, the tasks, the build (90 min)

> Where do we start? How does Nx keep the workspace fast and in shape — and what does the build ship today?

**Start state of the whole day:** the movies app as an **Nx workspace, already split into tagged libraries**
(see [NX-START-STATE.md](NX-START-STATE.md)). Everybody starts from the same commit; there is no `nx init`
exercise, no library splitting by attendees and no branch switching. All exercises of blocks 1–4 point to the
paths of this structure. Nx comes first, the Angular build afterwards — the build is run through the Nx executor.

Theory follows the slide decks in order: "Monorepos & Nx Core" → "Nx - Scalable Workspace Architectures" →
"Nx Enforce Module Boundaries"; then the Angular build pipeline.

**Technical aspects, in order**
1. What changed in Angular 21 / 22; the app's compatibility layer (the to-do list of the day)
2. Monorepos, Nx at its core (a build system), terminology, workspace styles, `nx init`, project graph, plugins
3. `project.json`, executors, task inference, running targets, task dependencies (`dependsOn`, `^`), continuous tasks, task graph
4. Affected, caching
5. Generators, library conventions and types, organizing code with libraries (scope, type, platform)
6. Module boundaries: tags, `@nx/enforce-module-boundaries`, `depConstraints`
7. Outlook: Nx Cloud, Nx and AI agents
8. Angular build pipeline: `@nx/angular:application` (esbuild), initial vs lazy chunks, budgets; bundle analysis

| # | Min | | Item | Status |
|---|---|---|---|---|
| 1.1 | 10 | 📖 | Introduction & the story | — |
| 1.2 | 5 | 🛠 | Exercise: project setup | 🔧 |
| 1.3 | 10 | 📖 | Monorepos & Nx Core — part 1: monorepos → project graph → plugins | — |
| 1.4 | 8 | 📖 | Monorepos & Nx Core — part 2: project.json → task graph | — |
| 1.5 | 10 | 🛠 | Exercise: task pipelines | ✅ |
| 1.6 | 3 | 📖 | Monorepos & Nx Core — part 3: affected | — |
| 1.7 | 10 | 🛠 | Exercise: affected & caching | ✅ |
| 1.8 | 10 | 📖 | Nx - Scalable Workspace Architectures | — |
| 1.9 | 5 | 📖 | Nx Enforce Module Boundaries | — |
| 1.10 | 8 | 🛠 | Exercise: enforce module boundaries (optional — may be a demo) | ✅ |
| 1.11 | 3 | 📖 | Outlook: Nx Cloud & AI agents (demo) | — |
| 1.12 | 5 | 📖 | The Angular build pipeline | — |
| 1.13 | 10 | 🛠 | Exercise: bundle analysis | 🔧 |

Sum ≈ 97 min (estimates) — ~7 min over. Candidates: 1.10 as a 3-min demo, shorter intro, 1.12/1.13 shorter.

### 1.1 📖 Introduction & the story · 10 min
- Who we are, agenda, how exercises work (README → one file per exercise, solutions in `<details>`).
- Angular 21 / 22 in one slide: zoneless is the default (v21), OnPush is the default (v22),
  `resource` / `rxResource` / `httpResource` and signal forms are stable (v22), Vitest is the default test runner.
- Tour of the movies app: list (`/list/:category`), detail, search, "my movies" (login + form); data from the TMDB API.
- Show the compatibility layer live: `provideZoneChangeDetection()` in `apps/movies/src/main.ts`, `Eager` on
  all page components, decorator inputs, `subscribe`-based state, reactive forms. This is the to-do list of the day.

### 1.2 🛠 Exercise: [project setup](exercises/project%20setup.md) · 5 min · 🔧
- *Tackles:* a working environment for everybody before we touch code.
- *Progression:* check node / npm → open the IDE (+ Nx Console extension) → `npm install` → `npx nx serve movies`
  → app on `localhost:4200`.
- *Result:* the app runs and redirects to `/list/popular`.
- *Rework:* Nx commands instead of `ng serve`; node / CLI versions in the text are from v18 (README too);
  `.vscode/settings.json` does not exist.

### 1.3 📖 Monorepos & Nx Core — part 1 · 10 min
Deck "Monorepos & Nx Core", from the start up to "Demo & Exercise – Initialize Nx".
- Let's talk about monorepos; why monorepo: shared code, atomic commits, single set of dependencies, unified tooling.
- Why not code collocation: no boundaries, unnecessary tasks, inconsistent tooling; when to monorepo; pros & cons.
- Nx Core: Nx is a build system (build speed, CI speed); "Nx helps you": faster command execution, controlled
  code sharing, consistent coding practices, accurate architecture diagram.
- Terminology & workspace structure; getting started (presets, package-based / integrated / standalone, CI).
- Integrate Nx into any project: `npx nx init`.
- Project graph, workspace configuration (`nx.json`, `project.json`), `nx graph`.
- Plugins: migrations, executors, generators; `nx add`.
- "Demo & Exercise – Initialize Nx": **no exercise** — our workspace is already initialized; demo `nx graph` on it.

### 1.4 📖 Monorepos & Nx Core — part 2 · 8 min
Deck "Monorepos & Nx Core", from "project.json / package.json" up to "Demo & Exercise – Task Pipelines".
- `project.json` / `package.json`: meta + targets.
- Executors configured in targets (`@nx/angular:application`, options, configurations); `nx run project:target`.
- Task inference: `nx show project`, inferred targets from plugins in `nx.json`.
- Run targets: `nx test movies`, `nx run-many -t test`.
- Task dependencies: `dependsOn: ["^build"]`, `nx deploy movies` → build first; `targetDefaults` for `deploy`.
- Continuous tasks; task graph (`--graph`).

### 1.5 🛠 Exercise: [task pipelines](exercises/nx-task-pipelines.md) · 10 min · ✅
Source: summer2025 `02-task-pipelines` (run tasks, task graph) rewritten for this workspace (old nx-02, removed — `git show 90dc081:exercises/nx-02-task-pipelines.md`);
bonus from dfl `exercises/task-dependencies.md`.
- *Tackles:* first hands-on contact with Nx — run tasks, look at graphs, get a feel for it. No config changes.
- *Progression:*
  1. Open `apps/movies/project.json` → targets are defined here: `build`, `serve`, `deploy`.
  2. Run tasks: `npx nx build movies` / `npx nx run movies:build` (both syntaxes); then `npx nx test movies` — it
     works, but there is no `test` in `project.json`. Why?
  3. `npx nx show project movies --web` → `lint` and `test` are inferred (`@nx/eslint/plugin`, `@nx/vitest`).
  4. Many projects: `npx nx run-many -t lint test`.
  5. Task graph: `npx nx build movies --graph`, `npx nx run-many -t lint --graph`.
- *Bonus — task dependencies:* the start state ships a `deploy` target (Docker image from `dist`, as in dfl) without
  `dependsOn`. Delete `dist`, run `npx nx run movies:deploy` → fails → add `"dependsOn": ["build"]` → runs build
  first; check `--graph`. Without Docker: swap the command for an `echo` (dfl's fallback). Then try more `dependsOn` rules (e.g. deploy → build, test, lint) and validate them in the task graph.
- *Result:* attendees can run tasks and read the task graph; the bonus shows task dependencies.
- *Done:* verified on the start state; no-Docker fallback is `ls dist/apps/movies/browser` (fails without a build), not `echo`.

### 1.6 📖 Monorepos & Nx Core — part 3 · 3 min
Deck "Monorepos & Nx Core", "affected" up to "Demo & Exercise – Affected & Caching".
- Affected graph: change introduced → which projects are affected; `nx affected -t test`.
- Caching: the deck has no theory slide — explain at the exercise intro (inputs → hash → replay outputs + terminal output),
  or borrow the "Nx Replay" visual from the Nx Cloud deck.

### 1.7 🛠 Exercise: [affected & caching](exercises/nx-affected-and-caching.md) · 10 min · ✅
Source: dfl `exercises/affected-and-caching.md` (movies app + library — closer to us than summer2025 `03`, which uses
the tuskydesign sample; old copy nx-03, removed — `git show 90dc081:exercises/nx-03-affected-and-caching.md`).
- *Tackles:* only run what changed, never run the same task twice.
- *Progression:*
  1. Commit (clean base for `affected`), `npx nx run-many -t lint test build`.
  2. Change something in the app (`apps/movies`) → `npx nx affected -t lint --graph` → only the app.
  3. Change a leaf library (e.g. `libs/shared/models` or `libs/movies/data-access`) → `npx nx affected -t lint --graph`
     → the library and everything that depends on it; `npx nx affected -t lint test` → only those run.
  4. Local cache: `npx nx build movies` twice → the second run is replayed from the cache.
- *Result:* attendees have seen affected and the cache on their own workspace.
- *Done:* leaf library is `movies/util-movie-image` (7 affected). Cache step shows `inputs`: after a lib change
  `test` reruns for all 7 affected projects (`^production`), `lint` only for the changed lib.

### 1.8 📖 Nx - Scalable Workspace Architectures · 10 min
Deck "Nx - Scalable Workspace Architectures", up to "Demo & Exercise Time – scalable workspace architectures", plus the recap.
- Plugins → generators: creating apps and libs (`nx g @nx/angular:library libs/...`), app and library conventions
  (directory, name, tsconfig path, `index.ts`).
- Types of libraries: workspace (default), buildable, publishable — ours are workspace libraries.
- Remove / move projects (`nx g rm`, `nx g mv`); Nx IDE extensions; migrations (`nx migrate`).
- What do you want to achieve with a monorepo?
- Organizing code with libraries: why, examples, classification (platform, type, scope); scope as folder structure;
  types feature / ui / util / data-access; pro tip feature-shell; platform.
- Demo application; "Let's play!" — sorting the movies app into scope / type. Note: attendees already worked in
  the split workspace (1.5, 1.7), so the game confirms / explains the structure rather than predicting it.
- Migration strategy (how this workspace was split); recap: folders = scope, prefixes = type, barrel file = public API.
- "Exercise Time – Project Setup" marker: skipped (setup was 1.2).
- **No exercise** after this part — "Demo & Exercise Time" is the "Let's play!" game only (decision 12).

### 1.9 📖 Nx Enforce Module Boundaries · 5 min
Deck "Nx Enforce Module Boundaries", up to "Exercise – Enforce Module Boundaries".
- Restrict inter-module interactions: app ↛ app, lib ↛ app; by scope, type, platform.
- Tags in `project.json` (generated with `--tags`); `@nx/enforce-module-boundaries` with `depConstraints` for scope
  and each type; allow list; the "Error" example; demo; summary.
- Rest of the deck (bloated shared scope, single vs multiple shared libs, secondary entry points, api type) as time allows.

### 1.10 🛠 Exercise: [enforce module boundaries](exercises/nx-enforce-module-boundaries.md) · 8 min · ✅ (optional — may be shown as a demo)
Source: summer2025 `06-enforce-module-boundaries`, rewritten for this workspace.
- *Tackles:* the architecture exists only by convention; one library already violates it. The rule is active but
  allows everything (`*` → `*`).
- *Progression:*
  1. `npx nx run-many -t lint` → all green.
  2. Replace the `*` constraint with the scope rules → 4 errors, all imports of the 2 untagged libraries.
  3. Tag them → green again.
  4. Add the type rules → the hidden violation appears: `movies/ui-movie-list` (`movie-search-control`) injects
     `MovieService` from `movies/data-access`.
  5. Discuss the fix (move the control into `feature-my-movies`, its only user, or pass the data in).
- *Result:* the architecture is enforced by the linter.
- *Done:* the start state is prepared for it either way (demo or hands-on).

### 1.11 📖 Outlook: Nx Cloud & AI agents · 3 min
No exercise — demo of something existing (no slides for AI yet).
- Deck "6. Nx Cloud": Nx Replay (remote cache), Nx Agents (distributed task execution), Nx Cloud interface (RxAngular).
- Nx and AI agents: `nx configure-ai-agents` (Nx skills + MCP), self-healing CI — bridge to block 4.

### 1.12 📖 The Angular build pipeline · 5 min
- `@nx/angular:application` wraps Angular's esbuild-based application builder; Vite for the dev server.
- Build output: initial chunks (in `index.html`, always downloaded) vs lazy chunks (per route).
- Why bytes matter: download → parse → execute before first render; delays LCP, blocks the main thread.
- Budgets as a guard rail — this app has none.
- Tools: Coverage tab and `--stats-json` + esbuild analyzer.

### 1.13 🛠 Exercise: [bundle-analysis-coverage_bundle-analyzer](exercises/bundle-analysis-coverage_bundle-analyzer.md) · 10 min · 🔧
- *Tackles:* what is in the initial bundle and why. Pre-Nx numbers: `main` ≈ 393 kB raw / 115 kB gzip,
  `polyfills` (zone.js) ≈ 35 kB; pages are lazy; `main` holds the app shell, rx-angular and both forms modules.
  Start state (Nx, Angular 22.2): initial total 442 kB raw / 119 kB transfer, `main` 239 kB + a shared initial chunk 160 kB;
  lazy chunks are named `index` now (one per feature library barrel).
- *Progression:*
  1. Coverage tab on `/list/popular` and a detail page → find unused code in `main`.
  2. `npx nx build movies --stats-json` → read the initial-chunk table in the build output.
  3. Load `stats.json` into the esbuild analyzer → find 1st-party and 3rd-party code in the tree map.
  4. Save the numbers as the **baseline** for block 4.
- *Result:* a baseline, and the first candidates (zone.js polyfills, forms modules in the shell).
- *Rework:* Nx command and output path (`dist/apps/movies/…`); the text claims "all our code is in one bundle",
  which is wrong; re-measure on the start state; check screenshots.

---

## Block 2 — Make it reactive: signals, async state, change detection (90 min)

> Move the app's state to signals, then make change detection visible and remove zone.js.

Theory follows the slide decks as they are: Signals Introduction → Using Signals → Signals + Observables →
Angular ChangeDetection In-Depth. Exercises are stripped down to fit; effect and toSignal are demos only.
The block will likely run over into block 3 — the overlap is taken on the fly.

**Technical aspects, in order**
1. Signals: producer / consumer, `signal`, `set` / `update`, `effect`, `computed`, reactive graph, push / pull, live / non-live, microtask coalescing
2. Using signals: initial values, type narrowing on signal calls (`@let`), `computed` memoization, immutable updates, dynamic dependencies
3. `effect` pitfalls: runs at least once, scheduled on the microtask queue
4. Signals + Observables: subscription, `toSignal` / `toObservable`
5. `resource` / `rxResource` / `httpResource`, `ResourceRef`, signal utilities (`injectParams`)
6. Change detection: component tree, `tick()`, default CD
7. zone.js patching, OnPush, dirty marking, `markForCheck` / `async` pipe, CD with signals (targeted mode)
8. Zoneless: `ChangeDetectionScheduler`, removing zone.js

| # | Min | | Item | Status |
|---|---|---|---|---|
| 2.1 | — | 📖 | Signals introduction | — |
| 2.2 | 10 | 🛠 | Exercise: signal-introduction | ✅ |
| 2.3 | — | 📖 | Using signals: initial values, computed | — |
| 2.4 | 10 | 🛠 | Exercise: signal-computed | ✅ |
| 2.5 | — | 📖 | effect pitfalls (demo, no exercise) | — |
| 2.6 | — | 📖 | Signals + Observables: toSignal / toObservable (demo, no exercise) | — |
| 2.7 | — | 📖 | resource / rxResource / httpResource + signal utilities | — |
| 2.8 | 10 | 🛠 | Exercise: signal-resource-injectParams | 🔧 |
| 2.9 | — | 📖 | What is change detection? | — |
| 2.10 | 5 | 🛠 | Exercise: Dirty Check (slim) | 🔧 |
| 2.11 | — | 📖 | zone.js, OnPush, markForCheck, CD with signals | — |
| 2.12 | 10 | 🛠 | Exercise: OnPush step 0 + signal change detection | 🚧 |
| 2.13 | — | 📖 | Zoneless | — |
| 2.14 | 10 | 🛠 | Exercise: zoneless | 🚧 |

Exercises: ~55 min. Theory: the remaining ~35 min (assumed) — deck lengths are not measured, so the real
overrun into block 3 depends on them.

### 2.1 📖 Signals introduction
Deck: 🚦 Signal Introduction.
- A signal wraps a value and notifies consumers when it changes.
- Reactivity graph: producers (`signal`) and consumers (`effect`, templates); `computed` is both.
- API: `signal()`, read by calling it, `set`, `update`; `Signal<T>` vs `WritableSignal<T>`, `asReadonly()`.
- Templates act as consumers — that is how signals reach the view.
- Live vs non-live consumers: an `effect` is always live; a `computed` becomes live when read by a live consumer, and stale again when that consumer is destroyed.
- Push / pull: producers push "I changed", consumers pull the value when they need it.
- Signal writes are coalesced on a microtask — many `set`s, one template update.

### 2.2 🛠 Exercise: [signal-introduction](exercises/signal-introduction.md) · 10 min · ✅
- *Tackles:* plain mutable fields in `AppShellComponent` (`sideDrawerOpen`, `_searchValue` getter / setter).
- *Progression:*
  1. `sideDrawerOpen` → `signal(false)`; toggle with `update(v => !v)`; template reads `sideDrawerOpen()`,
     writes with `.set($event)`.
  2. `_searchValue` getter / setter → `searchValue` signal + `setSearchValue()` (sets and navigates);
     template `[ngModel]="searchValue()" (ngModelChange)="setSearchValue($event)"`.
- *Result:* drawer and search work as before — now on signals.

### 2.3 📖 Using signals: initial values, computed
Deck: 🚦 Using Signals, up to "Demo & Exercise Time — Computed".
- Signals need an initial value; for objects prefer `signal<Movie | null>(null)` over `{} as Movie` or `Partial<Movie>`.
- Type narrowing does not work on function calls → store the value in a variable, or `@let` in templates.
- `computed`: derives from other signals, memoizes the dependencies and the result.
- Reference equality: mutating an array inside `update` does not notify — update immutably.
- Dynamic dependencies: only signals read on the last run are tracked; branching on a plain value breaks
  the computed — read signals into variables before branching.

### 2.4 🛠 Exercise: [signal-computed](exercises/signal-computed.md) · 10 min · ✅
- *Tackles:* `StarRatingComponent` derives `stars` and `tooltipText` imperatively inside an `@Input` setter.
- *Progression:*
  1. `_rating` → signal; the setter only sets it.
  2. `stars` → `computed`; template iterates `stars()`.
  3. `tooltipText` → `computed`; delete `setToolTopText`.
- *Result:* same rendering, derivation declared once, recomputed only when `rating` changes.

### 2.5 📖 effect pitfalls
Deck: 🚦 Using Signals, "effect() gotchas" up to "Demo & Exercise Time — Effect Introduction". No exercise — demo only.
- An effect runs at least once and re-runs when the signals it reads change.
- Quiz: what does `effect(() => console.log(movie()))` log after two synchronous `set`s? — only the last value.
- Effects are scheduled via the microtask queue; execution timing overview (task → microtasks → rAF → paint).
- Optional exercise if time allows: signal-effect (5 min — move the search navigation from `setSearchValue()`
  into an `effect`). Removed in `90dc081`; restore with `git checkout 908952f -- exercises/signal-effect.md`.

### 2.6 📖 Signals + Observables: toSignal / toObservable
Deck: 🚦 Signals + Observables, up to "Demo & Exercise Time — toSignal". No exercise — demo only.
- Subscribing: `subscribe` + unsubscribe vs. an `effect` that unsubscribes with its injector.
- `toSignal` built from scratch: initial value, subscribe + `set`, `DestroyRef` cleanup.
- `toSignal` options: `initialValue`, `injector`, `requireSync`.
- `toObservable`: built on an `effect` + `ReplaySubject`, `untracked`, error handling; `injector` option.

### 2.7 📖 resource / rxResource / httpResource + signal utilities
Deck: 🚦 Signals + Observables, "resource / rxResource / httpResource" up to "Demo & Exercise Time — resource + custom utilities".
- `resource` (Promise, `@angular/core`), `rxResource` (Observable, `rxjs-interop`), `httpResource` (`HttpClient`).
- `params` triggers the `loader` / `stream`; multiple params as an object; `defaultValue`.
- `ResourceRef`: `value`, `status`, `error`, `isLoading`, `hasValue()`, `reload()`, `set` / `update`.
- Rendering states in the template: `hasValue()` / `isLoading()` / `error()`.
- Signal utilities: `toSignal(route.params…)` → a reusable `routeParam()` → ngxtension `injectParams` /
  `injectQueryParams` / `linkedQueryParam`; "everything signals": `injectParams` + `rxResource`.
- Optional (deck): NgRx `selectSignal`, `connect`, `computedFrom`.

### 2.8 🛠 Exercise: [signal-resource-injectParams](exercises/signal-resource-injectParams.md) · 10 min · 🔧
- *Tackles:* `MovieSearchPageComponent` — `ActivatedRoute.params.pipe(switchMap(...))` + `async` pipe, no
  loading / error state (searching `throwError` kills the stream, the loader spins forever).
- *Progression:*
  1. `query` route param → `injectParams(p => p['query'])`; remove `ActivatedRoute`.
  2. `movies = rxResource({ params: this.query, stream: ({ params }) => searchMovies(params) })`.
  3. Template: `isLoading()` → loader, `error()` → message, `hasValue()` / `value()` → list; drop `AsyncPipe`.
- *Result:* signals-only component with loading and error states; a new query cancels the old request.
- *Rework:* `stream: ({ request: query })` does not compile on v22 → `params`; remove the sentence about
  "the previous exercise" (toSignal is a demo now); snippets use `inject()` fields while the app uses
  constructor injection.

### 2.9 📖 What is change detection?
Deck: Angular ChangeDetection In-Depth, up to "Demo & Exercise Time — DirtyCheckComponent".
- Change detection = syncing component state to the DOM (`{{ state }}` after a click).
- The component tree of the movies app: AppComponent → MovieList → MovieCard → StarRating …
- Default CD: `ApplicationRef.tick()` checks every component from the top down.

### 2.10 🛠 Exercise: [Dirty Check](exercises/change-detection%20-%20Dirty%20Check.md) (slim) · 5 min · 🔧
- *Tackles:* change detection is invisible — make it visible with a counter per component.
- *Progression:*
  1. Import the shipped `DirtyCheckComponent` (`libs/shared/utils/src/lib/dirty-check/`, `@movies/shared/utils`) and place `<dirty-check />` in
     `AppComponent`, `MovieListPageComponent` and `MovieCardComponent`.
  2. Interact: navigate between categories, open a detail page, hover a card (tilt), toggle dark mode.
- *Result:* every interaction bumps every counter — all components are `Eager`, zone.js ticks the whole tree.
  The counters stay in place for 2.12 and 2.14.
- *Rework:* `DirtyCheckComponent` ships in the start state (done; the exercise text points to it); cut the
  exercise down to "place and observe" — creating the component becomes optional reading.

### 2.11 📖 zone.js, OnPush, markForCheck, CD with signals
Deck: Angular ChangeDetection In-Depth, "How is that possible?" up to "Demo & Exercise Time — ChangeDetection - signals".
The deck's zone.js optimizations, OnPush and manual CD exercises are skipped — theory only.
- zone.js patches browser APIs (`addEventListener`, timers, XHR, Promise, rAF, …); `ApplicationRef` ticks on
  `onMicrotaskEmpty`. Problem: high-frequency events × long CD cycles.
- Ways out: zone flags, `runOutsideAngular`, unpatched APIs — and zoneless.
- OnPush: bottom-up dirty marking, top-down rendering; only the dirty path is checked; inputs compared by `===`.
  OnPush is the default since v22 — this app is pinned to `Eager` by the migration.
- `markForCheck` vs `detectChanges`; the `async` pipe calls `markForCheck` → marks all ancestors dirty.
- CD with signals: a signal write marks only the consuming view (`RefreshView`), ancestors get
  `HAS_CHILD_VIEWS_TO_REFRESH`; targeted mode refreshes only flagged views below a clean OnPush view.

### 2.12 🛠 Exercise: OnPush step 0 + [signal change detection](exercises/change-detection%20-%20signals.md) · 10 min · 🚧
- *Tackles:* `MovieCardComponent` is `Eager`; its `TiltDirective` writes a plain field from a `fromEvent`
  subscription and only renders because zone.js ticks the whole tree.
- *Progression:*
  0. Delete `changeDetection: ChangeDetectionStrategy.Eager` in `MovieCardComponent` (→ OnPush, the v22
     default). Observe: card counters stop, **the tilt breaks** — a `fromEvent` callback does not mark the
     OnPush card dirty.
  1. `TiltDirective`: `rotate` → `signal('rotate(0deg)')`, `.set()` in the subscription.
  2. Host binding reads the signal: `'[style.transform]': 'rotate()'`.
  3. Observe: the tilt works again; only the hovered card's counter increases, not its siblings' (targeted mode).
- *Result:* an OnPush card that updates through a signal; local change detection made visible. Parent counters
  still increase — the parents are `Eager` and zone.js ticks; "parents are not re-rendered" stays in the theory.
- *Rework:* add step 0; fix the rename bug (step 1 names the field `rotation`, step 2 binds `rotate()` — does
  not compile); remove the "remove markForCheck" step (no `markForCheck` in this app); rewrite the expected
  result (siblings, not `AppComponent`). Do not switch `AppComponent` to OnPush: `MovieListPageComponent` sets
  `this.movies` in a `subscribe`, so the list stays empty until an interaction.

### 2.13 📖 Zoneless
Deck: Angular ChangeDetection In-Depth, "Can we do better?" up to "Demo & Exercise Time — ChangeDetection - zoneless".
- Without zone.js, who triggers the tick? The `ChangeDetectionScheduler` — notified by signal writes,
  `markForCheck` (`async` pipe), template listeners, `setInput`.
- Zoneless is stable since v20.2 and the default since v21; this app opts back into zone.js via
  `provideZoneChangeDetection()` in `main.ts`.
- Removing zone.js: drop the provider, the `zone.js` polyfill and the dependency.
- What breaks: state written into plain fields from `subscribe` / timers / `fromEvent`.
- Deck slide title still says `provideExperimentalZonelessChangeDetection` — removed API, update the slide.

### 2.14 🛠 Exercise: [change-detection - zoneless](exercises/change-detection%20-%20zoneless.md) · 10 min · 🚧
- *Tackles:* zone.js is opted in explicitly although zoneless is the default.
- *Progression:*
  1. Remove `provideZoneChangeDetection()` from `apps/movies/src/main.ts`, remove `zone.js` from the
     polyfills in `apps/movies/project.json`, `npm uninstall zone.js`.
  2. Observe what breaks: the landing list stays empty — `MovieListPageComponent` sets `this.movies` in a
     `subscribe`; nothing schedules CD. The counters show no tick.
  3. Fix with signals: `movies` and `favoriteMovieIds` → signals, template reads them.
  4. Compare flame charts before / after: no zone frames; `polyfills` chunk (35 kB) gone.
- *Result:* the app runs without zone.js; the tilt keeps working thanks to 2.12.
- *Rework:* exercise uses `provideExperimentalZonelessChangeDetection` (removed) and adds it to `appConfig`
  instead of removing the explicit zone provider; steps 2–3 do not exist yet; claims "everything still runs".

### Bonus (not scheduled)
- [signal-migration](exercises/signal-migration.md) ✅ — CLI schematics for inputs / outputs / queries.
- [OnPush](exercises/change-detection%20-%20OnPush.md) 🔧 — the full OnPush exercise (incl. `AppComponent`
  and the "nothing renders until I hover" bug).
- [Dirty Check](exercises/change-detection%20-%20Dirty%20Check.md) — build the counter component yourself.

---

## Block 3 — Forms: signal forms (90 min)

> Rebuild the "my movies" forms on signal forms — the model is a signal, validation is a schema.

**Technical aspects, in order**
1. Why: reactive forms are a second source of truth, `valueChanges` subscriptions, no zoneless CD notification
2. `form(model, schema)` → field tree; field state as signals
3. Schema rules: `required`, `minLength`, custom `validate`; error messages in the schema
4. Template binding: `[formField]`, `[formRoot]`
5. Custom controls: `ControlValueAccessor` → `FormValueControl` (`value = model()`, `touch` output)
6. Arrays: array model + `applyEach`
7. Side effects: `effect` instead of `valueChanges`
8. Submission: `submission.action`, `submit()`, `reset()`
9. Dynamic forms: `hidden`, `disabled`, `readonly`, `applyWhen` / `applyWhenValue`

| # | Min | | Item | Status |
|---|---|---|---|---|
| 3.1 | 20 | 📖 | Signal forms | — |
| 3.2 | 45 | 🛠 | Exercise: signal-forms steps 1–6 | 🔧 |
| 3.3 | 10 | 📖 | Dynamic forms | — |
| 3.4 | 15 | 🛠 | Exercise: dynamic form fields | 🆕 |

### 3.1 📖 Signal forms · 20 min
- Short history: template-driven → reactive → typed reactive. Pain points: `FormGroup` tree next to the
  component state, `valueChanges` subscriptions, hard-to-type `FormArray`s, value changes do not schedule
  zoneless CD.
- Signal forms (experimental v21, stable v22): a plain `signal` model, `form(model, schema)` wraps it into a
  `FieldTree`; the model stays the source of truth.
- Field state: call the field — `f.comment().value()`, `valid()`, `touched()`, `dirty()`, `errors()`.
- Schema: rules on paths — `required`, `minLength`, `email`, `pattern`, …; `validate()` for custom rules;
  errors are `{ kind, message }` and live in the schema.
- Template: `[formField]` binds an input, `<form [formRoot]>` handles submit (prevents default, marks touched).
- Custom controls: `FormValueControl` — `value = model()`; touch is reported via a `touch` output (v22).
- Arrays: an array signal + `applyEach` for per-item rules; iterate the array field in `@for`.
- Submission: `form(..., { submission: { action } })`, `submit()` returns whether it ran, `reset()`.

### 3.2 🛠 Exercise: [signal-forms](exercises/signal-forms.md) steps 1–6 · 45 min · 🔧
- *Tackles:* `MyMovieListComponent` (`FormGroup` + inline unique validator, `FormArray` of favorites,
  `valueChanges` persistence, `markAllAsTouched` / `showError`) and `MovieSearchControlComponent` (a CVA).
- *Progression:*
  1. "Add a movie" `FormGroup` → `addModel` signal + `addForm` with `required`, `minLength` and a custom
     "already in your list" `validate`.
  2. Search control: CVA → `FormValueControl` (`value = model()`, `touch` output).
  3. Favorites `FormArray` → `favorites` array signal + `favoritesForm` with `applyEach`.
  4. Persistence: `valueChanges` subscription → `effect`.
  5. Submission into the `form()` options; `reset()`, `removeMovie()`; delete `add()` / `showError()`.
  6. Template: `[formRoot]`, `[formField]`, inline errors; drop `ReactiveFormsModule` and error templates.
  Runs as one slot: all steps migrate the same component, it compiles again only after step 6.
- *Result:* same UI, no `FormGroup`, typed fields, inline errors, persistence via `effect`. Verified: the
  "Full implementation" compiles on 22.0.1 with `strictTemplates`.
- *Rework:* step 2 uses `touched = model()` + `touched.set(true)` — v22 only listens to a `touch` output, so
  the field never becomes touched; participants must log in to reach `/my-movies`; favorites added from the
  list have no `comment` → `required` fails for them; stray `</content>` / `</invoke>` at the end of the file.

### 3.3 📖 Dynamic forms · 10 min
- Forms whose shape depends on their values — declared in the schema, not by enabling / disabling controls.
- `hidden`, `disabled`, `readonly` with a reactive condition; field state reflects it (`hidden()`, `disabled()`).
- `applyWhen(path, condition, schema)` / `applyWhenValue` (type-guard narrowing for discriminated unions).
- Adding / removing array items = updating the model signal; the field tree follows.

### 3.4 🛠 Exercise: Signal forms — dynamic form fields · 15 min · 🆕
- *Tackles:* conditional fields and rules on top of the finished add-movie form.
- *Progression (proposal):* add a field that is only shown and required under a condition (`hidden` +
  `applyWhen`) → render it with `@if (!field().hidden())` → verify validation only applies when visible.
- *Result:* a form whose rules follow the model.

---

## Block 4 — Make it fast: AI-assisted performance engineering (90 min)

> First understand performance (render pipeline, Core Web Vitals, DevTools, event loop) — then take an agent for help.

Theory follows the slide decks in order: "Browser Render Pipeline" → "Core Web Vitals" → "Performance Analysis &
Flame Charts" → "JS Event Loop"; then the AI part (no decks yet). The AI part is **trainer demos** (🎬), no
hands-on agent setup — attendees may follow along if they have an agent. Skills: **publicly available ones only**.

**Technical aspects, in order**
1. Browser render pipeline: scripting → recalc style → layout → paint → composite
2. Core Web Vitals: LCP (+ breakdown), INP (+ phases), CLS; other vitals; measuring (Performance panel, CrUX)
3. DevTools Performance panel: recording, throttling, tracks, main thread, tasks / long tasks, timings, frames, search
4. Event loop: macrotasks, microtasks, rAF, idle callbacks, execution timing
5. MCP; Chrome DevTools MCP: setup variants, capabilities, recording from a flow description
6. Streamlining performance analysis with AI: from DevTools AI assistance to agents with skills and framework knowledge
7. Public skills on the movies app; verify by measuring

| # | Min | | Item | Status |
|---|---|---|---|---|
| 4.1 | 5 | 📖 | Browser Render Pipeline | — |
| 4.2 | 12 | 📖 | Core Web Vitals | — |
| 4.3 | 3 | 🎬 | Demo: Core Web Vitals live (Performance panel live metrics, CrUX Vis) | — |
| 4.4 | 10 | 📖 | Performance Analysis & Flame Charts | — |
| 4.5 | 12 | 🛠 | Exercise: performance tab & flame charts | 🔧 |
| 4.6 | 8 | 📖 | JS Event Loop | — |
| 4.7 | 5 | 🛠 | Exercise: event loop (optional) | ✅ |
| 4.8 | 10 | 📖 | MCP & Chrome DevTools MCP | 🆕 |
| 4.9 | 10 | 🎬 | Demo: setup, capabilities, recording from a flow description | 🆕 |
| 4.10 | 5 | 📖 | Streamlining performance analysis with AI | 🆕 |
| 4.11 | 10 | 🎬 | Demo: public performance skills on the movies app | 🆕 |
| 4.12 | 5 | 📖 | Wrap-up & Q&A | — |
| (opt.) | — | 📖 | Network & image optimizations — only if time allows, between 4.7 and 4.8 | — |

Sum ≈ 95 min (estimates). If block 3 runs over: 4.7 and 4.3 go first.

### 4.1 📖 Browser Render Pipeline · 5 min
Deck "Browser Render Pipeline".
- Five key areas: scripting → recalculate styles → layout → paint → composite.
- Layout is the most expensive step (recursive geometry); composite is cheap and can run on the GPU.
- Every step can introduce jank — know which steps your code triggers: layout property → full reflow, paint
  property → no layout, compositor property → neither. Aim for compositor-only properties (csstriggers.com).

### 4.2 📖 Core Web Vitals · 12 min
Deck "Core Web Vitals", up to "Demo & Exercise Time!".
- LCP (loading, ≤ 2.5 s / 4 s), INP (reactivity, ≤ 200 ms / 500 ms, replaced FID in March 2024), CLS (visual stability, ≤ 0.1 / 0.25).
- LCP: candidates, LCP vs FCP, CSR vs SSR; LCP breakdown: TTFB → resource load delay → resource load time →
  element render delay; what causes bad LCP per phase.
- INP: input delay → processing time → presentation delay; causes: blocking tasks (high TBT), unoptimized or
  unnecessary code on interactions (tracking, logging), heavy style recalc / layout / paint.
- CLS: impact fraction × distance fraction; causes and fixes: reserve space, lazy images, lazy-loaded fonts, font style matching.
- Other vitals: TTFB, FCP, TBT, TTI. Measuring: Performance tab; field data: CrUX, CrUX Vis, RumVision, Treo.

### 4.3 🎬 Demo: Core Web Vitals live · 3 min
- The deck ends with "Demo & Exercise Time!" — the hands-on part needs the DevTools basics from 4.4, so here only a demo.
- Performance panel landing view: live LCP / INP / CLS of the movies app while clicking around; CrUX Vis for a public site.

### 4.4 📖 Performance Analysis & Flame Charts · 10 min
Deck "Performance Analysis & Flame Charts".
- Don't guess, measure. Open DevTools, start recording (`Ctrl+E`), record a reload (`Ctrl+Shift+E`).
- Throttling: measure in real conditions (CPU throttling recommended).
- Overview: filmstrip, tracks (network, main, worker, GPU, frames, timings), main thread, flame chart, summary, minimap.
- Navigation: select / expand a range, WASD; timeline, tracks and summary are connected.
- Main track: tasks, task detail view, vertical call stacks, long tasks (> 50 ms) and blocking time; following async tasks.
- Timings (custom events, DOM events, Web Vitals), frames (16 ms ≈ 60 fps), search (`Ctrl+F`).

### 4.5 🛠 Exercise: [performance-tab-flame-charts](exercises/performance-tab-flame-charts.md) · 12 min · 🔧
- *Tackles:* black-box performance audit of the movies app with the Performance panel — the same analysis the
  agent will do in 4.9.
- *Progression:*
  1. Record & reload → find the LCP and the LCP element (first poster); use the insights panel.
  2. Screenshots: from the loading screen to the visible movie list; mark the range, read the summary.
  3. Search the flame chart for the `MovieListPageComponent` bootstrap.
  4. Throttle the CPU, click a nav item → measure the interaction (INP) and find the culprit:
     `TrackingService.trackEvent`, a 10-million-iteration loop on every nav click.
  5. (if time) Compare consecutive recordings; save and import a recording.
- *Result:* everybody can read LCP and INP in a trace — and knows the INP problem the agent should find in 4.9.
- *Rework:* trim to steps 1–4; check screenshots; paths after the Nx start state.

### 4.6 📖 JS Event Loop · 8 min
Deck "JS Event Loop".
- The event loop and the macrotask queue: run-to-completion; macrotask sources (DOM events, timers, rAF, idle callbacks, message channel, …).
- Microtasks (Promise, `queueMicrotask`): run before any other event handling or rendering.
- Scheduling techniques: `setTimeout` / `setInterval`, `requestIdleCallback`, `requestAnimationFrame`, `scheduler.postTask`.
- Execution timing overview: task → microtasks → rAF → paint → timers / idle callbacks; "what is executed when?".

### 4.7 🛠 Exercise: event loop · 5 min · ✅ (optional)
- *Tackles:* predict the execution order of mixed macro- / microtasks.
- *Progression:* open the deck's StackBlitz (https://stackblitz.com/edit/js-v6rset?file=index), predict the order, run it, compare
  with the "Event Loop Exercise" slide.
- *Result:* attendees can map scheduling APIs to the flame chart.

### 4.8 📖 MCP & Chrome DevTools MCP · 10 min · 🆕 (no deck yet)
- **MCP in general:** a standard protocol for giving an agent tools — servers expose tools, clients (Claude Code,
  Copilot, Cursor, Gemini CLI, …) call them. The DevTools MCP gives the agent a browser.
- **Setup — several ways:**
  - generic config: `{"command": "npx", "args": ["-y", "chrome-devtools-mcp@latest"]}`
  - Claude Code: `claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest`, or the plugin
    (`/plugin marketplace add ChromeDevTools/chrome-devtools-mcp`) which also installs the official skills
  - VS Code / Copilot: `code --add-mcp '{…}'`; Cursor: Settings → MCP
  - **take over an existing browser session:** `--autoConnect` (Chrome 144+, enable remote debugging at
    `chrome://inspect/#remote-debugging`), or `--browser-url` / `--ws-endpoint`
  - useful flags: `--isolated`, `--headless`, `--channel`, `--viewport`; privacy: `--no-usage-statistics`,
    `--no-performance-crux` (usage statistics and CrUX lookups are on by default)
- **Capabilities:** navigation and input (navigate, click, fill), screenshots and accessibility snapshots, console
  messages with source-mapped stack traces, network requests, performance traces (`performance_start_trace`,
  `performance_stop_trace`, `performance_analyze_insight` — LCP breakdown, LCP discovery, render-blocking, …),
  emulation (CPU / network throttling, viewport), `evaluate_script`, Lighthouse audits (a11y, SEO, best practices —
  not performance), memory heap snapshots.
- **Limits:** lab data only; the agent sees everything in the browser (use `--isolated`, no sensitive sessions);
  officially Chrome only.

### 4.9 🎬 Demo: setup, capabilities, recording from a flow description · 10 min · 🆕
- *Shows:* the MCP setup live and what the agent can do with the movies app.
- *Progression:*
  1. Setup live: one variant from 4.8 (e.g. Claude Code + `--autoConnect` to the trainer's running Chrome).
  2. Capabilities: navigate to `/list/popular`, take a screenshot, read the console, list network requests.
  3. **Recording from a flow description**, e.g.:
     > "Open /list/popular with 4x CPU throttling. Record a performance trace while you scroll the list, click
     > 'Top Rated' and open the first movie. Report LCP, INP and the three longest tasks with their call stacks."
  4. Compare the agent's findings with the attendees' own trace from 4.5 (`TrackingService.trackEvent`).
- *Bridge to 4.10:* the prompt works — but it has to be typed again every time, and the agent improvises each run.
- *Expected findings in the app* (also reference material for the optional network & image part):

  | Problem | Evidence in the app | Fix | Reference |
  |---|---|---|---|
  | Slow nav click (INP) | `TrackingService.trackEvent` busy loop | defer / remove | — |
  | All posters eager, w780 | `movie-card` `<img>` without `loading` / `fetchpriority` / size | lazy for the rest, eager + high for the first | [lazy-loading](exercises/network-lazy-loading.md) 🔧 needs signal migration (`movie()`, `index()`) |
  | No connection hints | `index.html` has none; 4 origins (api / image TMDB, Google Fonts css / files) | `preconnect` (+ `crossorigin` for api, gstatic) | [preconnect](exercises/network-resource-hints-preconnect.md) ✅ |
  | Font swap → CLS | Poppins loaded late on the detail page | `preload` woff2 | [preload-prefetch](exercises/network-resource-hints-preload-prefetch.md) 🔧 font URLs are `v23`, Google now serves `v24` |
  | Genres requested from the template | `genres$ = getGenres()` in the app shell, `async` in template | `shareReplay` + `provideAppInitializer` | [prefetch-lcp-data](exercises/network-prefetch-lcp-data.md) 🔧 uses `APP_INITIALIZER` / `NgModule` |
  | Images not optimised | no `NgOptimizedImage` | `ngSrc` + `priority`, TMDB loader + `ngSrcset` | [ng-optimized-images](exercises/ng-optimized-images.md) 🔧 missing `NgOptimizedImage` import, step 2 DRAFT |

### 4.10 📖 Streamlining performance analysis with AI · 5 min · 🆕 (no deck yet)
A ladder — each step gives the AI more structure and less room to guess:
1. **DevTools AI assistance** — "Ask AI" on a trace or an insight. Zero setup; limited to what is on screen;
   can be disabled by enterprise policy (check for DATEV).
2. **Agent + DevTools MCP, ad-hoc prompts** — the 4.9 demo. Flexible, but improvised, not reproducible, token-heavy.
3. **Agent + skills** — the prompt becomes a skill: a `SKILL.md` (name, description, instructions, optional
   scripts / references), loaded only when the task matches (progressive disclosure; open standard, supported by
   most agents). Holds the flow, the measurement protocol (throttling, runs, thresholds) and an analysis checklist.
4. **Agent + framework knowledge** — Angular CLI MCP (`ng mcp`: best practices, docs search,
   `onpush_zoneless_migration`), the official Angular skills (`angular-developer`), `AGENTS.md` / best-practices
   files from angular.dev → fixes in idiomatic Angular instead of generic web advice.

**Skills vs. specialized agents** (tiny section):
- *Skill* — know-how loaded into the **main** agent's context when the task matches; the agent stays the same.
- *Specialized agent (sub-agent)* — a separate agent with its own instructions, its own tool set (e.g. only the
  DevTools MCP) and its **own context window**; the main agent delegates "analyse this page" and gets a short report back.
- Why it matters for performance: traces, network lists and console dumps are huge — a specialized agent keeps them
  out of the main conversation, can run several analyses in parallel (e.g. one per route), and can be restricted to
  read-only tools.
- Combine both: a specialized "performance analyst" agent that uses the performance skills.
- Most agent tools support them (e.g. Claude Code sub-agents in `.claude/agents/`, custom agents in Copilot / Cursor).

Rule on every step: the agent proposes, the trace decides.

### 4.11 🎬 Demo: public performance skills on the movies app · 10 min · 🆕
- *Shows:* step 3 + 4 of the ladder with publicly available skills only.
- *Skills used:*
  - Chrome DevTools MCP plugin skills (repo `ChromeDevTools/chrome-devtools-mcp`): **`debug-optimize-lcp`** (LCP
    breakdown → sub-part → fix playbook), `chrome-devtools` (general usage); `memory-leak-debugging`, `a11y-debugging`
    to mention.
  - Angular skills (`npx skills add https://github.com/angular/skills`): `angular-developer`; optionally the Angular CLI MCP.
- *Progression:*
  1. Show the installed skills and one `SKILL.md` (structure, description, workflow).
  2. Run `debug-optimize-lcp` on `/list/popular` → the agent walks the LCP breakdown and names the poster image
     problems (eager w780, no priority).
  3. Let it apply one fix (with Angular knowledge: e.g. `NgOptimizedImage` + `priority` on the first card).
  4. Re-record → compare LCP before / after.
- *Note:* there is no public INP skill — the INP finding stays with the ad-hoc prompt from 4.9 (a good contrast).
- *Rework:* dry-run the demo on the start state; check which skills the plugin installs at workshop time.

### 4.12 📖 Wrap-up & Q&A · 5 min
No exercise.
- Recap along the story: Nx workspace, app reactive and zoneless, forms on signals, measured — and an agent that helps.
- Further material, questions.

### (optional) 📖 Network & image optimizations
Only if time allows (between 4.7 and 4.8). No deck listed yet. The network / image exercises in the table under 4.9
serve as reference solutions, not as hands-on slots.

---

## Repo issues to fix before the workshop (independent of exercises)

All fixed with the Nx start state: flat ESLint config (`nx run-many -t lint` green), Vitest `test` targets (jest config
removed), `index.html` quote, SSR leftovers removed, README node versions.

## Decisions (2026-10-06)

1. One day, 4 blocks × 90 min (structure above).
2. (2026-10-07, replaces "Nx demo only") The day starts from an Nx workspace already split into tagged libraries
   (non-buildable); no `nx init` exercise, no library splitting by attendees. See NX-START-STATE.md.
3. One start state on `main` for the whole day; no checkpoint branches needed for block 1.
4. Block 4 network / image exercises are reference solutions, not run hands-on one by one; network-cancel-requests dropped.
   (2026-10-07) Network & image optimizations are optional theory, only if time allows.
5. Block 2: theory follows the four slide decks unchanged; effect and toSignal are demos only (effect exercise optional).
6. No new exercises for now — structure only.
7. Story of the day: remove the app's compatibility layer step by step.
8. (2026-10-07) Strict theory → exercise alternation, never two exercises in a row.
9. (2026-10-07) Block 2: Dirty Check is mandatory but slim (component shipped in the start state); the OnPush exercise is replaced by a one-line step 0 in the signal-CD exercise. The block stays one block; overrun into block 3 is handled on the fly.
10. (2026-10-07) Block 1: theory follows the Nx decks in order (Nx Core → Scalable Workspace Architectures →
   Enforce Module Boundaries), Nx before the Angular build; builds run through the Nx executor (`@nx/angular:application`).
   Module boundaries exercise optional (may be a demo), start state prepared for it.
11. (2026-10-07) Block 4: theory follows the four performance decks (render pipeline → CWV → performance analysis →
   event loop); the AI part (DevTools MCP, AI approaches, skills) is trainer demos; only publicly available skills.
12. (2026-10-07) Block 1: no scalable-workspace-architectures exercise (generate a feature library) — dropped.

## Open questions

1. Publish `push-based/ws-datev-codingfestival-081026` on GitHub — public or private?
2. Block 4 AI part is demo-only; attendees following along need an agent + Chrome — what does DATEV allow? (also: is DevTools AI assistance enabled?)
3. Block 4 (optional network part) reference solutions for lazy loading / `NgOptimizedImage` assume the signal migration (bonus in block 2) — rewrite them for decorator inputs, or make the migration part of the start state for block 4?
4. ~~All exercises reference the pre-Nx paths~~ — updated with the start state.

## Dropped from the sources

ng-modern (as exercises): signal-effect, signal-toSignal, zone.js optimizations, inject migration, new control flow, defer, SSR (3), manual CD.
perf: CSS, scheduling, SSR, user flows, ngZone/zone optimizations, network-cancel-requests.
nx: nx init, library splitting (scalable-architecture-design), generate a feature library (old 1.9), custom plugins/executors/generators, Nx Cloud hands-on, DTE, atomizer, cache deep dive.
