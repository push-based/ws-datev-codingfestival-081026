# Signal Forms 1 - A first signal form

The **My Movies** page (`/my-movies`) lets you search a movie, write a comment and keep a list of favorites.
It is built with **Reactive Forms**: a `FormGroup` for the "add a movie" form, a `FormArray` for the list and a
`ControlValueAccessor` for the movie search.

In this and the next five exercises we build the same page again with **Signal Forms** (`@angular/forms/signals`), from
scratch: **My Movies (Signal Forms)**, at `/my-movies-v2`. It's already in the side menu, and the old page stays
untouched, so you can compare both at any time.

> Both pages are protected: click **Login** in the top right corner first.

## Goal

At the end of this exercise the "add a movie" form is a signal form: a `signal` holds the data, `form()` turns it
into a field tree and `[formField]` binds the inputs. We submit to the console, no validation yet.

> The relevant files are:
> - `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts`
> - `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html`

## Where we start

Open **My Movies (Signal Forms)** in the side menu, then open `MyMovieListV2Component`. It lives in its own feature
library, `libs/movies/feature-my-movies-v2` (imported as `@movies/movies/feature-my-movies-v2`), and the app
lazy-loads it on the `/my-movies-v2` route. It's a shell: the template has the form, the inputs, a sample row for the
list and all the styles, but nothing is wired up. The class is empty.

For comparison, open `MyMovieListComponent` (`libs/movies/feature-my-movies`). Its "add a movie" form is a
`FormGroup`:

```ts
// libs/movies/feature-my-movies/src/lib/my-movie-list/my-movie-list.component.ts

myMovieForm = new FormGroup({
  movie: new FormControl(null, [Validators.required, /* unique validator */]),
  comment: new FormControl('', [Validators.required, Validators.minLength(5)]),
});
```

The values live **inside** the `FormControl`s. In Signal Forms it is the other way around: your data lives in a plain
`signal`, and the form is a typed, reactive view over that signal.

## 1. Create the model

Start with the data. In `MyMovieListV2Component`, define the shape of the "add a movie" form and create a `signal`
holding its initial value.

* `movie`: the selected movie, `TMDBMovieModel | null` (no movie selected yet)
* `comment`: a `string`

> **Model design tip:** give every property a real initial value. Use `null` for "nothing selected" and `''` for
> empty text. Avoid optional properties and `undefined`: a field can only exist for a property that exists.

<details>
  <summary>addModel</summary>

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

import { signal } from '@angular/core';
import { TMDBMovieModel } from '@movies/shared/models';

interface AddMovieModel {
  movie: TMDBMovieModel | null;
  comment: string;
}

export class MyMovieListV2Component {
  protected readonly addModel = signal<AddMovieModel>({
    movie: null,
    comment: '',
  });
}
```

</details>

## 2. Create the form

Now wrap the model with `form()` from `@angular/forms/signals` and store it in an `addForm` property.

`form()` does **not** copy your data. It builds a *field tree* with the same shape as your model:

```ts
addForm.comment;           // FieldTree<string>: points to the comment field
addForm.comment();         // FieldState: value(), touched(), dirty(), ...
addForm.comment().value(); // the comment, read from addModel
```

<details>
  <summary>addForm</summary>

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

import { form } from '@angular/forms/signals';

protected readonly addForm = form(this.addModel);
```

</details>

## 3. Bind the inputs with `[formField]`

Head over to the template. Bind both fields with the `[formField]` directive and pass it the field from the tree:
`addForm.movie` on the search control and `addForm.comment` on the textarea.

Don't forget to add `FormField` (from `@angular/forms/signals`) to the component `imports`.

> **Did you notice?** `app-movie-search-control` is a `ControlValueAccessor`, written for Reactive Forms.
> `[formField]` works with existing `ControlValueAccessor` components, so the controls you already have keep
> working. We turn it into a real signal forms control in exercise 5.

<details>
  <summary>Template with [formField]</summary>

```html
<!-- libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html -->

<form>
  <div class="form-group">
    <label for="search">Search</label>
    <app-movie-search-control id="search" [formField]="addForm.movie" />
  </div>
  <div class="form-group">
    <label for="comment">Comment</label>
    <textarea rows="5" id="comment" [formField]="addForm.comment"></textarea>
  </div>
  <!-- ... -->
</form>
```

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

import { form, FormField } from '@angular/forms/signals';

@Component({
  imports: [FormField, MovieSearchControlComponent, FastSvgComponent],
})
```

</details>

## 4. See the two-way binding

To see what happens, print the model right below the form. Every keystroke ends up in `addModel`, no
`valueChanges`, no subscription.

<details>
  <summary>Debug output</summary>

```html
<!-- libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html -->

<p class="hint">
  movie: {{ addModel().movie?.title ?? '-' }} · comment:
  {{ addModel().comment }}
</p>
```

</details>

Serve the application, search a movie, select it and type a comment. The debug output updates as you type.

It also works the other way around: update the model, and the inputs follow. Add a `reset()` method that sets the
model back to its initial value, and call it from the **Reset** button. Click it: both inputs are cleared, including
the search control.

<details>
  <summary>reset()</summary>

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

reset(): void {
  this.addModel.set({ movie: null, comment: '' });
}
```

```html
<!-- libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html -->

<button class="btn" type="button" (click)="reset()">Reset</button>
```

</details>

## 5. Submit to the console

Clicking **Save** does a classic browser form submit and reloads the page. Listen to the native `(submit)` event,
pass the `$event` to a new `add()` method and call `preventDefault()` there.

In `add()`, read the current value straight from the model, log it and reset the form. Storing the movie comes in
exercise 3.

<details>
  <summary>add()</summary>

```html
<!-- libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html -->

<form (submit)="add($event)">
```

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

add(event: Event): void {
  event.preventDefault();
  console.log('submitted', this.addModel());
  this.reset();
}
```

</details>

Serve the application, fill in the form, click **Save** and check the console.

> `preventDefault()` by hand feels old-school. In exercise 3 the `[formRoot]` directive does it for us.

Well done, you built your first signal form 🎉

---

## Full implementation

<details>
  <summary>Show the full solution</summary>

### `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts`

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
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
  imports: [FormField, MovieSearchControlComponent, FastSvgComponent],
})
export class MyMovieListV2Component {
  protected readonly addModel = signal<AddMovieModel>({
    movie: null,
    comment: '',
  });

  protected readonly addForm = form(this.addModel);

  add(event: Event): void {
    event.preventDefault();
    console.log('submitted', this.addModel());
    this.reset();
  }

  reset(): void {
    this.addModel.set({ movie: null, comment: '' });
  }
}
```

### `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html`

```html
<form (submit)="add($event)">
  <div class="form-group">
    <label for="search">Search</label>
    <app-movie-search-control id="search" [formField]="addForm.movie" />
  </div>
  <div class="form-group">
    <label for="comment">Comment</label>
    <textarea rows="5" id="comment" [formField]="addForm.comment"></textarea>
  </div>
  <div class="button-group">
    <button class="btn" type="button" (click)="reset()">Reset</button>
    <button class="btn primary-button" type="submit">Save</button>
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
