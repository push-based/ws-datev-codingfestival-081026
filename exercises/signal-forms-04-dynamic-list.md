# Signal Forms 4 - Dynamic forms

Our page still shows a sample row instead of the favorites. Look at how the old page does it: a Reactive Forms
`FormArray` with one `FormGroup` per movie, created by a helper, kept in sync with `push()` and `removeAt()`,
persisted with a `valueChanges` subscription.

In Signal Forms a list is just an **array in a signal**. Add an item to the array, and a new row of fields appears.

## Goal

At the end of this exercise the favorites list is an array signal with a schema for every item, rendered and edited
with `[formField]`, and persisted with an `effect`.

> The relevant files are:
> - `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts`
> - `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html`

## 1. The list is an array signal

Add the list to `MyMovieListV2Component`:

* a `FavoriteMovie` type: a `TMDBMovieModel` with a `comment: string`
* a `favorites` property: a `signal<FavoriteMovie[]>`, initialized from `movieService.getFavorites()`

Careful: movies you like with **Please like me** on the movie list are stored **without** a `comment`. Remember the
model design tip from exercise 1: a field only exists for a property that exists. `[formField]="favorite.comment"`
would throw for those movies. Normalize the data when you read it: `comment: favorite.comment ?? ''`.

<details>
  <summary>favorites signal</summary>

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

type FavoriteMovie = TMDBMovieModel & { comment: string };

export class MyMovieListV2Component {
  private movieService = inject(MovieService);

  protected readonly favorites = signal<FavoriteMovie[]>(
    // movies liked on the movie list are stored without a comment:
    // normalize them, a field only exists for a property that exists
    this.movieService
      .getFavorites()
      .map((favorite) => ({ ...favorite, comment: favorite.comment ?? '' })),
  );
}
```

</details>

## 2. Validate every item with `applyEach`

Create a `favoritesForm` with `form(this.favorites, ...)`. The schema path is now an **array**. With `applyEach` you
attach a schema to every item of it, including the items that get added later.

Every favorite needs the same comment rules as the "add a movie" form.

<details>
  <summary>favoritesForm with applyEach</summary>

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

import { applyEach } from '@angular/forms/signals';

protected readonly favoritesForm = form(this.favorites, (favorites) => {
  applyEach(favorites, (favorite) => {
    required(favorite.comment, { message: 'Entering a comment is required' });
    minLength(favorite.comment, 5, {
      message: ({ value }) =>
        `Please enter at least 5 characters, right now you've entered ${value().length}`,
    });
  });
});
```

</details>

> Same rules in two places? `schema()` and `apply()` let you write rules once and reuse them on any path.

## 3. Render the list

An array field tree is iterable: `@for (favorite of favoritesForm; ...)` gives you one field tree per item.

Replace the sample row in the template with a `@for` over `favoritesForm`. Keep the **Delete** button as it is for now.

* `track favorite`: track the field, not the `$index`
* show the title from `favorite.title().value()`
* bind the textarea with `[formField]="favorite.comment"`
* show the comment errors whenever the comment is invalid (on the list we don't wait for `touched`)

<details>
  <summary>List template</summary>

```html
<!-- libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html -->

<h2>My Movies</h2>
<div class="my-movies-list">
  @for (favorite of favoritesForm; track favorite) {
    <div class="movie-item">
      <span class="movie-title">{{ favorite.title().value() }}</span>
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
      <button class="btn btn__icon" type="button">
        <fast-svg name="delete"></fast-svg>
        Delete
      </button>
    </div>
  }
</div>
```

</details>

## 4. Add and remove items

Adding and removing is just updating the array signal. The form follows.

* in the submission `action`, after `addFavorite()` succeeded, append the new favorite with
  `this.favorites.update(...)`
* add a `removeMovie(index)` method that filters the item out of the array
* in the template, add `let i = $index` to the `@for` and call `removeMovie(i)` from the **Delete** button

<details>
  <summary>Add & remove</summary>

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

// in the submission action
this.favorites.update((favorites) => [...favorites, favorite]);

removeMovie(index: number): void {
  this.favorites.update((favorites) =>
    favorites.filter((_, i) => i !== index),
  );
}
```

