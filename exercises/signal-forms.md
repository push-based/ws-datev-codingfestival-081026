# Signal Forms

In this exercise we will migrate the `MyMovieListComponent` from **Reactive Forms** to the new **Signal Forms** API (`@angular/forms/signals`).

Signal Forms flip the model around: instead of building a `FormGroup`/`FormArray` tree as a *second* source of truth, you start from a plain `signal` model and wrap it in `form()`. Validation lives in a colocated, type-safe schema, every field is a path you bind with `[formField]`, and reactivity is just signals — no `valueChanges` subscriptions.

## Goal

Migrate `MyMovieListComponent` (and its custom `MovieSearchControlComponent`) to Signal Forms:

- The "add a movie" form → one `signal` model + a `form()` schema.
- The favorites list (`FormArray`) → an array `signal` validated with `applyEach`.
- The custom `app-movie-search-control` → a `FormValueControl` instead of a `ControlValueAccessor`.
- Persisting favorites → an `effect()` instead of a `valueChanges` subscription.

> The relevant files are:
> - `libs/movies/feature-my-movies/src/lib/my-movie-list/my-movie-list.component.ts`
> - `libs/movies/feature-my-movies/src/lib/my-movie-list/my-movie-list.component.html`
> - `libs/movies/ui-movie-list/src/lib/movie-search-control/movie-search-control.component.ts`

## Where we start

The current component uses three reactive structures:

```ts
// the "add a movie" form
myMovieForm = new FormGroup({
  movie: new FormControl(null, [Validators.required, /* unique validator */]),
  comment: new FormControl('', [Validators.required, Validators.minLength(5)]),
});

// the favorites list
favorites = new FormArray(/* one FormGroup per favorite */);
favoritesForm = new UntypedFormGroup({ favorites: this.favorites });

// persistence
ngOnInit() {
  this.favorites.valueChanges
    .pipe(filter(() => this.favorites.valid))
    .subscribe(() => this.movieService.setFavorites(this.favorites.value));
}
```

Let's migrate it piece by piece.

## Step 1 — The "add a movie" form becomes a signal model + schema

A Signal Form is just a `signal` model wrapped in `form()`. Validators are functions you attach to a `path` inside the schema.

Replace the `myMovieForm` `FormGroup` with an `addModel` signal and an `addForm`.

<details>
  <summary>addModel + addForm</summary>

```ts
// libs/movies/feature-my-movies/src/lib/my-movie-list/my-movie-list.component.ts
import { signal } from '@angular/core';
import {
  form,
  required,
  minLength,
  validate,
} from '@angular/forms/signals';

import { TMDBMovieModel } from '../../shared/model/movie.model';

// 👇 the model is the single source of truth — no FormControl wrappers
addModel = signal<{ movie: TMDBMovieModel | null; comment: string }>({
  movie: null,
  comment: '',
});

addForm = form(this.addModel, (path) => {
  required(path.movie, { message: 'Entering a title is required' });

  // the old "unique" validator: reject a movie already in favorites
  validate(path.movie, ({ value }) => {
    const movie = value();
    return movie && this.favorites().some((fav) => fav.id === movie.id)
      ? { kind: 'unique', message: 'You already added that movie, edit it instead' }
      : null;
  });

  required(path.comment, { message: 'Entering a comment is required' });
  minLength(path.comment, 5, { message: 'Please enter at least 5 characters' });
});
```

Notes:
- `path.movie` / `path.comment` mirror the shape of your model — fully typed.
- A custom validator returns `null` (valid) or `{ kind, message }`. That replaces the inline `unique` `FormControl` validator.
- `validate` can read other signals (`this.favorites()`), so cross-cutting rules stay reactive automatically.
- We'll add the submit behaviour to `addForm` via its options (the **third** `form()` argument) in Step 5.

</details>

## Step 2 — Migrate the custom control to `FormValueControl`

`app-movie-search-control` is a `ControlValueAccessor` today. In Signal Forms a custom control just implements `FormValueControl<T>` and exposes a `value` (and optionally `touched`) `model()`. The same `[formField]` then wires value, validation, touched and errors for free.

<details>
  <summary>MovieSearchControlComponent → FormValueControl</summary>

