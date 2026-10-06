# Modern Angular: Signals, Zoneless & AI-Assisted Performance

DATEV Coding Festival — 08.10.2026

## Installation Instructions

**System Requirements**

* `node ^20.19.0 || ^22.12.0 || ^24.0.0`
* `npm > 10`
* Chrome (latest stable)

**Clone and install**

```bash
git clone https://github.com/push-based/ws-datev-codingfestival-081026.git

cd ws-datev-codingfestival-081026
npm install

# (optional) if the step before didn't work, please try the following
npm install --force
```

**Run the application**

```bash
npm run start
```

## Workshop Information

* ws info doc: TBD
* slides: TBD

## Exercises

[0. Project Setup](./exercises/project%20setup.md)

### 2. Current State & Tooling

* [Angular CLI & esbuild: Bundle Analysis](./exercises/bundle-analysis-coverage_bundle-analyzer.md)
* 🚧 [Nx: Initialize Nx in an Angular CLI workspace](./exercises/nx-01-initialize-nx.md)
* 🚧 [Nx: Tasks & Task Pipelines](./exercises/nx-02-task-pipelines.md)
* 🚧 [Nx: Affected & Caching](./exercises/nx-03-affected-and-caching.md)
* 🚧 [Nx Best Practices: Scalable Library Architecture](./exercises/nx-05-scalable-architecture-design.md)
* 🚧 [Nx Best Practices: Module Boundaries](./exercises/nx-06-enforce-module-boundaries.md)

### 3. Modern Architectures & State Management

Signals
* [Signal - Introduction](exercises/signal-introduction.md)
* [Signal - Computed](exercises/signal-computed.md)
* [Signal - Effect](exercises/signal-effect.md)

Signals & Observables
* [Signal - toSignal](exercises/signal-toSignal.md)
* [Signal - resource & injectParams](exercises/signal-resource-injectParams.md)
* [Signal - Automatic Migration](exercises/signal-migration.md)

### 4. Performance

* [Change Detection: Dirty Check](./exercises/change-detection%20-%20Dirty%20Check.md)
* [Change Detection: OnPush](./exercises/change-detection%20-%20OnPush.md)
* [Change Detection: Signals](./exercises/change-detection%20-%20signals.md)
* [Change Detection: Zoneless](./exercises/change-detection%20-%20zoneless.md)

### 5. Forms: Signal Forms

* [Signal Forms](./exercises/signal-forms.md)
* 🚧 Signal Forms: Dynamic Form Fields

### 6. AI-Assisted Performance Engineering

* [Performance Tab & Flame Charts](./exercises/performance-tab-flame-charts.md)
* [Network: Preconnect](./exercises/network-resource-hints-preconnect.md)
* [Network: Preload & Prefetch](./exercises/network-resource-hints-preload-prefetch.md)
* [Network: Lazy Loading Resources](./exercises/network-lazy-loading.md)
* [Network: Prefetch LCP Data](./exercises/network-prefetch-lcp-data.md)
* [Network: Cancel In-Flight Requests](./exercises/network-cancel-requests.md)
* 🚧 [Network: Image Optimization with NgOptimizedImage](./exercises/ng-optimized-images.md)
* 🚧 Chrome DevTools MCP
* 🚧 Performance Engineering Skills
