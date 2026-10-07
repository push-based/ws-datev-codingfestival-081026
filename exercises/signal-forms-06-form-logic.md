# Signal Forms 6 - Custom validation & dynamic fields

Our form is still missing a rule: the old reactive page rejects movies that are already a favorite. And a form is
more than validation: some fields only make sense in some situations.

## Goal

At the end of this exercise:

* a reusable custom validator rejects movies that are already in the list, and it re-runs when the list changes
* the comment is disabled, with a reason, until a movie is picked
* a "watched" checkbox shows a rating field, which is only validated while it is visible

> The relevant files are:
> - `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/unique-movie.validator.ts` (new)
> - `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts`
> - `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html`

> The styles for `.hint` and `.form-group--inline` used below are already in `my-movie-list-v2.component.scss`.

## 1. A custom validator

A custom validator is a function you call with `validate(path, fn)`. The function gets the field context and
returns `null` when the value is fine, or an error object with a `kind` and a `message`.

To make it reusable, put it in its own function that takes the path to validate. Create a new file
`unique-movie.validator.ts` and export a function `uniqueMovie(path, favorites)`:

* `path` is a `SchemaPath<TMDBMovieModel | null>`
* `favorites` is a `Signal<TMDBMovieModel[]>`
* it returns `{ kind: 'unique', message: 'You already added that movie, edit it instead' }` when the selected movie's
  `id` is already in `favorites()`, `null` otherwise

Call it in the schema of `addForm`, pass it `path.movie` and `this.favorites`.

<details>
  <summary>uniqueMovie</summary>

### `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/unique-movie.validator.ts`

```ts
import { Signal } from '@angular/core';
import { SchemaPath, validate } from '@angular/forms/signals';
import { TMDBMovieModel } from '@movies/shared/models';

/**
 * Rejects a movie that is already in the given list.
 * Because `favorites` is a signal, the rule re-runs whenever the list changes.
 */
export function uniqueMovie(
  path: SchemaPath<TMDBMovieModel | null>,
  favorites: Signal<TMDBMovieModel[]>,
): void {
  validate(path, ({ value }) => {
    const movie = value();
    if (movie && favorites().some((favorite) => favorite.id === movie.id)) {
      return {
        kind: 'unique',
        message: 'You already added that movie, edit it instead',
      };
    }
    return null;
  });
}
```

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

import { uniqueMovie } from './unique-movie.validator';

required(path.movie, { message: 'Entering a title is required' });
uniqueMovie(path.movie, this.favorites);
```

</details>

Serve the application and select a movie that is already in your list: the error shows up. Now **delete** that
movie from the list: the error disappears.

The old page's validator calls `movieService.getFavorites()`, which is not reactive. Ours reads the `favorites` **signal**,
so the rule re-runs whenever the list changes.

## 2. Disable a field, and say why

Writing a comment before a movie is selected makes no sense. Disable the comment until a movie is picked with
`disabled(path.comment, { when })`.

`when` gets the field context. `valueOf(path.movie)` reads the value of **another** field. Return:

* `false` when the field is enabled
* `true`, or even better a **string** with the reason, when it is disabled

Show the reasons below the textarea: `addForm.comment().disabledReasons()` is a list of objects with a `message`.
Render them in a `span.hint`.

> Don't add a `[disabled]` binding to an element with `[formField]`. The field state drives it, and the compiler
> reports an error if you try.

<details>
  <summary>disabled with a reason</summary>

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

import { disabled } from '@angular/forms/signals';

disabled(path.comment, {
  when: ({ valueOf }) =>
    valueOf(path.movie) === null ? 'Pick a movie first' : false,
});
```

```html
<!-- libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html -->

<textarea rows="5" id="comment" [formField]="addForm.comment"></textarea>
@for (reason of addForm.comment().disabledReasons(); track reason.message) {
  <span class="hint">{{ reason.message }}</span>
}
```

</details>

