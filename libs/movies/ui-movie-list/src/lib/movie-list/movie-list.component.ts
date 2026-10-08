import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TMDBMovieModel } from '@movies/shared/models';
import { FastSvgComponent } from '@push-based/ngx-fast-svg';

import { MovieCardComponent } from '../movie-card/movie-card.component';

@Component({
  selector: 'movie-list',
  template: `
    @if (movies.length > 0) {
      @for (movie of movies; track trackByMovieId(i, movie); let i = $index) {
        <movie-card
          [index]="i"
          [routerLink]="['/movie', movie.id]"
          [loading]="favoritesLoading.has(movie.id)"
          [favorite]="favoriteMovieIds.has(movie.id)"
          (favoriteChange)="favoriteToggled.emit(movie)"
          [movie]="movie"
        />
      }
    } @else {
      <div class="no-movies">
        <fast-svg name="sad" size="50" />
        There are no movies to show
      </div>
    }
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(10rem, 35rem));
      gap: 4rem 2rem;
      place-content: space-between space-evenly;
      align-items: start;
      position: relative;
    }
  `,
  imports: [MovieCardComponent, RouterLink, FastSvgComponent],
})
export class MovieListComponent {
  @Input({ required: true }) movies!: TMDBMovieModel[];
  @Input() favoriteMovieIds: Set<string> = new Set<string>([]);
  @Input() favoritesLoading = new Set<string>();

  @Output() favoriteToggled = new EventEmitter<TMDBMovieModel>();

  trackByMovieId(index: number, movie: TMDBMovieModel) {
    return movie.id;
  }
}
