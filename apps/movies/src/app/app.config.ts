import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
  withXhr,
} from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideEnvironment } from '@movies/shared/util-env';
import { provideFastSVG } from '@push-based/ngx-fast-svg';

import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';
import { ReadAccessInterceptor } from './core/read-access.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideEnvironment(environment),
    provideRouter(appRoutes),
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideFastSVG({
      url: (name: string) => `assets/svg-icons/${name}.svg`,
      defaultSize: '12',
    }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ReadAccessInterceptor,
      multi: true,
    },
    // provideClientHydration(withEventReplay()),
  ],
};
