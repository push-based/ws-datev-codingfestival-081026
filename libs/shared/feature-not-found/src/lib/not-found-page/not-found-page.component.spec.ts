import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NotFoundPageComponent } from './not-found-page.component';

describe('NotFoundPageComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('creates', () => {
    expect(
      TestBed.createComponent(NotFoundPageComponent).componentInstance,
    ).toBeTruthy();
  });
});
