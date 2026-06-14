import { Inject, Injectable } from '@nestjs/common';
import type { Movie } from '@cinema/database';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { MOVIE_REPOSITORY, type MovieRepository } from '../domain/ports/movie.repository';
import type { CreateMovieDto } from '../dtos/create-movie.dto';

@Injectable()
export class CreateMovieUseCase {
  constructor(
    @Inject(MOVIE_REPOSITORY) private readonly movieRepo: MovieRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async execute(dto: CreateMovieDto, userId: string, roleId: string, sourceIp?: string): Promise<Movie> {
    return this.prisma.$transaction(async (tx) => {
      const movie = await this.movieRepo.create({
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
        createdById: userId,
      });

      await this.audit.log(tx, {
        userId,
        roleId,
        entityName: 'movies',
        entityId: movie.id,
        action: 'CREATE',
        newValue: movie as unknown as object,
        sourceIp,
      });

      return movie;
    });
  }
}