```diff
// libs/movies/ui-movie-list/src/lib/movie-search-control/movie-search-control.component.ts

-import { AfterViewInit, Component, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
-import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
+import { Component, ElementRef, effect, inject, model, viewChild, ChangeDetectionStrategy } from '@angular/core';
+import { FormValueControl } from '@angular/forms/signals';

+import { TMDBMovieModel } from '../../shared/model/movie.model';

 @Component({
   selector: 'app-movie-search-control',
   template: `
     <input
       #searchInput
-      (blur)="onTouched()"
+      (blur)="touched.set(true)"
       (input)="searchTerm$.next(searchInput.value)"
     />
     @if (movies$ | async; as movies) {
       <div class="results">
         @for (movie of movies; track movie) {
-          <button class="movie-result" (click)="selectMovie(movie)">
+          <button class="movie-result" type="button" (click)="selectMovie(movie)">
             <img [src]="movie.poster_path | movieImage" width="35" [alt]="movie.title" />
             <span>{{ movie.title }}</span>
           </button>
         }
       </div>
     }
   `,
-  providers: [
-    { provide: NG_VALUE_ACCESSOR, useExisting: MovieSearchControlComponent, multi: true },
-  ],
   /* styles unchanged */
   changeDetection: ChangeDetectionStrategy.Eager,
   imports: [AsyncPipe, MovieImagePipe],
 })
-export class MovieSearchControlComponent implements ControlValueAccessor, AfterViewInit {
-  constructor(private movieService: MovieService) {}
-
-  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
+export class MovieSearchControlComponent implements FormValueControl<TMDBMovieModel | null> {
+  private movieService = inject(MovieService);
+
+  // 👇 the FormValueControl contract: a value model (+ touched)
+  readonly value = model<TMDBMovieModel | null>(null);
+  readonly touched = model(false);
+
+  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

   readonly searchTerm$ = new Subject<string>();

   movies$ = this.searchTerm$.pipe(
     switchMap((term) => (term ? this.movieService.searchMovies(term) : of(null))),
   );

-  onChange = (movie: MovieModel) => {};
-  onTouched = () => {};
-
-  private movieCache!: MovieModel;
-
-  ngAfterViewInit(): void {
-    if (this.movieCache) {
-      this.searchInput.nativeElement.value = this.movieCache.title;
-    }
-  }
+  constructor() {
+    // keep the input text in sync with the field value (selection, reset, programmatic set)
+    effect(() => {
+      const movie = this.value();
+      const input = this.searchInput()?.nativeElement;
+      if (input) {
+        input.value = movie ? movie.title : '';
+      }
+    });
+  }

-  selectMovie(movie: MovieModel) {
-    this.onChange(movie);
-    this.searchTerm$.next('');
-    this.searchInput.nativeElement.value = movie.title;
-  }
-
-  writeValue(movie: MovieModel): void { /* ... */ }
-  registerOnChange(fn: any): void { this.onChange = fn; }
-  registerOnTouched(fn: any): void { this.onTouched = fn; }
-  setDisabledState(isDisabled: boolean): void {}
+  selectMovie(movie: TMDBMovieModel) {
+    this.value.set(movie);
+    this.touched.set(true);
+    this.searchTerm$.next('');
+  }
 }
```

What changed:
- `writeValue` / `registerOnChange` / `registerOnTouched` / `NG_VALUE_ACCESSOR` all disappear.
- Setting `value` *is* the "emit a change". Setting `touched` *is* `onTouched()`.
- The `effect` reflects the value back into the input text box (e.g. after a reset), replacing `writeValue` + `ngAfterViewInit`.

> We intentionally keep the internal search (`searchTerm$` + `async` pipe) as-is — this exercise is about the form wiring, not the search itself.

</details>

## Step 3 — The favorites `FormArray` becomes an array signal

A `FormArray` of `FormGroup`s becomes a `signal` holding an array, validated with `applyEach`, which attaches the same rules to every item (including ones added later).

<details>
  <summary>favorites + favoritesForm</summary>

