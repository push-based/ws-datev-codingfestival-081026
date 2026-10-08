# Modern Angular: Signals, Zoneless & AI-Assisted Performance

DATEV Coding Festival — 08.10.2026

## Installation Instructions

**System Requirements**

- `node ^22.22.3 || ^24.15.0 || >=26`
- `npm >= 10`
- Chrome (latest stable)

**Clone and install**

```bash
git clone https://github.com/push-based/ws-datev-codingfestival-081026.git

cd ws-datev-codingfestival-081026
npm install
```

**Run the application**

```bash
npx nx serve movies
```

**Workspace**

An [Nx](https://nx.dev) workspace: the app lives in `apps/movies`, the code is split into libraries under
`libs/<scope>/<name>` (scopes `movies` and `shared`), imported via `@movies/<scope>/<name>`.

```bash
npx nx graph                       # project graph
```

## Workshop Information

- ws info doc: TBD
- slides: TBD

## Exercises

[0. Project Setup](./exercises/project%20setup.md)

### Block 1: Current State & Tooling

- [Nx: Task Pipelines](./exercises/nx-task-pipelines.md)
- [Nx: Affected & Caching](./exercises/nx-affected-and-caching.md)
- [Nx: Enforce Module Boundaries](./exercises/nx-enforce-module-boundaries.md)
- [Angular CLI & esbuild: Bundle Analysis](./exercises/bundle-analysis-coverage_bundle-analyzer.md)

### Block 2: Signals & Signal Change Detection

Signals

- [Signal - Introduction](exercises/signal-introduction.md)
- [Signal - Computed](exercises/signal-computed.md)

Signals & Observables

- [Signal - resource & injectParams](exercises/signal-resource-injectParams.md)

Signal Change Detection

- [Change Detection: Dirty Check](./exercises/change-detection%20-%20Dirty%20Check.md)
- [Change Detection: Signals](./exercises/change-detection%20-%20signals.md)
- [Change Detection: Zoneless](./exercises/change-detection%20-%20zoneless.md)

Bonus

- [Signal - Automatic Migration](exercises/signal-migration.md)
- [Change Detection: OnPush](./exercises/change-detection%20-%20OnPush.md)

### Block 3: Signal Forms

We build **My Movies (Signal Forms)** (`/my-movies-v2`, in the side menu) from an empty shell in its own feature
library, `libs/movies/feature-my-movies-v2`. The Reactive Forms version (`/my-movies`) stays as it is, for comparison.

- [Signal Forms 1: A first signal form](./exercises/signal-forms-01-first-form.md)
- [Signal Forms 2: Simple validation](./exercises/signal-forms-02-validation.md)
- [Signal Forms 3: A real submit](./exercises/signal-forms-03-submit.md)
- [Signal Forms 4: Dynamic forms](./exercises/signal-forms-04-dynamic-list.md)
- [Signal Forms 5: A custom form field](./exercises/signal-forms-05-custom-control.md)
- [Signal Forms 6: Custom validation & dynamic fields](./exercises/signal-forms-06-form-logic.md)

### Block 4: AI-Assisted Performance Engineering

- [Performance Tab & Flame Charts](./exercises/performance-tab-flame-charts.md)
- [AI: Chrome DevTools MCP](./exercises/ai-devtools-mcp.md)
- [AI: Performance Skills](./exercises/ai-performance-skills.md)

Optional: Network & Images

- [Network: Preconnect](./exercises/network-resource-hints-preconnect.md)
- [Network: Preload & Prefetch](./exercises/network-resource-hints-preload-prefetch.md)
- [Network: Lazy Loading Resources](./exercises/network-lazy-loading.md)
- [Network: Prefetch Data](./exercises/network-prefetch-lcp-data.md)
- [Images: NgOptimizedImage](./exercises/ng-optimized-images.md)
