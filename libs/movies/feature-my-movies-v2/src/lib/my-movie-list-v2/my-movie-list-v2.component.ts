import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { MovieSearchControlComponent } from '@movies/movies/ui-movie-list';
import { TMDBMovieModel } from '@movies/shared/models';
import { FastSvgComponent } from '@push-based/ngx-fast-svg';

interface AddMovieModel {
  movie: TMDBMovieModel | null;
  comment: string;
}

/**
 * My Movies, built with Signal Forms during the exercises (`exercises/signal-forms-*.md`).
 * It starts as a shell: markup and styles, nothing wired up.
 * `MyMovieListComponent` (`/my-movies`) is the same page built with Reactive Forms, for comparison.
 */
@Component({
  selector: 'my-movie-list-v2',
  templateUrl: './my-movie-list-v2.component.html',
  styleUrls: ['./my-movie-list-v2.component.scss'],
  imports: [MovieSearchControlComponent, FastSvgComponent, FormField],
})
export class MyMovieListV2Component {
  protected readonly addModel = signal<AddMovieModel>({
    movie: null,
    comment: '',
  });

  protected readonly addForm = form(this.addModel);

  add(event: Event): void {
    event.preventDefault();
    console.log('submitted', this.addModel());
    this.reset();
  }

  reset(): void {
    this.addModel.set({ movie: null, comment: '' });
  }
}
