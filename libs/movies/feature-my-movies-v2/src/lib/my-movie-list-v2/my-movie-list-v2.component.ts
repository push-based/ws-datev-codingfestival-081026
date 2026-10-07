import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MovieSearchControlComponent } from '@movies/movies/ui-movie-list';
import { FastSvgComponent } from '@push-based/ngx-fast-svg';

/**
 * My Movies, built with Signal Forms during the exercises (`exercises/signal-forms-*.md`).
 * It starts as a shell: markup and styles, nothing wired up.
 * `MyMovieListComponent` (`/my-movies`) is the same page built with Reactive Forms, for comparison.
 */
@Component({
  selector: 'my-movie-list-v2',
  templateUrl: './my-movie-list-v2.component.html',
  styleUrls: ['./my-movie-list-v2.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MovieSearchControlComponent, FastSvgComponent],
})
export class MyMovieListV2Component {}
