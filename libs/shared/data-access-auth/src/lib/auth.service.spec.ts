import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => localStorage.clear());

  it('logs in and out', () => {
    const auth = TestBed.inject(AuthService);
    expect(auth.isAuthenticated).toBe(false);

    auth.login();
    expect(auth.isAuthenticated).toBe(true);

    auth.logout();
    expect(auth.isAuthenticated).toBe(false);
  });
});
