import { inject, InjectionToken, Provider } from '@angular/core';

export interface Environment {
  production: boolean;
  tmdbBaseUrl: string;
  apiV3: string;
  apiV4: string;
  tmdbApiKey: string;
  tmdbApiReadAccessKey: string;
}

export const ENV_TOKEN = new InjectionToken<Environment>('ENV_TOKEN');

export function provideEnvironment(env: Environment): Provider {
  return { provide: ENV_TOKEN, useValue: env };
}

export function injectEnv(): Environment {
  return inject(ENV_TOKEN);
}
