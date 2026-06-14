import { Injectable } from '@nestjs/common';
import type { Movie, MovieStatus } from '@cinema/database';
import { PrismaService } from '../../../../prisma/prisma.service';
import type {
  CreateMovieData,
  MovieFilters,
  MoviePagination,
  MovieRepository,
  MovieWithShowtimes,
  PaginatedMovies,
  ShowtimeBasic,
  UpdateMovieData,
} from '../../domain/ports/movie.repository';

@Injectable()
export class PrismaMovieRepository implements MovieRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Movie[]> {
    return this.prisma.movie.findMany();
  }

  async findMany(filters: MovieFilters, pagination: MoviePagination): Promise<PaginatedMovies> {
    const { page, pageSize, sortBy, sortOrder } = pagination;
    const skip = page * pageSize;

    const where = this.buildWhere(filters);
    const orderBy = this.buildOrderBy(sortBy, sortOrder);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.movie.findMany({ where, orderBy, skip, take: pageSize }),
      this.prisma.movie.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return {
      data,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages - 1,
        hasPreviousPage: page > 0,
      },
    };
  }

  findById(id: string): Promise<Movie | null> {
    return this.prisma.movie.findUnique({ where: { id } });
  }

  async findByIdWithShowtimes(id: string): Promise<MovieWithShowtimes | null> {
    const movie = await this.prisma.movie.findUnique({ where: { id } });
    if (!movie) return null;
    const showtimes = await this.getUpcomingShowtimes(id, 5);
    return { ...movie, upcomingShowtimes: showtimes };
  }

  async findFeatured(limit: number): Promise<MovieWithShowtimes[]> {
    const movies = await this.prisma.movie.findMany({
      where: { featured: true, visibility: 'PUBLIC', status: { not: 'ARCHIVED' } },
      orderBy: { releaseDate: 'desc' },
      take: limit,
    });
    return Promise.all(movies.map(async (m) => ({ ...m, upcomingShowtimes: await this.getUpcomingShowtimes(m.id, 5) })));
  }

  async findByStatus(statuses: MovieStatus[], limit: number): Promise<MovieWithShowtimes[]> {
    const movies = await this.prisma.movie.findMany({
      where: { status: { in: statuses }, visibility: 'PUBLIC' },
      orderBy: { releaseDate: 'desc' },
      take: limit,
    });
    return Promise.all(movies.map(async (m) => ({ ...m, upcomingShowtimes: await this.getUpcomingShowtimes(m.id, 5) })));
  }

  create(data: CreateMovieData): Promise<Movie> {
    return this.prisma.movie.create({
      data: {
        title: data.title,
        description: data.description,
        durationMinutes: data.durationMinutes,
        rating: data.rating ?? undefined,
        originalLanguage: data.originalLanguage,
        status: data.status ?? 'UPCOMING',
        releaseDate: data.releaseDate,
        posterUrl: data.posterUrl,
        trailerUrl: data.trailerUrl,
        director: data.director,
        genres: data.genres ?? [],
        cast: data.cast ?? [],
        featured: data.featured ?? false,
        visibility: data.visibility ?? 'PUBLIC',
        metadata: data.metadata ?? undefined,
        createdById: data.createdById,
      },
    });
  }

  update(id: string, data: UpdateMovieData): Promise<Movie> {
    return this.prisma.movie.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        durationMinutes: data.durationMinutes,
        rating: data.rating ?? undefined,
        originalLanguage: data.originalLanguage,
        status: data.status,
        releaseDate: data.releaseDate ?? undefined,
        posterUrl: data.posterUrl,
        trailerUrl: data.trailerUrl,
        director: data.director,
        genres: data.genres,
        cast: data.cast,
        featured: data.featured,
        visibility: data.visibility,
        metadata: data.metadata ?? undefined,
        updatedById: data.updatedById ?? undefined,
      },
    });
  }

  async upsertByTitle(data: CreateMovieData): Promise<Movie> {
    const existing = await this.prisma.movie.findFirst({ where: { title: data.title } });
    if (existing) return existing;
    return this.create(data);
  }

  async findFutureShowtimeIds(movieId: string): Promise<string[]> {
    const showtimes = await this.prisma.showtime.findMany({
      where: {
        movieId,
        startAt: { gt: new Date() },
        status: { in: ['PROGRAMADA', 'ACTIVA'] },
      },
      select: { id: true },
    });
    return showtimes.map((s) => s.id);
  }

  private async getUpcomingShowtimes(movieId: string, limit: number): Promise<ShowtimeBasic[]> {
    const showtimes = await this.prisma.showtime.findMany({
      where: { movieId, startAt: { gt: new Date() }, status: { in: ['PROGRAMADA', 'ACTIVA'] } },
      include: { room: { include: { branch: true } } },
      orderBy: { startAt: 'asc' },
      take: limit,
    });

    return Promise.all(
      showtimes.map(async (s) => {
        const blockedSeats = await this.prisma.reservationSeat.count({
          where: {
            reservation: { showtimeId: s.id, status: { in: ['PENDIENTE', 'BLOQUEADA', 'PAGADA'] } },
            status: { in: ['BLOQUEADO', 'CONFIRMADO'] },
          },
        });
        return {
          id: s.id,
          startAt: s.startAt,
          branchId: s.room.branchId,
          branchName: s.room.branch.name,
          roomName: s.room.name,
          availableSeats: s.room.capacity - blockedSeats,
          basePrice: Number(s.basePrice),
        };
      }),
    );
  }

  private buildWhere(filters: MovieFilters) {
    return {
      ...(filters.status && { status: filters.status }),
      ...(filters.visibility && { visibility: filters.visibility }),
      ...(filters.featured !== undefined && { featured: filters.featured }),
      ...(filters.genre && { genres: { has: filters.genre } }),
      ...(filters.rating && { rating: filters.rating }),
      ...(filters.search && { title: { contains: filters.search, mode: 'insensitive' as const } }),
    };
  }

  private buildOrderBy(sortBy: string, sortOrder: 'asc' | 'desc') {
    const map: Record<string, object> = {
      releaseDate: { releaseDate: sortOrder },
      createdAt: { createdAt: sortOrder },
      updatedAt: { updatedAt: sortOrder },
      featured: { featured: sortOrder },
    };
    return map[sortBy] ?? { releaseDate: sortOrder };
  }
}
