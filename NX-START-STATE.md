# Refactoring brief: Nx start state (trainer notes — delete before the workshop)

Goal: turn this Angular CLI app into the **Nx workspace the whole workshop starts from** — already split into
tagged, non-buildable libraries. Attendees never run `nx init` and never move files. Everybody starts from
the same commit on `main`, and every exercise in blocks 1–4 points to the paths defined here.

Context: [PLAN.md](PLAN.md), block 1 (1.3–1.10) and decisions 2, 3, 9, 10.

---

## References

- **dfl repo** — `push-based/ws-nx-dfl-22-05-25` (React version of the same movies workshop, Nx 21):
  - `exercises/scalable-architecture-design.md` — the step-by-step split, incl. the migration order
    (models / utils first → ui / data-access → features) and the "move file, fix imports with regex replace" technique.
  - branch `solutions/libs-arch-enforced` — the target shape: 14 libraries under `libs/movies/*` and `libs/shared/*`,
    all tagged `scope:*` + `type:*`, full `depConstraints` in `.eslintrc.json`.
  - `exercises/nx-workspace-intro.md` — leftover from the **Angular** version of this app (`apps/movies/src/app/...`,
    tilt directive, `movie-image.pipe`, backdrop / side-drawer, `@nx/angular:library --directory=libs/shared`).
    Confirms it is the same app as this repo.
- **summer2025 repo** — `push-based/ws-nx-summer2025`: start state for its exercise 06 = libraries tagged except
  two, rule set to `*` → `*`. We copy that pattern for exercise 1.10.

---

## Must stay unchanged (the workshop depends on it)

The refactoring moves files; it must **not** modernize anything. Every "problem" the exercises fix has to survive:

- `provideZoneChangeDetection()` in `main.ts` (+ `main.server.ts` if kept), `zone.js` in the polyfills
- `changeDetection: ChangeDetectionStrategy.Eager` on all page components (incl. `MovieCardComponent`)
- decorator inputs / outputs, constructor injection, `subscribe`-based state (`MovieListPageComponent`)
- reactive forms + CVA in `MyMovieListComponent` / `MovieSearchControlComponent`
- `TiltDirective` writing a plain field from `fromEvent`
- `MovieSearchPageComponent` with `ActivatedRoute.params.pipe(switchMap(...))`
- performance problems for block 4: no resource hints in `index.html`, eager w780 posters, genres requested from
  the app-shell template, `TrackingService.trackEvent` busy loop
- lazy loading per route (pages in their own chunks)

---

## Target structure

Follows the **Angular** structure from the deck "Nx - Scalable Workspace Architectures" (the result slide of
"Let's play!" and the "Recap | Organizing code with libraries" slides), so the game in 1.8 matches the workspace.
Integrated layout: `apps/movies` + `libs/<scope>/<type>-<name>`. Non-buildable workspace libraries.
Import aliases in `tsconfig.base.json`, e.g. `@movies/shared/ui-design-system` (pick one style and use it everywhere).
The build uses the Nx executor (`@nx/angular:application`) — the Nx default.

| Library | Tags | Content (from `src/app/`) | Deck card |
|---|---|---|---|
| `apps/movies` | `scope:movies`, `type:app` | `app.component`, `app.config(.server)`, `app.routes(.server)`, `movie/movie.routes.ts`, `core/read-access.interceptor.ts`, `main.ts`, `environments/`, `index.html`, `styles.scss`, `assets/`, `data/` | App |
| `libs/movies/feature-app-shell` | `scope:movies`, `type:feature` | `app-shell/` | app-shell |
| `libs/movies/feature-movie-list` | `scope:movies`, `type:feature` | `movie/movie-list-page/` | movie-list page |
| `libs/movies/feature-movie-detail` | `scope:movies`, `type:feature` | `movie/movie-detail-page/` | movie-detail page |
| `libs/movies/feature-movie-search` | `scope:movies`, `type:feature` | `movie/movie-search-page/` | movie-search page |
| `libs/movies/feature-my-movies` | `scope:movies`, `type:feature` | `movie/my-movie-list/` | my-movies |
| `libs/movies/data-access` | `scope:movies`, `type:data-access` | `movie/movie.service.ts`, `movie/movie.store.ts` | movie service |
| `libs/movies/ui-movie-list` | `scope:movies`, `type:ui` | `movie/movie-list/`, `movie/movie-card/`, `movie/movie-search-control/` ← **hidden violation**: injects `MovieService` | movie-list |
| `libs/movies/util-movie-image` | **untagged on purpose** | `movie/movie-image.pipe.ts` | movie-image pipe |
| `libs/shared/models` | `scope:shared`, `type:util` | `shared/model/*`, `movie/movie-model.ts` | models |
| `libs/shared/utils` | `scope:shared`, `type:util` | `shared/tilt.directive.ts`, `shared/cdk/element-visibility/`, `shared/tracking.service.ts`, the new `DirtyCheck` component | utils, tilt directive |
| `libs/shared/util-env` | `scope:shared`, `type:util` | `ENV_TOKEN` / `provideEnvironment` / `injectEnv` as on the deck's "Type: util" slides; `environment.ts` stays in the app and is provided in `app.config.ts` (libs must not import from the app) | — (deck util-env example) |
| `libs/shared/ui-design-system` | `scope:shared`, `type:ui` | `ui/component/*` (backdrop, dark-mode-toggle, detail-grid, hamburger-button, search-bar, side-drawer), `ui/pattern/star-rating`, `ui/token/*` (SCSS) | design-system |
| `libs/shared/feature-not-found` | **untagged on purpose** | `not-found-page/` | not found page |
| `libs/shared/data-access-auth` | `scope:shared`, `type:data-access` | `core/auth.service.ts`, `core/auth.guard.ts` | — (not on the cards; decide placement) |

