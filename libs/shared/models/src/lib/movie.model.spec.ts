import { TMDBMovieModel } from './movie.model';

// the library only holds types — check them at compile time
describe('TMDBMovieModel', () => {
  it('has an id', () => {
    expectTypeOf<TMDBMovieModel>().toHaveProperty('id').toEqualTypeOf<string>();
  });
});
