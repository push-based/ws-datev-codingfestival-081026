import { MovieImagePipe } from './movie-image.pipe';

describe('MovieImagePipe', () => {
  const pipe = new MovieImagePipe();

  it('builds a w780 TMDB url by default', () => {
    expect(pipe.transform('/poster.jpg')).toBe(
      'https://image.tmdb.org/t/p/w780/poster.jpg',
    );
  });

  it('uses the given width', () => {
    expect(pipe.transform('/poster.jpg', 342)).toBe(
      'https://image.tmdb.org/t/p/w342/poster.jpg',
    );
  });

  it('falls back to the placeholder without a path', () => {
    expect(pipe.transform(undefined)).toBe(
      '/assets/images/no_poster_available.jpg',
    );
  });
});
