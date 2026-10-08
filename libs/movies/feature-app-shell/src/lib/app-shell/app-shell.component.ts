import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MovieService } from '@movies/movies/data-access';
import { AuthService } from '@movies/shared/data-access-auth';
import {
  DarkModeToggleComponent,
  HamburgerButtonComponent,
  SearchBarComponent,
  SideDrawerComponent,
} from '@movies/shared/ui-design-system';
import { TrackingService } from '@movies/shared/utils';
import { FastSvgComponent } from '@push-based/ngx-fast-svg';

@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    SideDrawerComponent,
    RouterLinkActive,
    RouterLink,
    FastSvgComponent,
    HamburgerButtonComponent,
    SearchBarComponent,
    ReactiveFormsModule,
    FormsModule,
    DarkModeToggleComponent,
    AsyncPipe,
  ],
})
export class AppShellComponent {
  constructor(
    protected authService: AuthService,
    private movieService: MovieService,
    private router: Router,
    private trackingService: TrackingService,
  ) {}

  genres$ = this.movieService.getGenres();

  sideDrawerOpen = signal(false);

  searchValue = signal('');

  setSearchValue(value: string) {
    this.searchValue.set(value);
    this.router.navigate(['search', value]);
  }

  toggleSideDrawer() {
    this.sideDrawerOpen.update((open) => !open);
  }

  trackNavigation(route: string) {
    this.trackingService.trackEvent(`nav to: ${route}`);
  }
}