```ts
// libs/movies/feature-my-movies/src/lib/my-movie-list/my-movie-list.component.ts
import { applyEach } from '@angular/forms/signals';

type FavoriteMovie = TMDBMovieModel & { comment: string };

favorites = signal<FavoriteMovie[]>(this.movieService.getFavorites());

favoritesForm = form(this.favorites, (path) => {
  applyEach(path, (movie) => {
    required(movie.comment, { message: 'Entering a comment is required' });
    minLength(movie.comment, 5, { message: 'Please enter at least 5 characters' });
  });
});
```

`applyEach(path, (movie) => …)` runs for every element of the array — `movie.comment` is the typed path to each item's comment.

</details>

## Step 4 — Persist with an `effect`, not `valueChanges`

The `ngOnInit` subscription that persisted favorites becomes a one-line `effect`. It re-runs whenever the list or its validity changes — no `OnInit`, no `filter`, no manual unsubscribe.

<details>
  <summary>effect-based persistence</summary>

```diff
-ngOnInit(): void {
-  this.favorites.valueChanges
-    .pipe(filter(() => this.favorites.valid))
-    .subscribe(() => {
-      this.movieService.setFavorites(this.favorites.value);
-    });
-}
+constructor() {
+  effect(() => {
+    if (this.favoritesForm().valid()) {
+      this.movieService.setFavorites(this.favorites());
+    }
+  });
+}
```

`this.favoritesForm().valid()` reflects the validity of the **whole array** — child state cascades up to the root.

</details>

## Step 5 — Submission via the `form()` options, `add`, `reset`, `removeMovie`

The "what happens on submit" logic belongs to the form itself. Pass a **third argument** to `form()` — a `FormOptions` object with a `submission.action`. Then `add()` is just `submit(this.addForm)`: it marks every field touched and runs the configured action **only if the form is valid** — replacing the manual `if (valid) … else markAllAsTouched()` dance.

<details>
  <summary>addForm submission option</summary>

```ts
// libs/movies/feature-my-movies/src/lib/my-movie-list/my-movie-list.component.ts

addForm = form(
  this.addModel,
  (path) => {
    required(path.movie, { message: 'Entering a title is required' });
    validate(path.movie, ({ value }) => {
      const movie = value();
      return movie && this.favorites().some((fav) => fav.id === movie.id)
        ? { kind: 'unique', message: 'You already added that movie, edit it instead' }
        : null;
    });
    required(path.comment, { message: 'Entering a comment is required' });
    minLength(path.comment, 5, { message: 'Please enter at least 5 characters' });
  },
  {
    // 👇 the third argument: what to do on a valid submit
    submission: {
      action: async () => {
        const { movie, comment } = this.addModel();
        this.favorites.update((favorites) => [...favorites, { ...movie!, comment }]);
        this.reset();
      },
    },
  },
);
```

</details>

<details>
  <summary>component methods</summary>

```ts
// libs/movies/feature-my-movies/src/lib/my-movie-list/my-movie-list.component.ts

reset(): void {
  // reset() clears touched/dirty AND sets the value back
  this.addForm().reset({ movie: null, comment: '' });
}

removeMovie(index: number): void {
  this.favorites.update((favorites) => favorites.filter((_, i) => i !== index));
}
```

We no longer need an `add()` method: in Step 6 we bind the `<form>` with `[formRoot]="addForm"`, and the `FormRoot` directive runs the configured `submission.action` for us. `showError()` and the `createMovieForm()` helper are also gone — delete them.

</details>

## Step 6 — Update the template

Bind the form with `[formRoot]="addForm"` (import `FormRoot`) — it prevents the default submit, marks fields touched, and runs `addForm`'s `submission.action` only when valid. Bind inputs with `[formField]`, read state by calling the field signal (`addForm.comment()`), and render errors inline. This removes `ReactiveFormsModule`, `(ngSubmit)`, `formGroup`/`formControlName`/`formArrayName`, the `NgTemplateOutlet` error templates and `showError`.

<details>
  <summary>my-movie-list.component.html</summary>

