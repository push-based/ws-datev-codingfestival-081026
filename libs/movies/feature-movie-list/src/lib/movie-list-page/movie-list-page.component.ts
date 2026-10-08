import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '@movies/movies/data-access';
import { MovieListComponent } from '@movies/movies/ui-movie-list';
import { TMDBMovieModel } from '@movies/shared/models';
import {
  DirtyCheckComponent,
  ElementVisibilityDirective,
} from '@movies/shared/utils';
import { exhaustMap, Observable, scan, startWith, Subject, take } from 'rxjs';

@Component({
  selector: 'movie-list-page',
  template: `
    <dirty-check />
    <movie-list
      [movies]="movies"
      [favoriteMovieIds]="favoriteMovieIds"
      (favoriteToggled)="handleFavoriteToggled($event)"
    />
    <div (elementVisible)="paginate$.next()"></div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MovieListComponent,
    ElementVisibilityDirective,
    DirtyCheckComponent,
  ],
})
export class MovieListPageComponent {
  paginate$ = new Subject<void>();

  movies: TMDBMovieModel[] = [];

  favoriteMovieIds = new Set<string>();

  constructor(
    private movieService: MovieService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.activatedRoute.params.subscribe((params) => {
      if (params.category) {
        this.paginate((page) =>
          this.movieService.getMovieList(params.category, page),
        ).subscribe((movies) => {
          this.movies = movies;
        });
      } else {
        this.paginate((page) =>
          this.movieService.getMoviesByGenre(params.id, page),
        ).subscribe((movies) => {
          this.movies = movies;
        });
      }
    });

    this.loadFavorites();
  }

  handleFavoriteToggled(movie: TMDBMovieModel) {
    this.movieService
      .toggleFavorite(movie)
      .pipe(take(1))
      .subscribe(() => {
        this.loadFavorites();
      });
  }

  loadFavorites() {
    this.favoriteMovieIds = this.movieService
      .getFavorites()
      .reduce((acc, movie) => {
        acc.add(movie.id);
        return acc;
      }, new Set<string>());
  }

  private paginate(paginateFn: (page: number) => Observable<TMDBMovieModel[]>) {
    return this.paginate$.pipe(
      startWith(void 0),
      exhaustMap((_, i) => {
        return paginateFn(i + 1);
      }),
      scan((allMovies, pagedMovies) => {
        return [...allMovies, ...pagedMovies];
      }, [] as TMDBMovieModel[]),
    );
  }
}
