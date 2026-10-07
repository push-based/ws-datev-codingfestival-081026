# Nx: Enforce Module Boundaries

The architecture of the workspace exists only by convention: folders and names say "scope" and "type", but nothing
stops a wrong import. In this exercise the linter takes over.

The rule `@nx/enforce-module-boundaries` is already active in `eslint.config.mjs` — but it allows everything:

```js
depConstraints: [{ sourceTag: '*', onlyDependOnLibsWithTags: ['*'] }],
```

## 1. Baseline

```bash
npx nx run-many -t lint
```

All green.

## 2. Scope rules

Replace the `*` constraint with rules for the two scopes:

- `scope:movies` may depend on `scope:movies` and `scope:shared`
- `scope:shared` may only depend on `scope:shared`

Run `lint` again. What fails, and why?

<details>
  <summary>Solution</summary>

```js
// eslint.config.mjs

depConstraints: [
  { sourceTag: 'scope:movies', onlyDependOnLibsWithTags: ['scope:movies', 'scope:shared'] },
  { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
],
```

4 errors like:

```
A project tagged with "scope:movies" can only depend on libs tagged with "scope:movies", "scope:shared"
```

All of them are imports of the two libraries **without tags** — a library without tags matches no rule:

- `apps/movies/src/app/app.routes.ts` → `@movies/shared/feature-not-found`
- `movie-detail-page`, `movie-card`, `movie-search-control` → `@movies/movies/util-movie-image`

</details>

## 3. Tag the libraries

Give the two libraries their tags (`project.json`). Lint is green again.

<details>
  <summary>Solution</summary>

```json
// libs/movies/util-movie-image/project.json
"tags": ["scope:movies", "type:util"]

// libs/shared/feature-not-found/project.json
"tags": ["scope:shared", "type:feature"]
```

</details>

## 4. Type rules

Add one rule per type:

| type | may depend on |
|---|---|
| `app` | everything |
| `feature` | `feature`, `data-access`, `ui`, `util` |
| `data-access` | `data-access`, `util` |
| `ui` | `ui`, `util` |
| `util` | `util` |

Run `lint` again — a hidden violation shows up. Where is it, and how would you fix it?

<details>
  <summary>Solution</summary>

```js
// eslint.config.mjs

depConstraints: [
  { sourceTag: 'scope:movies', onlyDependOnLibsWithTags: ['scope:movies', 'scope:shared'] },
  { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
  { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['*'] },
  { sourceTag: 'type:feature', onlyDependOnLibsWithTags: ['type:feature', 'type:data-access', 'type:ui', 'type:util'] },
  { sourceTag: 'type:data-access', onlyDependOnLibsWithTags: ['type:data-access', 'type:util'] },
  { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui', 'type:util'] },
  { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util'] },
],
```

Exactly one error:

```
libs/movies/ui-movie-list/src/lib/movie-search-control/movie-search-control.component.ts
  A project tagged with "type:ui" can only depend on libs tagged with "type:ui", "type:util"
```

`MovieSearchControlComponent` is a UI component, but it injects `MovieService` from `@movies/movies/data-access`
to call `searchMovies()`. A UI component should get its data via inputs and report via outputs.

Fixes to discuss:

- pass the data in: its only user, `feature-my-movies`, runs the search and hands the results to the control
- or the control is not UI at all: move it into `feature-my-movies`

</details>