```html
<form [formRoot]="addForm">
  <div class="form-group">
    <label for="search">Search</label>
    <app-movie-search-control id="search" [formField]="addForm.movie" />
    @if (addForm.movie().touched() && addForm.movie().invalid()) {
      @for (error of addForm.movie().errors(); track error.kind) {
        <span class="error">{{ error.message }}</span>
      }
    }
  </div>

  <div class="form-group">
    <label for="comment">Comment</label>
    <textarea rows="5" id="comment" [formField]="addForm.comment"></textarea>
    @if (addForm.comment().touched() && addForm.comment().invalid()) {
      @for (error of addForm.comment().errors(); track error.kind) {
        <span class="error">{{ error.message }}</span>
      }
    }
  </div>

  <div class="button-group">
    <button class="btn" type="button" (click)="reset()">Reset</button>
    <button class="btn primary-button" type="submit">Save</button>
  </div>
</form>

<h2>My Movies</h2>
<div class="my-movies-list">
  @for (movie of favoritesForm; track movie().value().id; let i = $index) {
    <div class="movie-item">
      <span class="movie-title">{{ movie.title().value() }}</span>
      <div class="form-group">
        <textarea class="movie-comment" [formField]="movie.comment"></textarea>
        @if (movie.comment().invalid()) {
          @for (error of movie.comment().errors(); track error.kind) {
            <span class="error">{{ error.message }}</span>
          }
        }
      </div>
      <button class="btn btn__icon" type="button" (click)="removeMovie(i)">
        <fast-svg name="delete"></fast-svg>
        Delete
      </button>
    </div>
  }
</div>
```

- Iterate the array form directly (`@for (movie of favoritesForm; …)`); each `movie` is a typed `FieldTree` with `movie.title` / `movie.comment`.
- `addForm.comment()` opens the field state; `.touched()`, `.invalid()`, `.errors()` are all signals.
- Error messages are colocated in the schema, so the template just renders `error.message`.

</details>

## Congrats! 🎉

You migrated a Reactive Form — including a custom control and a `FormArray` — to Signal Forms. One signal model, a colocated schema, and a custom control that wires up with the same `[formField]`.

---

## Full implementation

For convenience, here is the complete, finished implementation.

### `libs/movies/feature-my-movies/src/lib/my-movie-list/my-movie-list.component.ts`

```ts
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  FormField,
  FormRoot,
  applyEach,
  form,
  minLength,
  required,
  validate,
} from '@angular/forms/signals';
import { FastSvgComponent } from '@push-based/ngx-fast-svg';

import { TMDBMovieModel } from '../../shared/model/movie.model';
import { MovieService } from '../movie.service';
import { MovieSearchControlComponent } from '../movie-search-control/movie-search-control.component';

type FavoriteMovie = TMDBMovieModel & { comment: string };

@Component({
  selector: 'my-movie-list',
  templateUrl: './my-movie-list.component.html',
  styleUrls: ['./my-movie-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormField, FormRoot, MovieSearchControlComponent, FastSvgComponent],
})
export class MyMovieListComponent {
  private movieService = inject(MovieService);

  // The favorites list — an array model validated with applyEach
  protected readonly favorites = signal<FavoriteMovie[]>(
    this.movieService.getFavorites(),
  );

  protected readonly favoritesForm = form(this.favorites, (path) => {
    applyEach(path, (movie) => {
      required(movie.comment, { message: 'Entering a comment is required' });
      minLength(movie.comment, 5, {
        message: 'Please enter at least 5 characters',
      });
    });
  });

  // The "add a movie" form — one signal model + a schema
  protected readonly addModel = signal<{
    movie: TMDBMovieModel | null;
    comment: string;
  }>({ movie: null, comment: '' });

  protected readonly addForm = form(
    this.addModel,
    (path) => {
      required(path.movie, { message: 'Entering a title is required' });

      validate(path.movie, ({ value }) => {
        const movie = value();
        return movie && this.favorites().some((fav) => fav.id === movie.id)
          ? { kind: 'unique', message: 'You already added that movie, edit it instead' }
          : null;
      });

      required(path.comment, { message: 'Entering a comment is required' });
      minLength(path.comment, 5, { message: 'Please enter at least 5 characters' });
    },
    {
      // The third argument: what to do on a valid submit
      submission: {
        action: async () => {
          const { movie, comment } = this.addModel();
          this.favorites.update((favorites) => [
            ...favorites,
            { ...movie!, comment },
          ]);
          this.reset();
        },
      },
    },
  );

  constructor() {
    // Persist whenever the list changes and is valid (replaces valueChanges)
    effect(() => {
      if (this.favoritesForm().valid()) {
        this.movieService.setFavorites(this.favorites());
      }
    });
  }

  reset(): void {
    // reset() clears touched/dirty AND sets the value back
    this.addForm().reset({ movie: null, comment: '' });
  }

  removeMovie(index: number): void {
    this.favorites.update((favorites) =>
      favorites.filter((_, i) => i !== index),
    );
  }
}
```

