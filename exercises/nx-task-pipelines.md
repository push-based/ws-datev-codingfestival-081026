# Nx: Task Pipelines

In this exercise you get a feel for Nx: run tasks, look at the targets of a project and read the task graph.
No config changes needed (only in the bonus).

## 1. Where are tasks defined?

Open `apps/movies/project.json`. Which targets does the `movies` app have?

<details>
  <summary>Solution</summary>

Three targets under `"targets"`:

- `build` — executor `@nx/angular:application`, with `options` and `configurations` (`production`, `development`)
- `serve` — executor `@angular/build:dev-server`
- `deploy` — a plain shell `command` (builds a Docker image)

</details>

## 2. Run tasks

Build the app — try both syntaxes.

```bash
npx nx build movies
npx nx run movies:build
```

Now run the tests of the app:

```bash
npx nx test movies
```

It works. But there is no `test` target in `project.json` — where does it come from?

## 3. Inferred tasks

Open the project details of the app.

```bash
npx nx show project movies --web
```

Which targets do you see, and where do they come from?

<details>
  <summary>Solution</summary>

5 targets: `build`, `serve`, `deploy` from `project.json` — plus `lint` and `test`, **inferred** by plugins
registered in `nx.json`:

- `@nx/eslint/plugin` finds `apps/movies/eslint.config.mjs` → `lint` (runs `eslint .`)
- `@nx/vitest` finds `apps/movies/vite.config.mts` → `test` (runs `vitest run`)

Each target shows its source (the file it was inferred from) and the full resolved configuration, incl. the
`targetDefaults` from `nx.json` (`cache`, `inputs`).

Do the same for a library, e.g. `npx nx show project shared-ui-design-system --web`: only `lint` and `test`, both
inferred — the library's `project.json` has no `targets` at all. There is no `build` target either: it is a
non-buildable workspace library, the app builds its code.

> [!TIP]
> All project names: `npx nx show projects`

</details>

## 4. Run many tasks

Run `lint` and `test` for all projects with one command.

<details>
  <summary>Solution</summary>

```bash
npx nx run-many -t lint test
```

Nx runs the tasks in parallel. Limit it to some projects with `-p`:

```bash
npx nx run-many -t lint test -p shared-ui-design-system movies-util-movie-image
```

</details>

## 5. Task graph

Look at the task graph of the build and of `lint` for all projects.

```bash
npx nx build movies --graph
npx nx run-many -t lint --graph
```

<details>
  <summary>What you see</summary>

- `movies:build` is a single task: `build` has `dependsOn: ["^build"]` (`targetDefaults` in `nx.json`), but none of
  the libraries has a `build` target — there is nothing to run first.
- `lint` tasks have no dependencies at all — that is why Nx can run them all in parallel.

Compare with the project graph: `npx nx graph`.

</details>

## Bonus: task dependencies

`apps/movies/project.json` has a `deploy` target: it builds a Docker image from `dist/apps/movies/browser`.

> [!IMPORTANT]
> `deploy` requires a running **Docker** (`docker info` must work).
>
> No Docker? Replace the `deploy` command with one that also needs the build output:
>
> ```json
> "deploy": {
>   "command": "ls dist/apps/movies/browser && echo 'deployed 🚀'"
> }
> ```
>

```bash
rm -rf dist
npx nx run movies:deploy
```

It fails — there is nothing in `dist`. Make `deploy` run `build` first.

<details>
  <summary>Solution</summary>

```diff
// apps/movies/project.json

"deploy": {
+  "dependsOn": ["build"],
  "command": "docker build -f tools/deploy/frontend.Dockerfile --build-arg=APP_NAME=movies . -t ghcr.io/push-based/angular-movies-app:dev"
}
```

`"build"` (without `^`) means: the `build` task of the **same** project.

```bash
npx nx run movies:deploy          # runs movies:build first
npx nx run movies:deploy --graph  # deploy → build
```

Run it twice: `build` comes from the cache, `deploy` runs again — it has no `cache: true`.

</details>

Want more? Let `deploy` also depend on `lint` and `test`, and validate it in the task graph.

<details>
  <summary>Solution</summary>

```json
"dependsOn": ["build", "lint", "test"]
```

Inferred targets can be used in `dependsOn` like configured ones. Want the libraries' tests too? `"^test"` adds the
`test` tasks of the projects `movies` imports directly.
Check with `npx nx run movies:deploy --graph`.

</details>
