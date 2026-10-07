import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellComponent } from '@movies/movies/feature-app-shell';

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