### `libs/movies/feature-my-movies/src/lib/my-movie-list/my-movie-list.component.html`

```html
<form [formRoot]="addForm">
  <div class="form-group">
    <label for="search">Search</label>
    <app-movie-search-control id="search" [formField]="addForm.movie" />
    @if (addForm.movie().touched() && addForm.movie().invalid()) {
      @for (error of addForm.movie().errors(); track error.kind) {
        <span class="error">{{ error.message }}</span>
      }
    }
  </div>

  <div class="form-group">
    <label for="comment">Comment</label>
    <textarea rows="5" id="comment" [formField]="addForm.comment"></textarea>
    @if (addForm.comment().touched() && addForm.comment().invalid()) {
      @for (error of addForm.comment().errors(); track error.kind) {
        <span class="error">{{ error.message }}</span>
      }
    }
  </div>

  <div class="button-group">
    <button class="btn" type="button" (click)="reset()">Reset</button>
    <button class="btn primary-button" type="submit">Save</button>
  </div>
</form>

<h2>My Movies</h2>
<div class="my-movies-list">
  @for (movie of favoritesForm; track movie().value().id; let i = $index) {
    <div class="movie-item">
      <span class="movie-title">{{ movie.title().value() }}</span>
      <div class="form-group">
        <textarea class="movie-comment" [formField]="movie.comment"></textarea>
        @if (movie.comment().invalid()) {
          @for (error of movie.comment().errors(); track error.kind) {
            <span class="error">{{ error.message }}</span>
          }
        }
      </div>
      <button class="btn btn__icon" type="button" (click)="removeMovie(i)">
        <fast-svg name="delete"></fast-svg>
        Delete
      </button>
    </div>
  }
</div>
```

### `libs/movies/ui-movie-list/src/lib/movie-search-control/movie-search-control.component.ts`

```ts
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  model,
  viewChild,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { of, Subject, switchMap } from 'rxjs';

import { TMDBMovieModel } from '../../shared/model/movie.model';
import { MovieService } from '../movie.service';
import { MovieImagePipe } from '../movie-image.pipe';

@Component({
  selector: 'app-movie-search-control',
  template: `
    <input
      #searchInput
      (blur)="touched.set(true)"
      (input)="searchTerm$.next(searchInput.value)"
    />
    @if (movies$ | async; as movies) {
      <div class="results">
        @for (movie of movies; track movie) {
          <button class="movie-result" type="button" (click)="selectMovie(movie)">
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

    .results {
      width: 100%;
      display: flex;
      flex-direction: column;
      max-height: 350px;
      overflow: auto;
    }

    .movie-result {
      display: flex;
      align-items: center;
      padding: 0.5rem 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AsyncPipe, MovieImagePipe],
})
export class MovieSearchControlComponent
  implements FormValueControl<TMDBMovieModel | null>
{
  private movieService = inject(MovieService);

  // The FormValueControl contract: a value model (+ touched)
  readonly value = model<TMDBMovieModel | null>(null);
  readonly touched = model(false);

  private readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly searchTerm$ = new Subject<string>();

  movies$ = this.searchTerm$.pipe(
    switchMap((term) =>
      term ? this.movieService.searchMovies(term) : of(null),
    ),
  );

  constructor() {
    // keep the input text in sync with the field value (selection, reset, set)
    effect(() => {
      const movie = this.value();
      const input = this.searchInput()?.nativeElement;
      if (input) {
        input.value = movie ? movie.title : '';
      }
    });
  }

  selectMovie(movie: TMDBMovieModel) {
    this.value.set(movie);
    this.touched.set(true);
    this.searchTerm$.next('');
  }
}
```
</content>
</invoke>
