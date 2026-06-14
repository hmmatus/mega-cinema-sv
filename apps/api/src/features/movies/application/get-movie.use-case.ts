import { Inject, Injectable } from '@nestjs/common';
import { MOVIE_REPOSITORY, type MovieRepository, type MovieWithShowtimes } from '../domain/ports/movie.repository';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';

@Injectable()
export class GetMovieUseCase {
  constructor(@Inject(MOVIE_REPOSITORY) private readonly movieRepo: MovieRepository) {}

  async execute(id: string, isAdmin: boolean, includeShowtimes = true): Promise<MovieWithShowtimes> {
    const movie = includeShowtimes
      ? await this.movieRepo.findByIdWithShowtimes(id)
      : await this.movieRepo.findById(id).then((m) => m && { ...m, upcomingShowtimes: [] });

    if (!movie) this.notFound();

    if (!isAdmin && movie!.visibility !== 'PUBLIC') this.notFound();

    return movie!;
  }

  private notFound(): never {
    throw new HttpProblemException({
      type: '/problems/movie-not-found',
      title: 'Movie Not Found',
      status: 404,
      message: 'The requested movie does not exist.',
    });
  }
}
