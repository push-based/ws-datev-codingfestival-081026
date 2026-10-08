# Signal - Migrate Inputs, Outputs & View/Content Queries to Signals

In this exercise we will convert inputs, outputs and queries to signals using automated migration schematics.

## Goal

In order to benefit from the new signals, we can easily migrate some parts of the application to signals using automated migrations.
The migrations only convert what they can migrate safely — some inputs and outputs stay as they are.

Commit your current state first, so you can review the diff afterwards (and undo it with `git checkout -- .`).

The commands below pass `--path=./` (the whole workspace) and `--best-effort-mode=false` (skip everything that could
break the build), so the CLI does not ask for them.

## Migrate Inputs

Migrate all the decorator-based Inputs to input signals.

```bash
npx nx g @angular/core:signal-input-migration --path=./ --best-effort-mode=false
```

> [!TIP]
> Want to know why an input was skipped? Re-run with `--insert-todos`: the migration adds a `// TODO` comment with the
> reason above each skipped input.

## Migrate Outputs

```bash
npx nx g @angular/core:output-migration --path=./
```

## Migrate View Queries & Content Queries

```bash
npx nx g @angular/core:signal-queries-migration --path=./ --best-effort-mode=false
```

## Format

The schematics do not format their output, so lint fails now. Fix it automatically:

```bash
npx nx format:write
npx nx run-many -t lint --fix
```

## That's it! 🎉
