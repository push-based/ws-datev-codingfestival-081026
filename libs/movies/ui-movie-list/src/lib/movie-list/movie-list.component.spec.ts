import { TestBed } from '@angular/core/testing';

import { MovieListComponent } from './movie-list.component';

describe('MovieListComponent', () => {
  it('creates', () => {
    expect(
      TestBed.createComponent(MovieListComponent).componentInstance,
    ).toBeTruthy();
  });
});
