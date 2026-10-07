import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Environment, provideEnvironment } from '@movies/shared/util-env';

import { MovieListPageComponent } from './movie-list-page.component';

describe('MovieListPageComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideEnvironment({} as Environment),
      ],
    });
  });

  it('creates', () => {
    expect(
      TestBed.createComponent(MovieListPageComponent).componentInstance,
    ).toBeTruthy();
  });
});
