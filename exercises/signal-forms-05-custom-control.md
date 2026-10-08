# Signal Forms 5 - A custom form field

`app-movie-search-control` still implements `ControlValueAccessor`: a provider, four methods, callbacks to store,
a `@ViewChild` and a cache for the value that arrives before the view exists.

Signal forms have their own contract for custom controls, and it is built on signals: `FormValueControl`.

## Goal

At the end of this exercise `MovieSearchControlComponent` implements `FormValueControl` instead of
`ControlValueAccessor`. It reports when it was touched, shows its own error state and can be focused by the form.
The parent template doesn't change at all.

> The relevant files are:
> - `libs/movies/ui-movie-list/src/lib/movie-search-control/movie-search-control.component.ts`

## The contract

`[formField]` and your component talk through signals:

* `value = model<T>()` is the **only required** member. `[formField]` keeps it in sync with the field in both
  directions: set it to report a change, read it to know the current value.
* **optional inputs** receive field state from `[formField]`: `touched`, `invalid`, `errors`, `disabled`,
  `readonly`, `required`, `minLength`, ... Declare only the ones you need.
* an **optional output** `touch` tells the field that the user left the control.
* an **optional method** `focus()` is called by `focusBoundControl()`.

## 1. Implement `FormValueControl`

Remove everything `ControlValueAccessor`:

* the `NG_VALUE_ACCESSOR` provider
* `writeValue`, `registerOnChange`, `registerOnTouched`, `setDisabledState`
* `onChange`, `onTouched` and the `movieCache`, and the `(blur)="onTouched()"` binding in the template
* `ngAfterViewInit` and the `@ViewChild` (step 5 brings a signal-based one back)

Implement `FormValueControl<TMDBMovieModel | null>` from `@angular/forms/signals` and add the required `value`
model. In `selectMovie()`, setting the value **is** the change notification.

While you are at it, use `TMDBMovieModel` instead of `MovieModel` and `inject()` the service.

<details>
  <summary>FormValueControl with value</summary>

```ts
// libs/movies/ui-movie-list/src/lib/movie-search-control/movie-search-control.component.ts

import { model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { TMDBMovieModel } from '@movies/shared/models';

export class MovieSearchControlComponent
  implements FormValueControl<TMDBMovieModel | null>
{
  private movieService = inject(MovieService);

  // the only required part of the contract: the value, kept in sync by [formField]
  readonly value = model<TMDBMovieModel | null>(null);

  selectMovie(movie: TMDBMovieModel) {
    this.value.set(movie);
    this.searchTerm$.next('');
  }
}
```

```html
<!-- the input in the inline template, without the (blur) binding -->
<input #searchInput (input)="searchTerm$.next(searchInput.value)" />
```

</details>

## 2. Show the selected movie

With `ControlValueAccessor` we wrote the title into the input by hand, in three places: on selection, in
`writeValue` and in `ngAfterViewInit`.

Now the value is a signal. Bind the input's `[value]` to the title of the selected movie, or `''` when there is none.
That covers a selection, a reset and an initial value.

<details>
  <summary>[value] binding</summary>

```html
<input
  #searchInput
  [value]="value()?.title ?? ''"
  (input)="searchTerm$.next(searchInput.value)"
/>
```

</details>

Serve the application. Select a movie and save: the input is cleared after the save. Click **Reset** after a
selection: cleared as well.

## 3. Report `touched`

Leave the search input empty and click somewhere else: no error shows up. The field is never `touched`, because
nobody tells it.

Add a `touch` **output** and emit it on `(blur)` of the input. `[formField]` listens to it and marks the field as
touched.

<details>
  <summary>touch output</summary>

```ts
import { output } from '@angular/core';

// optional: tell the field that the user left the control
readonly touch = output<void>();
```

```html
<input
  #searchInput
  [value]="value()?.title ?? ''"
  (input)="searchTerm$.next(searchInput.value)"
  (blur)="touch.emit()"
/>
```

</details>

## 4. Receive field state

The red border from exercise 2 doesn't reach our input: the `ng-*` classes end up on the `app-movie-search-control`
host, and the styles only target `input` and `textarea`.

The control can ask for the field state it needs. Add three **inputs**: `touched`, `invalid` and `disabled`, all
`input(false)`. You don't bind them in the parent template: `[formField]` does it for you.

Use them on the inner input:

* `[class.invalid]` when it is touched and invalid, and a style for `input.invalid` in the component's `styles`
* `[disabled]` when the field is disabled

<details>
  <summary>State inputs</summary>

```ts
import { input } from '@angular/core';

// optional: state that [formField] passes in
readonly touched = input(false);
readonly invalid = input(false);
readonly disabled = input(false);
```

```html
<input
  #searchInput
  [value]="value()?.title ?? ''"
  [disabled]="disabled()"
  [class.invalid]="touched() && invalid()"
  (input)="searchTerm$.next(searchInput.value)"
  (blur)="touch.emit()"
/>
```

```css
/* in styles, next to the other input styles */
input.invalid {
  border-color: var(--palette-secondary-main);
}
```

