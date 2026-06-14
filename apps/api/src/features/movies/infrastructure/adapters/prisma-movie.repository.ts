import { Injectable } from '@nestjs/common';
import type { Movie } from '@cinema/database';
import { PrismaService } from '../../../../prisma/prisma.service';
import type { CreateMovieData, MovieRepository } from '../../domain/ports/movie.repository';

@Injectable()
export class PrismaMovieRepository implements MovieRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Movie[]> {
    return this.prisma.movie.findMany();
  }

  findById(id: string): Promise<Movie | null> {
    return this.prisma.movie.findUnique({ where: { id } });
  }

  create(data: CreateMovieData): Promise<Movie> {
    return this.prisma.movie.create({
      data: {
        title: data.title,
        description: data.description,
        durationMinutes: data.durationMinutes,
        rating: data.rating,
        originalLanguage: data.originalLanguage,
        releaseDate: data.releaseDate,
        posterUrl: data.posterUrl,
        trailerUrl: data.trailerUrl,
        status: (data.status as any) ?? 'CARTELERA',
      },
    });
  }

  async upsertByTitle(data: CreateMovieData): Promise<Movie> {
    const existing = await this.prisma.movie.findFirst({
      where: { title: data.title },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.movie.create({
      data: {
        title: data.title,
        description: data.description,
        durationMinutes: data.durationMinutes,
        rating: data.rating,
        originalLanguage: data.originalLanguage,
        releaseDate: data.releaseDate,
        posterUrl: data.posterUrl,
        trailerUrl: data.trailerUrl,
        status: (data.status as any) ?? 'CARTELERA',
      },
    });
  }
}