```html
<!-- libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html -->

@for (favorite of favoritesForm; track favorite; let i = $index) {
  <!-- ... -->
  <button class="btn btn__icon" type="button" (click)="removeMovie(i)">
    <fast-svg name="delete"></fast-svg>
    Delete
  </button>
}
```

</details>

## 5. Persist with an `effect`

The old page stores the list from a `valueChanges` subscription. We use an `effect` in the constructor instead: when
the whole list is valid, store it with `movieService.setFavorites()`.

`this.favoritesForm().valid()` is the state of the **root**: it is only valid if every comment of every item is valid.

> Unlike `valueChanges`, an `effect` runs once right away: on load it writes back the list it just read from
> `localStorage` (if every comment is valid). That's expected and harmless. Don't try to skip it with
> `favoritesForm().dirty()`: adding and removing favorites updates the signal from code, which doesn't mark the form
> dirty, so removals would never be saved.

<details>
  <summary>effect</summary>

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

import { effect } from '@angular/core';

constructor() {
  effect(() => {
    if (this.favoritesForm().valid()) {
      this.movieService.setFavorites(this.favorites());
    }
  });
}
```

Compare it with `ngOnInit` in the old `MyMovieListComponent`: no `valueChanges`, no `filter`, no subscription.

</details>

## 6. Try it out

Remove the debug output from exercise 1 if you like. Then serve the application:

* your favorites show up, the same ones as on the old page; a liked movie without a comment asks for one. Give it a
  comment of at least 5 characters: as long as one comment is invalid, nothing is stored
* edit a comment and check `my-movies` in the **Application** tab of the DevTools: it updates as you type
* shorten a comment to `abc`: the error shows up and the storage is **not** updated
* delete a movie, add a movie: the list and the storage follow

## Bonus: don't write on every keystroke

Every keystroke in a comment writes the whole list to `localStorage`. Add `debounce(favorite.comment, 500)` to the
item schema. The model, and with it the effect, now only updates 500ms after the user stopped typing, or right away
when they leave the field.

<details>
  <summary>debounce</summary>

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

import { debounce } from '@angular/forms/signals';

applyEach(favorites, (favorite) => {
  debounce(favorite.comment, 500);
  // ...
});
```

</details>

Well done, your list grows and shrinks with its data 🎉

---

## Full implementation

<details>
  <summary>Show the full solution</summary>

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
  form,
  FormField,
  FormRoot,
  minLength,
  required,
} from '@angular/forms/signals';
import { MovieService } from '@movies/movies/data-access';
import { MovieSearchControlComponent } from '@movies/movies/ui-movie-list';
import { TMDBMovieModel } from '@movies/shared/models';
import { FastSvgComponent } from '@push-based/ngx-fast-svg';

type FavoriteMovie = TMDBMovieModel & { comment: string };

interface AddMovieModel {
  movie: TMDBMovieModel | null;
  comment: string;
}

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
    // movies liked on the movie list are stored without a comment:
    // normalize them, a field only exists for a property that exists
    this.movieService
      .getFavorites()
      .map((favorite) => ({ ...favorite, comment: favorite.comment ?? '' })),
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

  protected readonly addModel = signal<AddMovieModel>({
    movie: null,
    comment: '',
  });

  protected readonly addForm = form(
    this.addModel,
    (path) => {
      required(path.movie, { message: 'Entering a title is required' });
      required(path.comment, { message: 'Entering a comment is required' });
      minLength(path.comment, 5, {
        message: ({ value }) =>
          `Please enter at least 5 characters, right now you've entered ${value().length}`,
      });
    },
    {
      submission: {
        action: async (addForm) => {
          const { movie, comment } = addForm().value();
          const favorite = { ...(movie as TMDBMovieModel), comment };

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
    this.addForm().reset({ movie: null, comment: '' });
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
    @if (addForm.comment().touched() && addForm.comment().invalid()) {
      @for (error of addForm.comment().errors(); track error.kind) {
        <span class="error">{{ error.message }}</span>
      }
    }
  </div>
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
      <span class="movie-title">{{ favorite.title().value() }}</span>
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
