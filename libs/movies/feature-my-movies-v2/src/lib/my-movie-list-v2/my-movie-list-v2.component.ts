import { Component, inject, signal } from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  minLength,
  required,
} from '@angular/forms/signals';
import { MovieService } from '@movies/movies/data-access';
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
  imports: [MovieSearchControlComponent, FastSvgComponent, FormField, FormRoot],
})
export class MyMovieListV2Component {
  protected readonly addModel = signal<AddMovieModel>({
    movie: null,
    comment: '',
  });

  private movieService = inject(MovieService);

  protected readonly addForm = form(
    this.addModel,
    (path) => {
      required(path.movie, { message: 'Entering a title is required' });
      required(path.comment, { message: 'Entering a comment is required' });
      minLength(path.comment, 5, {
        message: ({ value }) =>
          `Please enter at least 5 characters, right now you've entered ${value().length}`,
      });
    },
    {
      submission: {
        action: async (addForm) => {
          const { movie, comment } = addForm().value();
          const favorite = { ...(movie as TMDBMovieModel), comment };

          try {
            await this.movieService.addFavorite(favorite);
          } catch (error) {
            addForm.comment().fieldTree().focusBoundControl();
            return {
              kind: 'server',
              message: (error as Error).message,
              fieldTree: addForm.comment,
            };
          }

          this.reset();
          return undefined;
        },
        onInvalid: (addForm) => {
          addForm().errorSummary()[0]?.fieldTree().focusBoundControl();
        },
        ignoreValidators: 'none',
      },
    },
  );

  reset(): void {
    this.addForm().reset({ movie: null, comment: '' });
  }
}
