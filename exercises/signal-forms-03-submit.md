# Signal Forms 3 - A real submit

Our `add()` method does a lot by hand: prevent the browser submit, check validity, mark everything touched.
And in a real app, saving means talking to a server: it takes time, and the server can say no.

## Goal

At the end of this exercise the form knows how to submit itself. `[formRoot]` handles the submit event, the
form's `submission` option sends the movie to the app's fake backend, the button shows a loading state, server errors land
on the right field and an invalid submit focuses the first broken field.

> The relevant files are:
> - `libs/movies/data-access/src/lib/movie.service.ts` (read only)
> - `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts`
> - `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html`

## 1. Meet the fake backend

A real submit talks to a server. So that we don't need one, the app already contains a fake backend:
`addFavorite(favorite)` in the `MovieService`. Open `libs/movies/data-access/src/lib/movie.service.ts` and have a look.

* it is `async`, like a real HTTP call, and only answers after **one second**: long enough to see a loading state
* our "moderators" reject comments that contain the word `spoiler`: the method then **throws an `Error`**, just
  like a request that fails
* it doesn't store anything: keeping the favorites list stays the job of our component

That gives us everything a real submit has to handle: waiting, success and a server-side error.

<details>
  <summary>MovieService#addFavorite</summary>

```ts
// libs/movies/data-access/src/lib/movie.service.ts

/**
 * A fake backend for the Signal Forms exercises.
 *
 * Pretends to save a new favorite on a server: it answers after one second, and the
 * "moderation" rejects comments that contain the word "spoiler" by throwing an error,
 * just like an HTTP call that fails. Storing the list stays the component's job.
 */
async addFavorite(
  favorite: TMDBMovieModel & { comment: string },
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (/spoiler/i.test(favorite.comment)) {
    throw new Error('Our moderators rejected this comment: no spoilers!');
  }
}
```

</details>

## 2. Tell the form how to submit

What happens on submit is part of the form, so it goes into the form. `form()` takes a **third argument**: the form
options. Add a `submission` option with an `action`.

The `action`:

* is `async` and receives the form's field tree as argument
* only runs when the form is **valid**
* returns `undefined` when everything went fine

Inject the `MovieService` with `inject()`, then move the logic of `add()` into the action: read the value,
`await this.movieService.addFavorite()`, store the movie and reset the form. Then delete `add()`.

Our page doesn't show the favorites list yet, that's exercise 4. Until then, store the movie with
`movieService.setFavorites()`, appended to `movieService.getFavorites()`.

<details>
  <summary>submission.action</summary>

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

private movieService = inject(MovieService);

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
        const favorite = { ...movie!, comment };

        await this.movieService.addFavorite(favorite);

        this.movieService.setFavorites([
          ...this.movieService.getFavorites(),
          favorite,
        ]);
        this.reset();
        return undefined;
      },
    },
  },
);
```

</details>

## 3. Let `[formRoot]` submit

Replace `novalidate (submit)="add($event)"` with the `[formRoot]` directive and pass it `addForm`. Add `FormRoot` to
the component `imports`.

`[formRoot]` does everything our `add()` did by hand:

1. it adds `novalidate` to the `<form>`, so the browser doesn't show its own validation bubbles
2. on submit it calls `preventDefault()`
3. it calls `submit()` on the form, which **marks all fields as touched** and runs the `action` **only if the form
   is valid**

<details>
  <summary>[formRoot]</summary>

```html
<!-- libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html -->

<form [formRoot]="addForm">
```

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

import {
  form,
  FormField,
  FormRoot,
  minLength,
  required,
} from '@angular/forms/signals';

@Component({
  imports: [FormField, FormRoot, MovieSearchControlComponent, FastSvgComponent],
})
```

</details>

Serve the application. Click **Save** on the empty form: all errors show up. Fill in the form and save: after a
second, the form resets. Open the old **My Movies** page: your movie is in its list.

