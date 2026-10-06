import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppShellComponent } from './app-shell/app-shell.component';

@Component({
  selector: 'app-root',
  template: `
    <app-shell>
      <router-outlet />
    </app-shell>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet, AppShellComponent],
})
export class AppComponent {}
