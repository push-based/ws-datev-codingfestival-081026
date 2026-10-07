import { AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MovieService } from '@movies/movies/data-access';
import { MovieImagePipe } from '@movies/movies/util-movie-image';
import { MovieModel } from '@movies/shared/models';
import { of, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-movie-search-control',
  template: `
    <input
      #searchInput
      (blur)="onTouched()"
      (input)="searchTerm$.next(searchInput.value)"
    />
    @if (movies$ | async; as movies) {
      <div class="results">
        @for (movie of movies; track movie) {
          <button class="movie-result" (click)="selectMovie(movie)">
            <img
              [src]="movie.poster_path | movieImage"
              width="35"
              [alt]="movie.title"
            />
            <span>{{ movie.title }}</span>
          </button>
        }
      </div>
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MovieSearchControlComponent,
      multi: true,
    },
  ],
  styles: `
    :host {
      display: block;
    }

    input {
      width: 100%;
      padding: 1rem 1.2rem;
      font: inherit;
      font-size: var(--text-md);
      color: var(--palette-text-primary);
      background: var(--palette-background-default);
      border: 1px solid var(--palette-divider);
      border-radius: 0.8rem;
      outline: none;
      transition:
        border-color 150ms ease,
        box-shadow 150ms ease;
    }

    input:hover {
      border-color: var(--palette-action-active);
    }

    input:focus {
      border-color: var(--palette-primary-main);
      box-shadow: 0 0 0 0.3rem rgba(var(--palette-primary-main-rgb), 0.25);
    }

    .results {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      max-height: 350px;
      margin-top: 0.6rem;
      padding: 0.6rem;
      overflow: auto;
      background: var(--palette-background-paper);
      border: 1px solid var(--palette-divider);
      border-radius: 0.8rem;
      box-shadow: var(--theme-shadow-dropdown);
    }

    .movie-result {
      display: flex;
      align-items: center;
      gap: 1.2rem;
      padding: 0.6rem 0.8rem;
      font: inherit;
      font-size: var(--text-md);
      text-align: left;
      color: var(--palette-text-primary);
      background: transparent;
      border: none;
      border-radius: 0.6rem;
      cursor: pointer;
    }

    .movie-result:hover,
    .movie-result:focus-visible {
      background: var(--palette-action-hover);
      outline: none;
    }

    .movie-result img {
      flex: none;
      border-radius: 0.4rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AsyncPipe, MovieImagePipe],
})
export class MovieSearchControlComponent
  implements ControlValueAccessor, AfterViewInit
{
  constructor(private movieService: MovieService) {}

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  readonly searchTerm$ = new Subject<string>();

  movies$ = this.searchTerm$.pipe(
    switchMap((term) =>
      term ? this.movieService.searchMovies(term) : of(null),
    ),
  );

  onChange = (movie: MovieModel) => {};
  onTouched = () => {};

  private movieCache!: MovieModel;

  ngAfterViewInit(): void {
    if (this.movieCache) {
      this.searchInput.nativeElement.value = this.movieCache.title;
    }
  }

  selectMovie(movie: MovieModel) {
    this.onChange(movie);
    this.searchTerm$.next('');
    this.searchInput.nativeElement.value = movie.title;
  }

  writeValue(movie: MovieModel): void {
    if (!this.searchInput) {
      this.movieCache = movie;
    } else {
      this.searchInput!.nativeElement.value = movie ? movie.title : '';
    }
    this.searchTerm$.next('');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {}
}