Serve the application and click **Save** on the empty form: only the movie error shows up. A **disabled field is
not validated**, so the comment's `required` doesn't count while it is disabled.

## 3. Dynamic fields: show a rating when watched

Users who have watched the movie can rate it. Extend the model:

* `watched`: `boolean`, a checkbox
* `rating`: `number | null`, from 1 to 10, only when `watched` is checked

The initial value now appears in three places (the signal, `reset()`, and soon the template). Move it into a
constant `emptyAddModel`.

In the schema:

* hide the rating with `hidden(path.rating, { when })` while `watched` is `false`
* add `required`, `min(1)` and `max(10)` to the rating, with messages

In the template:

* add an `<input type="checkbox">` bound to `addForm.watched`
* add an `<input type="number">` bound to `addForm.rating` with its errors, and wrap it in
  `@if (!addForm.rating().hidden())`

> `hidden()` doesn't remove anything from the DOM, you decide that with `@if`. What it does: a **hidden field is not
> validated** and doesn't count for the `valid()`, `touched()` and `dirty()` of its parent. That's why the
> `required` rating doesn't block saving while it is hidden.

<details>
  <summary>Model and schema</summary>

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

import { hidden, max, min } from '@angular/forms/signals';

interface AddMovieModel {
  movie: TMDBMovieModel | null;
  comment: string;
  watched: boolean;
  rating: number | null;
}

const emptyAddModel: AddMovieModel = {
  movie: null,
  comment: '',
  watched: false,
  rating: null,
};

protected readonly addModel = signal<AddMovieModel>(emptyAddModel);

// in the schema
hidden(path.rating, { when: ({ valueOf }) => !valueOf(path.watched) });
required(path.rating, { message: 'How many stars?' });
min(path.rating, 1, { message: 'At least 1 star' });
max(path.rating, 10, { message: 'At most 10 stars' });

reset(): void {
  this.addForm().reset(emptyAddModel);
}
```

</details>

<details>
  <summary>Template</summary>

```html
<!-- libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html -->

<div class="form-group form-group--inline">
  <input type="checkbox" id="watched" [formField]="addForm.watched" />
  <label for="watched">I've watched it</label>
</div>

@if (!addForm.rating().hidden()) {
  <div class="form-group">
    <label for="rating">Rating (1-10)</label>
    <input type="number" id="rating" [formField]="addForm.rating" />
    @if (addForm.rating().touched() && addForm.rating().invalid()) {
      @for (error of addForm.rating().errors(); track error.kind) {
        <span class="error">{{ error.message }}</span>
      }
    }
  </div>
}
```

</details>

The number input writes a `number` into the model, and `null` when it is empty. No parsing on your side.

## 4. Save the rating

Store the rating with the favorite and show it in the list.

* add `rating: number | null` to the `FavoriteMovie` type
* entries stored before this exercise don't have a `rating`. Normalize them when you read them, next to the
  `comment` from exercise 4, so the model never holds `undefined`
* in the submission `action`, save `rating` only when `watched` is checked
* in the list, show `★ {{ rating }}` next to the title when there is one

<details>
  <summary>Save and show the rating</summary>

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

type FavoriteMovie = TMDBMovieModel & {
  comment: string;
  rating: number | null;
};

protected readonly favorites = signal<FavoriteMovie[]>(
  // liked movies have no comment, older entries no rating:
  // normalize them, a field only exists for a property that exists
  this.movieService.getFavorites().map((favorite) => ({
    rating: null,
    ...favorite,
    comment: favorite.comment ?? '',
  })),
);

// in the submission action
const { movie, comment, watched, rating } = addForm().value();
const favorite = { ...movie!, comment, rating: watched ? rating : null };
```

```html
<!-- libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html -->

<span class="movie-title">
  {{ favorite.title().value() }}
  @if (favorite.rating().value(); as rating) {
    <small>★ {{ rating }}</small>
  }
</span>
```

</details>

