import { Module } from '@nestjs/common';
import { PrismaMovieRepository } from './infrastructure/adapters/prisma-movie.repository';
import { MovieArchivedListener } from './infrastructure/listeners/movie-archived.listener';
import { MOVIE_REPOSITORY } from './domain/ports/movie.repository';
import { ListMoviesUseCase } from './application/list-movies.use-case';
import { GetMovieUseCase } from './application/get-movie.use-case';
import { CreateMovieUseCase } from './application/create-movie.use-case';
import { UpdateMovieUseCase } from './application/update-movie.use-case';
import { ArchiveMovieUseCase } from './application/archive-movie.use-case';
import { MoviesController } from './movies.controller';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuditModule, AuthModule],
  controllers: [MoviesController],
  providers: [
    { provide: MOVIE_REPOSITORY, useClass: PrismaMovieRepository },
    ListMoviesUseCase,
    GetMovieUseCase,
    CreateMovieUseCase,
    UpdateMovieUseCase,
    ArchiveMovieUseCase,
    MovieArchivedListener,
  ],
  exports: [ListMoviesUseCase, GetMovieUseCase],
})
export class MoviesModule {}
