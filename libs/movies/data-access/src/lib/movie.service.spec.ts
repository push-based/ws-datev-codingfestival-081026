import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Environment, provideEnvironment } from '@movies/shared/util-env';

import { MovieService } from './movie.service';

describe('MovieService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideEnvironment({ tmdbBaseUrl: 'https://tmdb' } as Environment),
      ],
    });
  });

  it('requests a movie list by category', () => {
    TestBed.inject(MovieService).getMovieList('popular').subscribe();

    const req = TestBed.inject(HttpTestingController).expectOne(
      (r) => r.url === 'https://tmdb/3/movie/popular',
    );
    expect(req.request.params.get('page')).toBe('1');
  });
});