</details>

> `touched` used to be a `model()` in earlier versions of Signal Forms. Since Angular 22 it is an `input()`, and the
> control reports a touch with the `touch` output.

## 5. Make it focusable

Remember the end of exercise 3? `focusBoundControl()` couldn't focus the search, because the form only knows the
`app-movie-search-control` host element.

Implement a `focus(options?: FocusOptions)` method that focuses the inner input. Read it with a `viewChild`.

<details>
  <summary>focus()</summary>

```ts
import { ElementRef, viewChild } from '@angular/core';

private readonly searchInput =
  viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

// optional: lets focusBoundControl() focus the inner input
focus(options?: FocusOptions) {
  this.searchInput().nativeElement.focus(options);
}
```

</details>

Serve the application and click **Save** on the empty form: the search input gets the focus and a red border.

## 6. The old page still works

`app-movie-search-control` lives in the shared `@movies/movies/ui-movie-list` library: the old **My Movies** page
uses it too, with `formControlName` in a Reactive Forms `FormGroup`. Open it: search, select, save and reset still
work.

Since Angular 22, a `FormValueControl` also works with Reactive Forms (`formControlName`, `[formControl]`) and with
`ngModel`. You can convert a shared control without breaking the forms that still use it. Just never implement
`ControlValueAccessor` and `FormValueControl` on the same component.

Well done, your custom control is a real signal forms control 🎉

---

## Full implementation

<details>
  <summary>Show the full solution</summary>

### `libs/movies/ui-movie-list/src/lib/movie-search-control/movie-search-control.component.ts`

```ts
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MovieService } from '@movies/movies/data-access';
import { MovieImagePipe } from '@movies/movies/util-movie-image';
import { TMDBMovieModel } from '@movies/shared/models';
import { of, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-movie-search-control',
  template: `
    <input
      #searchInput
      [value]="value()?.title ?? ''"
      [disabled]="disabled()"
      [class.invalid]="touched() && invalid()"
      (input)="searchTerm$.next(searchInput.value)"
      (blur)="touch.emit()"
    />
    @if (movies$ | async; as movies) {
      <div class="results">
        @for (movie of movies; track movie) {
          <button
            type="button"
            class="movie-result"
            (click)="selectMovie(movie)"
          >
            <img
              [src]="movie.poster_path | movieImage"
              width="35"
              [alt]="movie.title"
            />
            <span>{{ movie.title }}</span>
          </button>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    input {
      width: 100%;
      padding: 1rem 1.2rem;
      font: inherit;
      font-size: var(--text-md);
      color: var(--palette-text-primary);
      background: var(--palette-background-default);
      border: 1px solid var(--palette-divider);
      border-radius: 0.8rem;
      outline: none;
      transition:
        border-color 150ms ease,
        box-shadow 150ms ease;
    }

    input:hover {
      border-color: var(--palette-action-active);
    }

    input:focus {
      border-color: var(--palette-primary-main);
      box-shadow: 0 0 0 0.3rem rgba(var(--palette-primary-main-rgb), 0.25);
    }

    input.invalid {
      border-color: var(--palette-secondary-main);
    }

    .results {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      max-height: 350px;
      margin-top: 0.6rem;
      padding: 0.6rem;
      overflow: auto;
      background: var(--palette-background-paper);
      border: 1px solid var(--palette-divider);
      border-radius: 0.8rem;
      box-shadow: var(--theme-shadow-dropdown);
    }

    .movie-result {
      display: flex;
      align-items: center;
      gap: 1.2rem;
      padding: 0.6rem 0.8rem;
      font: inherit;
      font-size: var(--text-md);
      text-align: left;
      color: var(--palette-text-primary);
      background: transparent;
      border: none;
      border-radius: 0.6rem;
      cursor: pointer;
    }

    .movie-result:hover,
    .movie-result:focus-visible {
      background: var(--palette-action-hover);
      outline: none;
    }

    .movie-result img {
      flex: none;
      border-radius: 0.4rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AsyncPipe, MovieImagePipe],
})
export class MovieSearchControlComponent
  implements FormValueControl<TMDBMovieModel | null>
{
  private movieService = inject(MovieService);

  // the only required part of the contract: the value, kept in sync by [formField]
  readonly value = model<TMDBMovieModel | null>(null);

  // optional: state that [formField] passes in
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly disabled = input(false);

  // optional: tell the field that the user left the control
  readonly touch = output<void>();

  private readonly searchInput =
    viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  readonly searchTerm$ = new Subject<string>();

  movies$ = this.searchTerm$.pipe(
    switchMap((term) =>
      term ? this.movieService.searchMovies(term) : of(null),
    ),
  );

  selectMovie(movie: TMDBMovieModel) {
    this.value.set(movie);
    this.searchTerm$.next('');
  }

  // optional: lets focusBoundControl() focus the inner input
  focus(options?: FocusOptions) {
    this.searchInput().nativeElement.focus(options);
  }
}
```

</details>
