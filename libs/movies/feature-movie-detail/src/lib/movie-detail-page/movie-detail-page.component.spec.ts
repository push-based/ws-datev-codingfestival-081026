import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Environment, provideEnvironment } from '@movies/shared/util-env';

import { MovieDetailPageComponent } from './movie-detail-page.component';

describe('MovieDetailPageComponent', () => {
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
      TestBed.createComponent(MovieDetailPageComponent).componentInstance,
    ).toBeTruthy();
  });
});
