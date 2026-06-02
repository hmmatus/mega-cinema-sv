import { Inject, Injectable } from '@nestjs/common';
import type { Movie } from '@cinema/database';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { MOVIE_REPOSITORY, type MovieRepository } from '../domain/ports/movie.repository';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';
import type { UpdateMovieDto } from '../dtos/update-movie.dto';

@Injectable()
export class UpdateMovieUseCase {
  constructor(
    @Inject(MOVIE_REPOSITORY) private readonly movieRepo: MovieRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async execute(id: string, dto: UpdateMovieDto, userId: string, roleId: string, sourceIp?: string): Promise<Movie> {
    const existing = await this.movieRepo.findById(id);
    if (!existing) {
      throw new HttpProblemException({ type: '/problems/movie-not-found', title: 'Movie Not Found', status: 404, message: 'The requested movie does not exist.' });
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await this.movieRepo.update(id, {
        title: dto.title,
        description: dto.description,
        durationMinutes: dto.duration,
        rating: dto.rating,
        originalLanguage: dto.originalLanguage,
        status: dto.status,
        releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : undefined,
        posterUrl: dto.posterUrl,
        trailerUrl: dto.trailerUrl,
        director: dto.director,
        genres: dto.genres,
        cast: dto.cast,
        featured: dto.featured,
        visibility: dto.visibility,
        metadata: dto.metadata,
        updatedById: userId,
      });

      await this.audit.log(tx, {
        userId,
        roleId,
        entityName: 'movies',
        entityId: id,
        action: 'UPDATE',
        previousValue: existing as unknown as object,
        newValue: updated as unknown as object,
        sourceIp,
      });

      return updated;
    });
  }
}
