import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '@movies/movies/data-access';
import { MovieListComponent } from '@movies/movies/ui-movie-list';
import { TMDBMovieModel } from '@movies/shared/models';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'movie-search-page',
  template: `
    @if (movies$ | async; as movies) {
      <movie-list [movies]="movies" />
    } @else {
      <div class="loader"></div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MovieListComponent, AsyncPipe],
})
export class MovieSearchPageComponent {
  constructor(
    private movieService: MovieService,
    private activatedRoute: ActivatedRoute,
  ) {}

  movies$: Observable<TMDBMovieModel[]> = this.activatedRoute.params.pipe(
    switchMap((params) => this.movieService.searchMovies(params['query'])),
  );
}
