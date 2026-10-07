import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  TMDBMovieCreditsModel,
  TMDBMovieDetailsModel,
  TMDBMovieGenreModel,
  TMDBMovieModel,
} from '@movies/shared/models';
import { injectEnv } from '@movies/shared/util-env';
import { insert, remove } from '@rx-angular/cdk/transformations';
import { map, Observable, tap, timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private env = injectEnv();

  constructor(private httpClient: HttpClient) {}

  getGenres(): Observable<TMDBMovieGenreModel[]> {
    return this.httpClient
      .get<{
        genres: TMDBMovieGenreModel[];
      }>(`${this.env.tmdbBaseUrl}/3/genre/movie/list`)
      .pipe(map(({ genres }) => genres));
  }

  getMoviesByGenre(
    genre: TMDBMovieGenreModel['id'],
    page = 1,
    sortBy = 'popularity.desc',
  ): Observable<TMDBMovieModel[]> {
    return this.httpClient
      .get<{ results: TMDBMovieModel[] }>(
        `${this.env.tmdbBaseUrl}/3/discover/movie`,
        {
          params: {
            with_genres: genre,
            page,
            sort_by: sortBy,
          },
        },
      )
      .pipe(map(({ results }) => results));
  }

  getMovieCredits(id: string): Observable<TMDBMovieCreditsModel> {
    return this.httpClient.get<TMDBMovieCreditsModel>(
      `${this.env.tmdbBaseUrl}/3/movie/${id}/credits`,
    );
  }

  getMovieRecommendations(id: string): Observable<TMDBMovieModel[]> {
    return this.httpClient
      .get<{
        results: TMDBMovieModel[];
      }>(`${this.env.tmdbBaseUrl}/3/movie/${id}/recommendations`)
      .pipe(map(({ results }) => results));
  }

  getMovieById(id: string): Observable<TMDBMovieDetailsModel> {
    return this.httpClient.get<TMDBMovieDetailsModel>(
      `${this.env.tmdbBaseUrl}/3/movie/${id}`,
    );
  }

  getMovieList(
    category: string,
    page: number = 1,
    sortBy = 'popularity.desc',
  ): Observable<TMDBMovieModel[]> {
    const { tmdbBaseUrl: baseUrl } = this.env;

    return this.httpClient
      .get<{ results: TMDBMovieModel[] }>(`${baseUrl}/3/movie/${category}`, {
        params: { page, sort_by: sortBy },
      })
      .pipe(map(({ results }) => results));
  }

  searchMovies(query: string, page = 1): Observable<TMDBMovieModel[]> {
    return this.httpClient
      .get<{ results: TMDBMovieModel[] }>(
        `${this.env.tmdbBaseUrl}/3/search/movie`,
        {
          params: { query, page },
        },
      )
      .pipe(
        tap(() => {
          if (query === 'throwError') {
            throw new Error('you searched for throwError, i am sorry');
          }
        }),
        map(({ results }) => results),
      );
  }

  getFavoriteMovies(): Observable<TMDBMovieModel[]> {
    console.log('requesting getFavoriteMovies');
    return timer(1500).pipe(
      map(() => this.getFavorites()),
      tap(() => console.log('requested getFavoriteMovies')),
    );
  }

  toggleFavorite(movie: TMDBMovieModel): Observable<boolean> {
    console.log('requesting toggleFavorite');
    return timer(1500).pipe(
      map(() => {
        console.log('requested toggleFavorite');
        if (this.getFavorites().find((f) => f.id === movie.id)) {
          this.setFavorites(remove(this.getFavorites(), movie, 'id'));
          return false;
        } else {
          this.setFavorites(
            insert(
              this.getFavorites(),
              movie as TMDBMovieModel & { comment: string },
            ),
          );
          return true;
        }
      }),
    );
  }

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

  getFavorites(): (TMDBMovieModel & { comment: string })[] {
    if (typeof localStorage === 'undefined') return [];
    const movies = localStorage.getItem('my-movies');
    return movies ? JSON.parse(movies) : [];
  }

  setFavorites(movies: (TMDBMovieModel & { comment: string })[]) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('my-movies', JSON.stringify(movies));
  }
}
