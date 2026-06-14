import { Module } from '@nestjs/common';
import { SupabaseStorageService } from '../../common/storage/supabase-storage.service';
import { MOVIE_REPOSITORY } from './domain/ports/movie.repository';
import { PrismaMovieRepository } from './infrastructure/adapters/prisma-movie.repository';
import { GetMoviesUseCase } from './application/get-movies.use-case';
import { ImportTmdbMovieUseCase } from './application/import-tmdb-movie.use-case';
import { MoviesController } from './movies.controller';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  controllers: [MoviesController],
  providers: [
    SupabaseStorageService,
    JwtAuthGuard,
    RolesGuard,
    { provide: MOVIE_REPOSITORY, useClass: PrismaMovieRepository },
    GetMoviesUseCase,
    ImportTmdbMovieUseCase,
  ],
  exports: [MOVIE_REPOSITORY],
})
export class MoviesModule {}
