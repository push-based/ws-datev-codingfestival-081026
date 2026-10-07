# Signal Forms 2 - Simple validation

Right now users can submit the form without a movie or a comment. Let's validate the input and tell users what's
wrong.

## Goal

At the end of this exercise the "add a movie" form has a **schema** with validation rules and error messages.
Errors show up at the right time, invalid data can't be saved, and invalid inputs get their red border back.

> The relevant files are:
> - `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts`
> - `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html`
> - `apps/movies/src/app/app.config.ts`

## 1. Add a schema

`form()` takes a second argument: a **schema function**. It receives a `path` with the same shape as your model, and
you attach rules to it. The rules re-run automatically whenever the values they read change.

Set up the same rules the reactive form had:

* `movie` is `required`
* `comment` is `required` and needs a `minLength` of `5`

Every built-in validator takes an options object as last argument. Pass a `message` so the template doesn't have to
know which validator failed:

* movie: `Entering a title is required`
* comment required: `Entering a comment is required`
* comment minLength: `Please enter at least 5 characters, right now you've entered N`

> A `message` can also be a **function**. It gets the field context, so `({ value }) => ...` can put the current
> length into the message.

<details>
  <summary>Schema with validators</summary>

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

import { form, FormField, minLength, required } from '@angular/forms/signals';

protected readonly addForm = form(this.addModel, (path) => {
  required(path.movie, { message: 'Entering a title is required' });
  required(path.comment, { message: 'Entering a comment is required' });
  minLength(path.comment, 5, {
    message: ({ value }) =>
      `Please enter at least 5 characters, right now you've entered ${value().length}`,
  });
});
```

</details>

## 2. Display error messages

Every field has state signals. Call the field to open its state:

* `valid()` / `invalid()`: no errors / at least one error
* `errors()`: the list of errors, each with a `kind` and your `message`
* `touched()`: the user focused the field and left it again
* `dirty()`: the user changed the value

A required field is invalid **on load**. If we show errors right away, the form is red before the user typed anything.
Show the errors only when the field is `touched()` **and** `invalid()`.

Below the search control and below the textarea, render every error of the field in a `span.error`.

<details>
  <summary>Error messages</summary>

```html
<!-- libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html -->

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
```

</details>

Serve the application. Click into the comment and leave it: the required error shows up. Type `abc`: the message
tells you how many characters you've entered. Notice how much simpler this is than the old `ng-template` with
`hasError('required')` and `errors.minlength?.requiredLength`.

## 3. Prevent saving invalid data

Click **Save** on the empty form. Instead of our messages, the **browser** shows a bubble like "Please fill out this
field", and `add()` never runs.

Inspect the textarea in the DevTools: it has `required` and `minlength="5"` attributes. `[formField]` mirrors the
rules of the schema onto the element, so screen readers announce them. The browser sees them too and runs its own
validation before the `submit` event fires. Signal Forms don't use native validation, so turn it off: add
`novalidate` to the `<form>`.

Now `add()` runs. Check the **form root** there: `this.addForm()` is the state of the whole form, and it is only
`valid()` when every field is valid. If the form is invalid, call `markAsTouched()` on the root to show all errors at
once, and return.

<details>
  <summary>novalidate and add() with validation</summary>

```html
<!-- libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html -->

<form novalidate (submit)="add($event)">
```

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

add(event: Event): void {
  event.preventDefault();

  if (this.addForm().invalid()) {
    this.addForm().markAsTouched();
    return;
  }

  console.log('submitted', this.addModel());
  this.reset();
}
```

</details>

## 4. Reset the interaction state too

Fill in the form and save: the form is empty again, but the errors are back. `addModel.set()` resets the
**value**, but the fields are still `touched`.

Use the field state instead: `this.addForm().reset(value)` resets `touched` and `dirty` for the whole form **and**
sets the new value.

<details>
  <summary>reset()</summary>

```ts
// libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts

reset(): void {
  this.addForm().reset({ movie: null, comment: '' });
}
```

</details>

## 5. Bring back the red borders

The styles in `my-movie-list-v2.component.scss` already have a rule for invalid inputs:

```scss
textarea.ng-touched.ng-invalid,
input.ng-touched.ng-invalid {
  border-color: var(--palette-secondary-main);
}
```

Reactive Forms add the `ng-*` status classes to every control. **Signal Forms don't add any classes by default.**
You decide which classes you want with `provideSignalFormsConfig()`. Each class maps to a predicate that gets the
bound field.

Angular ships the classic `ng-*` classes as `NG_STATUS_CLASSES` in `@angular/forms/signals/compat`. Provide them in
`app.config.ts`.

<details>
  <summary>provideSignalFormsConfig</summary>

```ts
// apps/movies/src/app/app.config.ts

import { provideSignalFormsConfig } from '@angular/forms/signals';
import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideSignalFormsConfig({ classes: NG_STATUS_CLASSES }),
    // ...
  ],
};
```

</details>

> You can also define your own classes, e.g.
> `classes: { 'is-invalid': ({ state }) => state().touched() && state().invalid() }`.

Serve the application, touch the comment and leave it empty. The red border is back.

## Bonus: watch the form roll up

Extend the debug output with the state of the form root: `addForm().valid()`, `addForm().touched()` and
`addForm().dirty()`. Play with the form and find out:

* when is the **form** valid?
* when is the **form** touched or dirty?

<details>
  <summary>Answer</summary>

The root is `valid()` only if **every** field is valid. It is `touched()` or `dirty()` as soon as **one** field is.

</details>

Well done, your form tells users exactly what's wrong 🎉

---

## Full implementation

<details>
  <summary>Show the full solution</summary>

### `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.ts`

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField, minLength, required } from '@angular/forms/signals';
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

  protected readonly addForm = form(this.addModel, (path) => {
    required(path.movie, { message: 'Entering a title is required' });
    required(path.comment, { message: 'Entering a comment is required' });
    minLength(path.comment, 5, {
      message: ({ value }) =>
        `Please enter at least 5 characters, right now you've entered ${value().length}`,
    });
  });

  add(event: Event): void {
    event.preventDefault();

    if (this.addForm().invalid()) {
      this.addForm().markAsTouched();
      return;
    }

    console.log('submitted', this.addModel());
    this.reset();
  }

  reset(): void {
    this.addForm().reset({ movie: null, comment: '' });
  }
}
```

### `libs/movies/feature-my-movies-v2/src/lib/my-movie-list-v2/my-movie-list-v2.component.html`

```html
<form novalidate (submit)="add($event)">
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

### `apps/movies/src/app/app.config.ts`

```ts
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
  withXhr,
} from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideSignalFormsConfig } from '@angular/forms/signals';
import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';
import { provideRouter } from '@angular/router';
import { provideEnvironment } from '@movies/shared/util-env';
import { provideFastSVG } from '@push-based/ngx-fast-svg';

import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';
import { ReadAccessInterceptor } from './core/read-access.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideEnvironment(environment),
    provideRouter(appRoutes),
    provideSignalFormsConfig({ classes: NG_STATUS_CLASSES }),
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideFastSVG({
      url: (name: string) => `assets/svg-icons/${name}.svg`,
      defaultSize: '12',
    }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ReadAccessInterceptor,
      multi: true,
    },
    // provideClientHydration(withEventReplay()),
  ],
};
```

</details>
