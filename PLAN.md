# Workshop plan (trainer notes — delete before the workshop)

**Base app:** `push-based/ws-ng-modern-enterjs-2026` @ `d2eca9f` — movies app on Angular 22.0.1 (bumped to 22.2 with the Nx start state — `@nx/angular` 23.3 does not resolve against 22.0.1), `@angular/build:application`
(esbuild), ngxtension 6, TypeScript 6. Requires node `^22.22.3 || ^24.15.0 || >=26` (from `@angular/core` engines).

**Format:** one day, 4 blocks × 90 min. Each block is a numbered sequence of theory (📖) and exercise (🛠)
steps; a theory step may have no exercise after it. Minutes are estimates (assumed), not measured.

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
| 1.5 | 10 | 🛠 | Exercise: task pipelines | 🆕 |
| 1.6 | 3 | 📖 | Monorepos & Nx Core — part 3: affected | — |
| 1.7 | 10 | 🛠 | Exercise: affected & caching | 🆕 |
| 1.8 | 10 | 📖 | Nx - Scalable Workspace Architectures | — |
| 1.9 | 10 | 🛠 | Exercise: scalable workspace architectures (generate a feature library) | 🆕 |
| 1.10 | 5 | 📖 | Nx Enforce Module Boundaries | — |
| 1.11 | 8 | 🛠 | Exercise: enforce module boundaries (optional — may be a demo) | 🆕 |
| 1.12 | 3 | 📖 | Outlook: Nx Cloud & AI agents (demo) | — |
| 1.13 | 5 | 📖 | The Angular build pipeline | — |
| 1.14 | 10 | 🛠 | Exercise: bundle analysis | 🔧 |

Sum ≈ 107 min (estimates) — ~17 min over. Candidates: 1.11 as a 3-min demo, shorter intro, 1.13/1.14 shorter.

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

### 1.5 🛠 Exercise: task pipelines · 10 min · 🆕
Source: summer2025 `02-task-pipelines` (run tasks, task graph) rewritten for this workspace (old nx-02, removed — `git show 90dc081:exercises/nx-02-task-pipelines.md`);
bonus from dfl `exercises/task-dependencies.md`.
- *Tackles:* first hands-on contact with Nx — run tasks, look at graphs, get a feel for it. No config changes.
- *Progression:*
  1. `npx nx show project movies --web` → which targets exist, configured vs inferred.
  2. Run tasks: `npx nx build movies` / `npx nx run movies:build` (both syntaxes), `lint` / `test` for one library.
  3. Many projects: `npx nx run-many -t lint test`.
  4. Task graph: `npx nx build movies --graph`, `npx nx run-many -t lint --graph`.
