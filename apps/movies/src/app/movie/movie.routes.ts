import { Routes } from '@angular/router';
import { AuthGuard } from '@movies/shared/data-access-auth';

export const movieRoutes: Routes = [
  {
    path: 'list/:category',
    loadComponent: () =>
      import('@movies/movies/feature-movie-list').then(
        (m) => m.MovieListPageComponent,
      ),
  },
  {
    path: 'list/genre/:id',
    loadComponent: () =>
      import('@movies/movies/feature-movie-list').then(
        (m) => m.MovieListPageComponent,
      ),
  },
  {
    path: 'movie/:id',
    loadComponent: () =>
      import('@movies/movies/feature-movie-detail').then(
        (m) => m.MovieDetailPageComponent,
      ),
  },
  {
    path: 'search/:query',
    loadComponent: () =>
      import('@movies/movies/feature-movie-search').then(
        (m) => m.MovieSearchPageComponent,
      ),
  },
  {
    path: 'my-movies',
    loadComponent: () =>
      import('@movies/movies/feature-my-movies').then(
        (m) => m.MyMovieListComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'my-movies-v2',
    loadComponent: () =>
      import('@movies/movies/feature-my-movies-v2').then(
        (m) => m.MyMovieListV2Component,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: 'list/popular',
    pathMatch: 'full',
  },
];
