# Signal - resource & injectParams

In this exercise we will use our knowledge about the `rxResource` function to refactor the `MovieSearchPageComponent` to use signals.
We will also use the `injectParams` function to simplify the `query` parameter handling.

## Goal

Refactor the `MovieSearchPageComponent` to use `rxResource` and `injectParams`.

## Observe

Search for `throwError` (the `MovieService` throws for it on purpose), then search for something else. The loader
keeps spinning: the error killed the `movies$` stream.

## Migrate

Let's fix that with signals, and get loading and error states from the `rxResource` function.

### Get the `query` parameter as a signal

We can use the `injectParams` function to get the `query` parameter as a signal.
Add a `query` field next to `movies$`, keep everything else as it is for now.

<details>
  <summary>injectParams</summary>

```ts
// libs/movies/feature-movie-search/src/lib/movie-search-page/movie-search-page.component.ts
import { injectParams } from 'ngxtension/inject-params';

export class MovieSearchPageComponent {
  constructor(
    private movieService: MovieService,
    private activatedRoute: ActivatedRoute,
  ) {}

  // 👇 get the `query` parameter as a signal
  query = injectParams((p) => p['query'] as string);

  movies$: Observable<TMDBMovieModel[]> = this.activatedRoute.params.pipe(
    switchMap((params) => this.movieService.searchMovies(params['query'])),
  );
}
```

</details>

### Create a `movies` resource

Now we can create a `movies` resource that will be used to load the movies.

<details>
  <summary>resource</summary>

```ts
// libs/movies/feature-movie-search/src/lib/movie-search-page/movie-search-page.component.ts
import { rxResource } from '@angular/core/rxjs-interop';

export class MovieSearchPageComponent {
  // ...
  query = injectParams((p) => p['query'] as string);

  // 👇 create a `movies` resource
  movies = rxResource({
    params: this.query,
    stream: ({ params }) => this.movieService.searchMovies(params),
  });

  movies$: Observable<TMDBMovieModel[]> = /* ... unchanged */;
}
```

</details>

### Use the resource in the template

Update the template to use the `movies` resource. The `async` pipe is not used anymore — remove `AsyncPipe` from
`imports`.

<details>
  <summary>template</summary>

```ts
// libs/movies/feature-movie-search/src/lib/movie-search-page/movie-search-page.component.ts
@Component({
  selector: 'movie-search-page',
  template: `
    @if (movies.hasValue()) {
      <movie-list [movies]="movies.value()" />
    }

    @if (movies.isLoading()) {
      <div class="loader"></div>
    }

    @if (movies.error()) {
      <div>
        There are no movies to show.
        {{ movies.error() }}
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MovieListComponent],
})
```

</details>

### Remove `movies$` and `ActivatedRoute`

Delete `movies$`, the `activatedRoute` constructor parameter and the now unused imports.

<details>
  <summary>solution</summary>

```ts
// libs/movies/feature-movie-search/src/lib/movie-search-page/movie-search-page.component.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MovieService } from '@movies/movies/data-access';
import { MovieListComponent } from '@movies/movies/ui-movie-list';
import { injectParams } from 'ngxtension/inject-params';

@Component({
  // ... unchanged
})
export class MovieSearchPageComponent {
  constructor(private movieService: MovieService) {}

  query = injectParams((p) => p['query'] as string);

  movies = rxResource({
    params: this.query,
    stream: ({ params }) => this.movieService.searchMovies(params),
  });
}
```

</details>

Search for `throwError` again: the error message shows, and the next search works again.

## Congrats! 
You have successfully created a reactive component with signals only 🎉!
