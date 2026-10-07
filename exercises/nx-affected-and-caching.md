# Nx: Affected & Caching

In this exercise you see the two ways Nx avoids work: **affected** only runs tasks for projects a change can
influence, the **cache** never runs the same task twice.

## 0. Clean start

`affected` compares your working tree with `main` (`defaultBase` in `nx.json`). Start without local changes.

<details>
  <summary>Solution</summary>

```bash
git status
```

Changed something in the previous exercise (e.g. the `deploy` bonus)? Commit or stash it:

```bash
git stash
```

</details>

## 1. Change the app

Make a small change in the app, e.g. add a comment to `apps/movies/src/app/app.config.ts`.
Which projects are affected?

```bash
npx nx show projects --affected
npx nx affected -t lint --graph
```

<details>
  <summary>Solution</summary>

Only `movies`. Nothing depends on the app.

```bash
npx nx affected -t lint   # lints 1 project
```

Revert the change (`git checkout apps`).

</details>

## 2. Change a library

Now add a comment to `libs/movies/util-movie-image/src/lib/movie-image.pipe.ts`.
Which projects are affected now — and why?

<details>
  <summary>Solution</summary>

```bash
npx nx show projects --affected
npx nx affected -t lint --graph
```

7 projects: `movies-util-movie-image` and everything that imports it, directly or transitively —
`movies-ui-movie-list`, the feature libraries using the list, and the app.

1. Nx takes the git diff → `libs/movies/util-movie-image/...` changed
2. the file belongs to the project `movies-util-movie-image`
3. the project graph knows who depends on it
4. Nx runs the target for exactly these projects

```bash
npx nx affected -t lint test
```

Try a library further down the graph, e.g. `libs/shared/models` — how many projects are affected now?

</details>

## 3. Cache

Build the app twice.

```bash
npx nx build movies
npx nx build movies
```

<details>
  <summary>Solution</summary>

The second run takes milliseconds:

```
NX   1 task: 1 succeeded, 1 cached
  Cache:             1/1 hit (100%)
```

Nx hashes the task's inputs (source files, config, dependencies, the command). Same hash → it replays the terminal
output and restores the files in `dist/apps/movies` from the cache (`.nx/cache`).

</details>

Now play with the cache:

1. Run `npx nx run-many -t lint test` twice.
2. Change a file in `libs/movies/util-movie-image` and run it again. Which tasks are cache hits?
3. Revert the change and run it again.

<details>
  <summary>Solution</summary>

1. Second run: everything from the cache.
2. 8 tasks run again: `test` of all 7 affected projects, but `lint` only of `movies-util-movie-image`.
   The `inputs` in `nx.json` decide: `test` includes `^production` (the code of the dependencies), `lint` only
   the project's own files and the ESLint config.
3. All cache hits again: the hash is computed from the file contents, so the old results are still in the cache.

> [!TIP]
> `--skip-nx-cache` runs a task without the cache, `npx nx reset` clears it.

</details>

## Discussion

- Which tasks in your projects could be cached? A task is cacheable if the same inputs always produce the same
  outputs — `build`, `lint`, `test` yes; `serve` or `deploy` no.
- What makes a task not cacheable? Network / database access, randomness, missing inputs.
