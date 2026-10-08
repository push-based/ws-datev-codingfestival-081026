import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellComponent } from '@movies/movies/feature-app-shell';
import { DirtyCheckComponent } from '@movies/shared/utils';

@Component({
  selector: 'app-root',
  template: `
    <app-shell>
      <dirty-check />
      <router-outlet />
    </app-shell>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet, AppShellComponent, DirtyCheckComponent],
})
export class AppComponent {}