Check the actual imports while moving — the table is based on the relative imports in `src/app` (2026-10-07).
`movie-search-control` → `MovieService` is the one real `ui → data-access` edge; keep it, it is the finding of exercise 1.10.

Also part of the start state (PLAN decision 9): a `DirtyCheck` component (counts `ngDoCheck` into a signal,
renders the count) in `libs/shared/utils` — **not** placed in any template yet.

---

## Steps

1. **Branch & baseline.** Branch from `main`. Record `ng build` output (chunk names and sizes) for comparison.
2. **Nx workspace.** `npx nx@latest init --integrated` (moves the app to `apps/movies`, writes `nx.json`, `project.json`,
   rewrites the npm scripts, removes `angular.json`). Check that Nx picks the version matching Angular 22.0.x.
   App project name: `movies`. Build / serve run through the Nx executors (`@nx/angular:application`,
   `@nx/angular:dev-server`) — keep them, they are what the "Executors" slides show.
3. **Plugins.** `nx add @nx/angular`, `@nx/eslint`, and a test runner (Vitest via `@nx/vite` / the Angular Vitest
   setup — check which one the Nx Angular library generator supports for Angular 22).
4. **Create the libraries** with `nx g @nx/angular:library --directory=libs/<scope>/<name> --buildable=false
   --tags=...`, delete the generated default component. Order (dfl migration strategy):
   1. models, util-env, utils
   2. ui-design-system (incl. SCSS tokens), data-access-auth, movies/data-access, util-movie-image
   3. ui-movie-list
   4. feature libraries (incl. feature-app-shell), feature-not-found
5. **Move & fix imports** per library: `git mv` the files, export from `src/index.ts`, replace relative imports with
   the alias (regex replace as in the dfl exercise). Build after each library.
6. **SCSS.** Component styles use relative `@use "../../token/mixins/flex"`. Move `ui/token/` into `libs/shared/ui-design-system`
   and resolve it via `stylePreprocessorOptions.includePaths` (or a package-style path) so libraries in other folders
   still find it.
7. **Routes.** `movie.routes.ts` / `app.routes.ts` lazy-load from the feature libraries:
   `loadComponent: () => import('@movies/movies/feature-movie-list').then((m) => m.MovieListPageComponent)`.
   Feature libraries must only be imported dynamically, otherwise they end up in `main`.
8. **Lint.** Flat config (`eslint.config.mjs`, ESLint 10) with `@nx/eslint-plugin` — this also fixes today's broken
   `ng lint`. `@nx/enforce-module-boundaries` severity `error` with the allow-all constraint:
   ```js
   depConstraints: [{ sourceTag: '*', onlyDependOnLibsWithTags: ['*'] }]
   ```
   `nx run-many -t lint` must be green.
9. **Tests.** Every library has an inferred `test` target that passes. Add a few small real specs (e.g. star-rating,
   `movie-image.pipe`, a model util) so `test` tasks do actual work in exercises 1.5 / 1.7; elsewhere `passWithNoTests`.
10. **Nx config.** `cache: true` for `build`, `lint`, `test`; `defaultBase: main`. No Nx Cloud connection.
11. **`deploy` target + Docker image** — copy from dfl: `apps/movies/project.json` `deploy` target
    (`docker build -f tools/deploy/frontend.Dockerfile --build-arg='APP_NAME=movies' . -t <image>:dev`) and
    `tools/deploy/frontend.Dockerfile` + `nginx.conf` (nginx serving `dist/apps/$APP_NAME`). **No** `dependsOn` —
    the bonus of exercise 1.5 adds it. Adjust the `COPY` path: Angular's application builder writes to
    `dist/apps/movies/browser`. Image tag: pick one for this workshop (dfl uses `ghcr.io/push-based/react-movies-app`).
    Not cacheable.
12. **Repo fixes along the way** (PLAN "Repo issues"): missing quote in `index.html:12`; remove the old jest config
    from `package.json`; decide on the SSR leftovers (`main.server.ts`, `server.ts`, `app.config.server.ts`,
    `serve:ssr` — not wired up today; removing them simplifies the zoneless exercise).
13. **Docs.** README: install + `npx nx serve movies`. Update every exercise to the new paths (all of `exercises/`
    reference `src/app/...` or bare file names) and to Nx commands (`nx build movies --stats-json`, polyfills in
    `apps/movies/project.json` instead of `angular.json`). Remove `nx-01`–`nx-03`.