Serve the application. Check **I've watched it**, try to save without a rating, try `12`, then save with `9`.

## Bonus: rules that only apply sometimes

`hidden` and `disabled` switch whole fields. Sometimes you only want to switch **rules**. `applyWhen(path, condition,
schema)` applies a schema only while the condition is true.

Add this rule: when a watched movie gets 3 stars or less, the comment needs at least 20 characters
(`Only 3 stars or less? Tell us why in at least 20 characters`).

<details>
  <summary>applyWhen</summary>

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

import { applyWhen } from '@angular/forms/signals';

// a low rating needs a reason
applyWhen(
  path,
  ({ value }) => value().watched && (value().rating ?? 10) <= 3,
  (movie) => {
    minLength(movie.comment, 20, {
      message: 'Only 3 stars or less? Tell us why in at least 20 characters',
    });
  },
);
```

</details>

> For a single rule, every validator also takes a `when` option: `minLength(path.comment, 20, { when: ... })`.

Congratulations! My Movies is a Signal Form now: one signal per form, a typed schema for all the rules, a custom
control with a signal contract, and not a single subscription 🎉

---

## Full implementation

<details>
  <summary>Show the full solution</summary>

### `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/unique-movie.validator.ts`

```ts
import { Signal } from '@angular/core';
import { SchemaPath, validate } from '@angular/forms/signals';
import { TMDBMovieModel } from '@movies/shared/models';

/**
 * Rejects a movie that is already in the given list.
 * Because `favorites` is a signal, the rule re-runs whenever the list changes.
 */
export function uniqueMovie(
  path: SchemaPath<TMDBMovieModel | null>,
  favorites: Signal<TMDBMovieModel[]>,
): void {
  validate(path, ({ value }) => {
    const movie = value();
    if (movie && favorites().some((favorite) => favorite.id === movie.id)) {
      return {
        kind: 'unique',
        message: 'You already added that movie, edit it instead',
      };
    }
    return null;
  });
}
```

### `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts`

```ts
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  applyEach,
  disabled,
  form,
  FormField,
  FormRoot,
  hidden,
  max,
  min,
  minLength,
  required,
} from '@angular/forms/signals';
import { MovieService } from '@movies/movies/data-access';
import { MovieSearchControlComponent } from '@movies/movies/ui-movie-list';
import { TMDBMovieModel } from '@movies/shared/models';
import { FastSvgComponent } from '@push-based/ngx-fast-svg';

import { uniqueMovie } from './unique-movie.validator';

type FavoriteMovie = TMDBMovieModel & {
  comment: string;
  rating: number | null;
};

interface AddMovieModel {
  movie: TMDBMovieModel | null;
  comment: string;
  watched: boolean;
  rating: number | null;
}

const emptyAddModel: AddMovieModel = {
  movie: null,
  comment: '',
  watched: false,
  rating: null,
};

/**
 * My Movies, built with Signal Forms during the exercises (`exercises/signal-forms-*.md`).
 * It starts as a shell: markup and styles, nothing wired up.
 * `MyMovieListComponent` (`/my-movies`) is the same page built with Reactive Forms, for comparison.
 */
