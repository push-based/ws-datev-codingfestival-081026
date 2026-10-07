import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./movie/movie.routes').then((m) => m.movieRoutes),
  },
  {
    path: '**',
    loadComponent: () =>
      import('@movies/shared/feature-not-found').then(
        (m) => m.NotFoundPageComponent,
      ),
  },
];