> If you need to submit from code, e.g. from a button outside the form, call `submit(this.addForm)` from
> `@angular/forms/signals`. It returns a `Promise<boolean>` telling you whether the submission succeeded.

## 4. Show that something is happening

The save takes a second and the user gets no feedback. While the action runs, the form root's `submitting()` signal
is `true`.

Use it on the **Save** button: disable it and change its text to `Saving…` while submitting.

<details>
  <summary>Save button</summary>

```html
<!-- libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html -->

<button
  class="btn primary-button"
  type="submit"
  [disabled]="addForm().submitting()"
>
  {{ addForm().submitting() ? 'Saving…' : 'Save' }}
</button>
```

</details>

## 5. Server errors on the right field

Add a movie with the comment `What a spoiler!`. Nothing happens and the console shows an error: the rejected
promise is not handled.

Wrap the `addFavorite()` call in a `try/catch`. In the `catch`, **return** a validation error from the action:

* `kind`: `'server'`
* `message`: the error message
* `fieldTree`: the field the error belongs to, here `addForm.comment`

The form adds the error to that field, so it shows up in the comment's `errors()` like any other error.

<details>
  <summary>Return a server error</summary>

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

action: async (addForm) => {
  const { movie, comment } = addForm().value();
  const favorite = { ...movie!, comment };

  try {
    await this.movieService.addFavorite(favorite);
  } catch (error) {
    return {
      kind: 'server',
      message: (error as Error).message,
      fieldTree: addForm.comment,
    };
  }

  this.movieService.setFavorites([
    ...this.movieService.getFavorites(),
    favorite,
  ]);
  this.reset();
  return undefined;
},
```

</details>

Try the spoiler again: the moderators' message shows up below the comment. Now change the comment: the server error
disappears as soon as you edit the field.

## 6. Focus the first problem

On a long form, users don't see which field is broken. Next to `action`, the `submission` option takes an
`onInvalid` callback. It runs instead of the action when the form is invalid.

In `onInvalid`, take the first error of the whole form from `errorSummary()` (the errors of the field **and** all its
children), go to its `fieldTree` and call `focusBoundControl()`.

<details>
  <summary>onInvalid</summary>

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

submission: {
  action: async (addForm) => { /* ... */ },
  onInvalid: (addForm) => {
    addForm().errorSummary()[0]?.fieldTree().focusBoundControl();
  },
},
```

</details>

Serve the application. Select a movie, leave the comment empty and click **Save**: the comment gets the focus.
Now reset and click **Save** on the empty form: nothing gets focused. The first error belongs to the movie, and
`app-movie-search-control` is a `ControlValueAccessor` without a way to focus its inner input. We fix that in
exercise 5.

Well done, your form submits itself 🎉

---

## Full implementation

<details>
  <summary>Show the full solution</summary>

### `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts`

```ts
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
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
          const favorite = { ...movie!, comment };

          try {
            await this.movieService.addFavorite(favorite);
          } catch (error) {
            return {
              kind: 'server',
              message: (error as Error).message,
              fieldTree: addForm.comment,
            };
          }

          this.movieService.setFavorites([
            ...this.movieService.getFavorites(),
            favorite,
          ]);
          this.reset();
          return undefined;
        },
        onInvalid: (addForm) => {
          addForm().errorSummary()[0]?.fieldTree().focusBoundControl();
        },
      },
    },
  );

  reset(): void {
    this.addForm().reset({ movie: null, comment: '' });
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

<p class="hint">
  movie: {{ addModel().movie?.title ?? '-' }} · comment:
  {{ addModel().comment }}
</p>

<h2>My Movies</h2>
<div class="my-movies-list">
  <!-- one row per favorite: exercise 4 turns this into a @for -->
  <div class="movie-item">
    <span class="movie-title">Movie title</span>
    <div class="form-group">
      <textarea class="movie-comment"></textarea>
    </div>
    <button class="btn btn__icon" type="button">
      <fast-svg name="delete"></fast-svg>
      Delete
    </button>
  </div>
</div>
```

</details>
