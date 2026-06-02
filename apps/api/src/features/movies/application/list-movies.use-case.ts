import { Inject, Injectable } from '@nestjs/common';
import type { MovieVisibility } from '@cinema/database';
import { MOVIE_REPOSITORY, type MovieRepository, type PaginatedMovies } from '../domain/ports/movie.repository';
import type { ListMoviesQueryDto } from '../dtos/list-movies-query.dto';

@Injectable()
export class ListMoviesUseCase {
  constructor(@Inject(MOVIE_REPOSITORY) private readonly movieRepo: MovieRepository) {}

  execute(query: ListMoviesQueryDto, isAdmin: boolean): Promise<PaginatedMovies> {
    const visibility: MovieVisibility | undefined = isAdmin ? undefined : 'PUBLIC';
    return this.movieRepo.findMany(
      {
        status: query.status,
        visibility,
        featured: query.featured,
        genre: query.genre,
        rating: query.rating,
        search: query.search,
      },
      {
        page: query.page ?? 0,
        pageSize: query.pageSize ?? 20,
        sortBy: query.sortBy ?? 'releaseDate',
        sortOrder: query.sortOrder ?? 'desc',
      },
    );
  }

  getFeatured(limit = 10) {
    return this.movieRepo.findFeatured(limit);
  }

  getUpcomingReleases(limit = 6) {
    return this.movieRepo.findByStatus(['UPCOMING', 'PRERELEASE'], limit);
  }

  getCurrentShowings(limit = 10) {
    return this.movieRepo.findByStatus(['RELEASED'], limit);
  }
}