---

## Done when

- [x] `npx nx serve movies` — app works: list, detail, search, login, my movies, tilt, dark mode
- [x] `npx nx run-many -t lint test build` — green; second run fully from cache
- [x] `npx nx graph` shows the 14 libraries + app with the edges from the table
- [x] adding the scope / type constraints (template: dfl `solutions/libs-arch-enforced` `.eslintrc.json` — it
      uses `type:utils`, we use `type:util`; add `type:app` → `*`) produces exactly: errors for the 2 untagged
      libraries, and after tagging them, the `movies/ui-movie-list` → `movies/data-access` violation. Keep this solution
      config for exercise 1.10.
- [x] build output: pages still in lazy chunks; initial chunk size comparable to the baseline from step 1
- [x] compat layer intact: `grep -rn "provideZoneChangeDetection\|ChangeDetectionStrategy.Eager" apps libs`
- [x] `DirtyCheck` component exists and is exported, not used yet
- [ ] `rm -rf dist && npx nx run movies:deploy` fails (no `dist`); after `npx nx build movies` it builds the image
- [x] every exercise in `exercises/` points to existing paths

---

## Outcome (2026-10-07)

Deviations from the steps above, and decisions taken:

- **Angular 22.0.1 → 22.2.x.** `@nx/angular` 23.3 does not install against the 22.0.1 lockfile (npm resolves its
  optional peers to 22.2 and fails with ERESOLVE). Bumped all Angular packages within `^22`, lockfile regenerated.
- **Nx 23.3.0**, project names `<scope>-<name>` (e.g. `movies-feature-movie-list`), import paths `@movies/<scope>/<name>`.
- **Executors:** build `@nx/angular:application`; serve `@angular/build:dev-server` — `@nx/angular:dev-server` requires
  the webpack-based `@angular-devkit/build-angular`, which we do not want to install for a slide.
- **Inferred targets:** `lint` (`@nx/eslint/plugin`) and `test` (`@nx/vitest`, `testMode: run`) for every project.
  Libraries have no `build` target (non-buildable).
- **Tests:** Vitest via Analog (`vitest-analog`; Nx' `vitest-angular` requires buildable libraries). Nx pins Analog 2.6,
  which crashes with TypeScript 6 (`cache.has is not a function`) → Analog 2.8. Every project has
  specs: real ones for star-rating, movie-image pipe, `DirtyCheckComponent`, `MovieService`, `AuthService`, `injectEnv`,
  a type check for the models, "creates" stubs for the components. The app has its own Vitest setup
  (`apps/movies/vite.config.mts`) so `nx test movies` is inferred — exercise 1.5 builds on it.
- **Lint:** flat config; rules that flag the intentionally old code (`prefer-inject`, `prefer-on-push-…`, …) are off.
  No selector prefix rules (the old `ui-` rule of `shared-ui-design-system` was dropped).
- **SCSS:** tokens stay in `libs/shared/ui-design-system/src/lib/token`; the app resolves them via
  `stylePreprocessorOptions.includePaths` → `@use 'token/mixins/flex'`.
- **util-env:** `Environment`, `ENV_TOKEN`, `provideEnvironment()`, `injectEnv()`; `MovieService` uses `injectEnv()`,
  `app.config.ts` provides `environment.ts`. `ReadAccessInterceptor` stays in the app and imports `environment` directly.
- **data-access-auth:** `libs/shared/data-access-auth` (`AuthService`, `AuthGuard`).
- **SSR removed** (`main.server.ts`, `server.ts`, `app.*.server.ts`, `@angular/ssr`, `express`, …).
- **Build:** initial total 442 kB (baseline 436 kB): Angular 22.2 splits `main` (239 kB) + one shared initial chunk
  (160 kB). Lazy chunks are now named `index` (one per feature library barrel).
- **`deploy`:** image `ghcr.io/push-based/angular-movies-app:dev`, no `dependsOn`, not cached.

### Exercise 1.10 — verified solution config

Replace the `*` constraint in `eslint.config.mjs`:

```js
depConstraints: [
  { sourceTag: 'scope:movies', onlyDependOnLibsWithTags: ['scope:movies', 'scope:shared'] },
  { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
  // step 4: type rules
  { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['*'] },
  { sourceTag: 'type:feature', onlyDependOnLibsWithTags: ['type:feature', 'type:data-access', 'type:ui', 'type:util'] },
  { sourceTag: 'type:data-access', onlyDependOnLibsWithTags: ['type:data-access', 'type:util'] },
  { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui', 'type:util'] },
  { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util'] },
],
```

- scope rules only → 4 errors, all imports of the untagged libs (`app.routes.ts` → feature-not-found;
  movie-detail-page, movie-card, movie-search-control → util-movie-image)
- tag them (`movies-util-movie-image`: `scope:movies`, `type:util`; `shared-feature-not-found`: `scope:shared`,
  `type:feature`) → green
- add the type rules → exactly one error: `movie-search-control.component.ts` → `@movies/movies/data-access`