- *Bonus — task dependencies:* the start state ships a `deploy` target (Docker image from `dist`, as in dfl) without
  `dependsOn`. Delete `dist`, run `npx nx run movies:deploy` → fails → add `"dependsOn": ["build"]` → runs build
  first; check `--graph`. Without Docker: swap the command for an `echo` (dfl's fallback). Then try more `dependsOn` rules (e.g. deploy → build, test, lint) and validate them in the task graph.
- *Result:* attendees can run tasks and read the task graph; the bonus shows task dependencies.
- *Rework:* new exercise text.

### 1.6 📖 Monorepos & Nx Core — part 3 · 3 min
Deck "Monorepos & Nx Core", "affected" up to "Demo & Exercise – Affected & Caching".
- Affected graph: change introduced → which projects are affected; `nx affected -t test`.
- Caching: the deck has no theory slide — explain at the exercise intro (inputs → hash → replay outputs + terminal output),
  or borrow the "Nx Replay" visual from the Nx Cloud deck.

### 1.7 🛠 Exercise: affected & caching · 10 min · 🆕
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
- *Rework:* adapt dfl's text — our libraries have no `build` target, so library-level steps use `lint` / `test`
  (dfl uses `build` with a buildable `data` lib).

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

### 1.9 🛠 Exercise: scalable workspace architectures — generate a feature library · 10 min · 🆕
Replaces the old "split the monolith" exercise — attendees grow the workspace instead of moving files.
- *Tackles:* generators, library conventions, feature libraries + lazy routes, the graph following the code.
- *Progression:*
  1. `npx nx g @nx/angular:library libs/movies/feature-favorites --tags=scope:movies,type:feature`
     (or via Nx Console) → inspect what the generator created: `project.json`, `index.ts`, tsconfig path.
  2. Implement a small favorites page: inject `MovieService` from `movies/data-access`, render with `movie-list`
     from `movies/ui-movie-list` (code in `<details>`).
  3. Register it lazily in the routes (`loadComponent: () => import('@…/movies/feature-favorites')…`) and add a nav link.
  4. `npx nx graph` → the new node and its edges; `npx nx affected -t lint test` → it shows up.
- *Result:* a new feature library, wired the Nx way, without touching existing structure.
- *Rework:* new exercise; decide the import alias style together with the start state.

### 1.10 📖 Nx Enforce Module Boundaries · 5 min
Deck "Nx Enforce Module Boundaries", up to "Exercise – Enforce Module Boundaries".
- Restrict inter-module interactions: app ↛ app, lib ↛ app; by scope, type, platform.
- Tags in `project.json` (generated with `--tags`); `@nx/enforce-module-boundaries` with `depConstraints` for scope
  and each type; allow list; the "Error" example; demo; summary.
- Rest of the deck (bloated shared scope, single vs multiple shared libs, secondary entry points, api type) as time allows.

### 1.11 🛠 Exercise: enforce module boundaries · 8 min · 🆕 (optional — may be shown as a demo)
Source: summer2025 `06-enforce-module-boundaries`, rewritten for this workspace.
- *Tackles:* the architecture exists only by convention; one library already violates it. The rule is active but
  allows everything (`*` → `*`).
- *Progression:*
  1. `npx nx run-many -t lint` → all green.
  2. Replace the `*` constraint with the scope rules → lint fails for the 2 untagged libraries ("project without tags").
  3. Tag them → green again.
  4. Add the type rules → the hidden violation appears: `movies/ui-movie-list` (`movie-search-control`) injects
     `MovieService` from `movies/data-access`.
  5. Discuss the fix (move the control to the feature library, or pass the data in).
- *Result:* the architecture is enforced by the linter.
- *Rework:* new exercise; the start state is prepared for it either way (demo or hands-on).

### 1.12 📖 Outlook: Nx Cloud & AI agents · 3 min
No exercise — demo of something existing (no slides for AI yet).
- Deck "6. Nx Cloud": Nx Replay (remote cache), Nx Agents (distributed task execution), Nx Cloud interface (RxAngular).
- Nx and AI agents: `nx configure-ai-agents` (Nx skills + MCP), self-healing CI — bridge to block 4.

### 1.13 📖 The Angular build pipeline · 5 min
- `@nx/angular:application` wraps Angular's esbuild-based application builder; Vite for the dev server.
- Build output: initial chunks (in `index.html`, always downloaded) vs lazy chunks (per route).
- Why bytes matter: download → parse → execute before first render; delays LCP, blocks the main thread.
- Budgets as a guard rail — this app has none.
- Tools: Coverage tab and `--stats-json` + esbuild analyzer.

### 1.14 🛠 Exercise: [bundle-analysis-coverage_bundle-analyzer](exercises/bundle-analysis-coverage_bundle-analyzer.md) · 10 min · 🔧
- *Tackles:* what is in the initial bundle and why. Pre-Nx numbers: `main` ≈ 393 kB raw / 115 kB gzip,
  $1
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
| 3.1 | 15 | 📖 | Signal forms | — |
| 3.2 | 55 | 🛠 | Exercises: signal-forms-01…05 | ✅ |
| 3.3 | 5 | 📖 | Dynamic forms | — |
| 3.4 | 15 | 🛠 | Exercise: signal-forms-06 (custom validation & dynamic fields) | ✅ |

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

### 3.2 🛠 Exercises: signal-forms-01…05 · 55 min · ✅
- *Tackles:* nothing to migrate: participants build **My Movies (Signal Forms)** from an empty shell,
  `libs/movies/feature-my-movies-v2` (`movies-feature-my-movies-v2`, `scope:movies`, `type:feature`), lazy-loaded on
  `/my-movies-v2` and linked in the side menu. The shell has the markup and styles, the class is empty. The Reactive
  Forms page (`/my-movies`, `feature-my-movies`) stays untouched as the comparison.
- *Progression:*
  1. [A first signal form](exercises/signal-forms-01-first-form.md): `signal` model, `form()`, `[formField]` (the
     CVA search control works as-is), submit to the console.
  2. [Simple validation](exercises/signal-forms-02-validation.md): schema, messages, `novalidate` (`[formField]`
     mirrors `required`/`minlength` onto the element), `touched() && invalid()`, `reset()`, `provideSignalFormsConfig`.
  3. [A real submit](exercises/signal-forms-03-submit.md): `submission` option, `[formRoot]`, `submitting()`, server
     errors, `onInvalid` + `focusBoundControl()`. Uses the fake backend `MovieService.addFavorite()` (1 s delay,
     rejects "spoiler") that ships in `movies/data-access`.
  4. [Dynamic forms](exercises/signal-forms-04-dynamic-list.md): array signal, `applyEach`, `@for` over the field
     tree, persistence via `effect`. Favorites liked on the movie list have no `comment`: normalized on load
     (`[formField]` throws for a missing property).
  5. [A custom form field](exercises/signal-forms-05-custom-control.md): the search control (`movies/ui-movie-list`)
     CVA → `FormValueControl`; the Reactive Forms page keeps working with it (`formControlName`, v22).
- *Result:* each exercise ends with the full code. Verified 2026-10-07 on the Nx start state: every step lints and
  builds (`nx build movies`), clicked through in the browser.

### 3.3 📖 Dynamic forms · 10 min
- Forms whose shape depends on their values — declared in the schema, not by enabling / disabling controls.
- `hidden`, `disabled`, `readonly` with a reactive condition; field state reflects it (`hidden()`, `disabled()`).
- `applyWhen(path, condition, schema)` / `applyWhenValue` (type-guard narrowing for discriminated unions).
- Adding / removing array items = updating the model signal; the field tree follows.

### 3.4 🛠 Exercise: [signal-forms-06](exercises/signal-forms-06-form-logic.md) · 15 min · ✅
- *Tackles:* custom and conditional logic on top of the finished add-movie form.
- *Progression:* reusable `uniqueMovie(path, favorites)` rule (re-runs when the list changes) → comment `disabled`
  until a movie is picked, with a reason → "watched" checkbox shows a `hidden` rating (`required`, `min`, `max`;
  `@if (!field().hidden())`) → save and show the rating. Bonus: `applyWhen` for low ratings.
- *Result:* a form whose rules follow the model.

---

## Block 4 — Make it fast: AI-assisted performance engineering (90 min)

> Measure the now-modern app, then let an agent with Chrome DevTools MCP and skills find and fix its problems.

**Technical aspects, in order**
1. Core Web Vitals: LCP, INP, CLS — thresholds, LCP sub-parts, INP phases
2. DevTools Performance panel: trace, flame chart, insights, CPU throttling
3. MCP: giving an agent tools; Chrome DevTools MCP (traces, insights, network, emulation)
4. Agent skills: `SKILL.md`, progressive disclosure, official perf skills (`debug-optimize-lcp`)
5. Fixes: resource hints, image loading / priority, `NgOptimizedImage`, prefetching data at bootstrap
6. Verify by measuring; compare against the block 1 baseline

| # | Min | | Item | Status |
|---|---|---|---|---|
| 4.1 | 15 | 📖 | Web performance essentials | — |
| 4.2 | 10 | 🛠 | Exercise: guided flame-chart tour | 🔧 |
| 4.3 | 10 | 📖 | Agents & Chrome DevTools MCP | 🆕 |
| 4.4 | 20 | 🛠 | Exercise: find the problems with DevTools MCP | 🆕 |
| 4.5 | 5 | 📖 | Performance skills | 🆕 |
| 4.6 | 20 | 🛠 | Exercise: fix and verify with skills | 🆕 |
| 4.7 | 10 | 📖 | Wrap-up & Q&A | — |

### 4.1 📖 Web performance essentials · 15 min
- Core Web Vitals at p75: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
- LCP sub-parts: TTFB → resource load delay → resource load duration → element render delay.
- INP phases: input delay → processing → presentation delay.
- Performance panel: live metrics, record & reload, flame chart, network track, screenshots, insights
  sidebar (LCP breakdown, LCP discovery, render-blocking), CPU throttling, annotations.
- Fix toolbox: `preconnect`, `preload` (with `as`), `prefetch`, `fetchpriority`, `loading="lazy"` (never on
  the LCP image), `NgOptimizedImage` (`priority`, loaders, `ngSrcset`), starting data requests at bootstrap.

### 4.2 🛠 Exercise: guided flame-chart tour · 10 min · 🔧
Source: [performance-tab-flame-charts](exercises/performance-tab-flame-charts.md), trimmed.
- *Tackles:* reading a trace — what the agent will produce in 4.2.
- *Progression:*
  1. Record & reload → find LCP and the LCP element (first poster).
  2. Screenshots: launcher → visible list; mark the range, read the summary.
  3. Search the flame chart for `MovieListPageComponent` bootstrap.
  4. CPU throttling → click a nav item → find the INP culprit (`TrackingService.trackEvent`, a 10M-iteration loop).
- *Result:* everybody can read LCP and INP in a trace.

### 4.3 📖 Agents & Chrome DevTools MCP · 10 min
- MCP: a standard way to give an agent tools (Claude Code, Cursor, Copilot, …).
- Chrome DevTools MCP: `performance_start_trace` / `performance_analyze_insight`, `list_network_requests`,
  console, `emulate` (CPU / network), screenshots, `evaluate_script`.
- Workflow: trace → read insights → hypothesis → change → re-trace.
- Limits: lab data only, browser content is exposed to the agent (`--isolated`), CrUX lookups and usage
  statistics on by default.
- Angular side: Angular CLI MCP (`ng mcp`: best practices, docs search, `onpush_zoneless_migration`).

### 4.4 🛠 Exercise: find the app's problems with DevTools MCP · 20 min · 🆕
- *Tackles:* let the agent audit the movies app; participants check its findings against the trace.
- *Progression:* set up the MCP → ask for an LCP analysis of `/list/popular` → INP analysis of a nav click →
  CLS on `/movie/533535` → collect findings.
- *Expected findings (reference solutions):*

  | Problem | Evidence in the app | Fix | Reference |
  |---|---|---|---|
  | No connection hints | `index.html` has none; 4 origins (api / image TMDB, Google Fonts css / files) | `preconnect` (+ `crossorigin` for api, gstatic) | [preconnect](exercises/network-resource-hints-preconnect.md) ✅ |
  | Font swap → CLS | Poppins loaded late on the detail page | `preload` woff2 | [preload-prefetch](exercises/network-resource-hints-preload-prefetch.md) 🔧 font URLs are `v23`, Google now serves `v24` |
  | All posters eager, w780 | `movie-card` `<img>` without `loading` / `fetchpriority` / size | lazy for the rest, eager + high for the first | [lazy-loading](exercises/network-lazy-loading.md) 🔧 needs signal migration (`movie()`, `index()`) |
  | Genres requested from the template | `genres$ = getGenres()` in `AppShellComponent`, `async` in template | `shareReplay` + `provideAppInitializer` | [prefetch-lcp-data](exercises/network-prefetch-lcp-data.md) 🔧 uses `APP_INITIALIZER` / `NgModule` |
  | Images not optimised | no `NgOptimizedImage` | `ngSrc` + `priority`, TMDB loader + `ngSrcset` | [ng-optimized-images](exercises/ng-optimized-images.md) 🔧 missing `NgOptimizedImage` import, step 2 DRAFT |
  | Slow nav click (INP) | `TrackingService.trackEvent` busy loop | defer / remove | — |

### 4.5 📖 Performance skills · 5 min
- A skill = folder with `SKILL.md` (name + description + instructions, optional scripts / references);
  loaded only when the task matches (progressive disclosure). Open standard, supported by most agents.
- Examples: Chrome's `debug-optimize-lcp`, Angular's `angular-developer` skill.
- Rule that stays: the agent proposes, the trace decides.

### 4.6 🛠 Exercise: fix and verify with skills · 20 min · 🆕
- *Tackles:* turn findings from 4.2 into verified fixes.
- *Progression:* install the DevTools MCP plugin skills → run `debug-optimize-lcp` on `/list/popular` → apply
  one or two fixes → re-trace with throttling → compare with the block 1 baseline (bundle) and the 4.1 trace.
- *Result:* measured LCP / INP improvement, made by the agent, verified by the participant.

### 4.7 📖 Wrap-up & Q&A · 10 min
No exercise.
- Recap along the story: compatibility layer removed, app reactive, forms on signals, measured and faster.
- Further material, questions.

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
5. Block 2: theory follows the four slide decks unchanged; effect and toSignal are demos only (effect exercise optional).
6. No new exercises for now — structure only.
7. Story of the day: remove the app's compatibility layer step by step.
8. (2026-10-07) Strict theory → exercise alternation, never two exercises in a row.
9. (2026-10-07) Block 2: Dirty Check is mandatory but slim (component shipped in the start state); the OnPush exercise is replaced by a one-line step 0 in the signal-CD exercise. The block stays one block; overrun into block 3 is handled on the fly.
10. (2026-10-07) Block 1: theory follows the Nx decks in order (Nx Core → Scalable Workspace Architectures →
   Enforce Module Boundaries), Nx before the Angular build; builds run through the Nx executor (`@nx/angular:application`).
   Module boundaries exercise optional (may be a demo), start state prepared for it.

## Open questions

1. Publish `push-based/ws-datev-codingfestival-081026` on GitHub — public or private?
2. Block 4 needs agent access for every participant (Claude Code / Copilot / Cursor + Chrome) — what does DATEV allow?
3. Block 4 reference solutions for lazy loading / `NgOptimizedImage` assume the signal migration (bonus in block 2) — rewrite them for decorator inputs, or make the migration part of the start state for block 4?
4. ~~All exercises reference the pre-Nx paths~~ — updated with the start state.

## Dropped from the sources

ng-modern (as exercises): signal-effect, signal-toSignal, zone.js optimizations, inject migration, new control flow, defer, SSR (3), manual CD.
perf: CSS, scheduling, event loop, SSR, user flows, ngZone/zone optimizations, network-cancel-requests.
nx: nx init, library splitting (scalable-architecture-design), custom plugins/executors/generators, Nx Cloud hands-on, DTE, atomizer, cache deep dive.
