import { TestBed } from '@angular/core/testing';

import { Environment, injectEnv, provideEnvironment } from './env';

describe('injectEnv', () => {
  it('returns the provided environment', () => {
    const env = { production: true } as Environment;
    TestBed.configureTestingModule({ providers: [provideEnvironment(env)] });

    expect(TestBed.runInInjectionContext(() => injectEnv())).toBe(env);
  });
});
