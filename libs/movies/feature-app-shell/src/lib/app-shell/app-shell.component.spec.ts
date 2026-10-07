import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Environment, provideEnvironment } from '@movies/shared/util-env';

import { AppShellComponent } from './app-shell.component';

describe('AppShellComponent', () => {
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
      TestBed.createComponent(AppShellComponent).componentInstance,
    ).toBeTruthy();
  });
});
