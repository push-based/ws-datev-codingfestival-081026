# Signal Introduction

In this exercise we start to introduce signals into our codebase.  
We will replace basic functionality and ensure the signal setup is rendering our app correctly.

## Goal

Refactor `AppShellComponent` and introduce signals to the menu logic.

## `sideDrawerOpen` as signal

Go to `AppShellComponent` (`libs/movies/feature-app-shell/src/lib/app-shell/app-shell.component.ts`) and replace the `sideDrawerOpen` variable with a signal and update all usages.

<details>
  <summary>AppShellComponent</summary>

```ts
// libs/movies/feature-app-shell/src/lib/app-shell/app-shell.component.ts

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

sideDrawerOpen = signal(false);
```

Update the code in the `toggleSideDrawer` method to use the `update` method to toggle the value.
```ts
toggleSideDrawer() {
  this.sideDrawerOpen.update((v) => !v);
}
```

</details>

Also apply changes to the template.

<details>
  <summary>AppShellComponent Template</summary>

```html
<!-- libs/movies/feature-app-shell/src/lib/app-shell/app-shell.component.html -->

<!-- signal usage, retrieve the value and use the set method -->
<ui-side-drawer
  [opened]="sideDrawerOpen()"
  (openedChange)="sideDrawerOpen.set($event)"
>
```

</details>

Make the browser window narrow (< 1298px, above that the drawer is always open) and test that the side drawer opens
and closes on click.

## `searchValue` as signal

Go to `AppShellComponent` and replace the `_searchValue` variable with a signal.
Rename the variable `_searchValue` to `searchValue`, turn the `set searchValue(...)` setter into a normal method `setSearchValue(value: string)` (no `set` keyword), and remove the getter.

<details>
  <summary>AppShellComponent</summary>

```ts
// libs/movies/feature-app-shell/src/lib/app-shell/app-shell.component.ts

searchValue = signal('');

setSearchValue(value: string) {
  this.searchValue.set(value);
  this.router.navigate(['search', value]);
}

// 👇 Remove getter
get searchValue() {
  //...
}
```

</details>

Also apply changes to the template. Adapt `ui-search-bar` to use signals. Keep in mind that we have a method named `setSearchValue`.

<details>
  <summary>AppShellComponent Template</summary>

```html
<!-- libs/movies/feature-app-shell/src/lib/app-shell/app-shell.component.html -->

<!-- signal usage in ui-search-bar-->
<ui-search-bar
  (ngModelChange)="setSearchValue($event)"
  [ngModel]="searchValue()"
></ui-search-bar>
```

</details>
Test the search: it navigates to `/search/<your query>`.
