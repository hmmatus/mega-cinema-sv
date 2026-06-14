import { Inject, Injectable } from '@nestjs/common';
import type { Movie } from '@cinema/database';
import { MOVIE_REPOSITORY, type MovieRepository } from '../domain/ports/movie.repository';

@Injectable()
export class GetMoviesUseCase {
  constructor(
    @Inject(MOVIE_REPOSITORY) private readonly movieRepo: MovieRepository,
  ) {}

  async execute(): Promise<Movie[]> {
    return this.movieRepo.findAll();
  }
}