@Component({
  selector: 'my-movie-list-v2',
  templateUrl: './my-movie-list-v2.component.html',
  styleUrls: ['./my-movie-list-v2.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormField, FormRoot, MovieSearchControlComponent, FastSvgComponent],
})
export class MyMovieListV2Component {
  private movieService = inject(MovieService);

  protected readonly favorites = signal<FavoriteMovie[]>(
    // liked movies have no comment, older entries no rating:
    // normalize them, a field only exists for a property that exists
    this.movieService.getFavorites().map((favorite) => ({
      rating: null,
      ...favorite,
      comment: favorite.comment ?? '',
    })),
  );

  protected readonly favoritesForm = form(this.favorites, (favorites) => {
    applyEach(favorites, (favorite) => {
      required(favorite.comment, { message: 'Entering a comment is required' });
      minLength(favorite.comment, 5, {
        message: ({ value }) =>
          `Please enter at least 5 characters, right now you've entered ${value().length}`,
      });
    });
  });

  protected readonly addModel = signal<AddMovieModel>(emptyAddModel);

  protected readonly addForm = form(
    this.addModel,
    (path) => {
      required(path.movie, { message: 'Entering a title is required' });
      uniqueMovie(path.movie, this.favorites);

      disabled(path.comment, {
        when: ({ valueOf }) =>
          valueOf(path.movie) === null ? 'Pick a movie first' : false,
      });
      required(path.comment, { message: 'Entering a comment is required' });
      minLength(path.comment, 5, {
        message: ({ value }) =>
          `Please enter at least 5 characters, right now you've entered ${value().length}`,
      });

      hidden(path.rating, { when: ({ valueOf }) => !valueOf(path.watched) });
      required(path.rating, { message: 'How many stars?' });
      min(path.rating, 1, { message: 'At least 1 star' });
      max(path.rating, 10, { message: 'At most 10 stars' });
    },
    {
      submission: {
        action: async (addForm) => {
          const { movie, comment, watched, rating } = addForm().value();
          const favorite = {
            ...movie!,
            comment,
            rating: watched ? rating : null,
          };

          try {
            await this.movieService.addFavorite(favorite);
          } catch (error) {
            return {
              kind: 'server',
              message: (error as Error).message,
              fieldTree: addForm.comment,
            };
          }

          this.favorites.update((favorites) => [...favorites, favorite]);
          this.reset();
          return undefined;
        },
        onInvalid: (addForm) => {
          addForm().errorSummary()[0]?.fieldTree().focusBoundControl();
        },
      },
    },
  );

  constructor() {
    effect(() => {
      if (this.favoritesForm().valid()) {
        this.movieService.setFavorites(this.favorites());
      }
    });
  }

  reset(): void {
    this.addForm().reset(emptyAddModel);
  }

  removeMovie(index: number): void {
    this.favorites.update((favorites) =>
      favorites.filter((_, i) => i !== index),
    );
  }
}
```

### `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html`

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
    @for (reason of addForm.comment().disabledReasons(); track reason.message) {
      <span class="hint">{{ reason.message }}</span>
    }
    @if (addForm.comment().touched() && addForm.comment().invalid()) {
      @for (error of addForm.comment().errors(); track error.kind) {
        <span class="error">{{ error.message }}</span>
      }
    }
  </div>
  <div class="form-group form-group--inline">
    <input type="checkbox" id="watched" [formField]="addForm.watched" />
    <label for="watched">I've watched it</label>
  </div>

  @if (!addForm.rating().hidden()) {
    <div class="form-group">
      <label for="rating">Rating (1-10)</label>
      <input type="number" id="rating" [formField]="addForm.rating" />
      @if (addForm.rating().touched() && addForm.rating().invalid()) {
        @for (error of addForm.rating().errors(); track error.kind) {
          <span class="error">{{ error.message }}</span>
        }
      }
    </div>
  }

  <div class="button-group">
    <button class="btn" type="button" (click)="reset()">Reset</button>
    <button
      class="btn primary-button"
      type="submit"
      [disabled]="addForm().submitting()"
    >
      {{ addForm().submitting() ? 'Saving…' : 'Save' }}
    </button>
  </div>
</form>

<h2>My Movies</h2>
<div class="my-movies-list">
  @for (favorite of favoritesForm; track favorite; let i = $index) {
    <div class="movie-item">
      <span class="movie-title">
        {{ favorite.title().value() }}
        @if (favorite.rating().value(); as rating) {
          <small>★ {{ rating }}</small>
        }
      </span>
      <div class="form-group">
        <textarea
          class="movie-comment"
          [formField]="favorite.comment"
        ></textarea>
        @if (favorite.comment().invalid()) {
          @for (error of favorite.comment().errors(); track error.kind) {
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

</details>
