import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Movie } from '@cinema/database';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetMoviesUseCase } from './application/get-movies.use-case';
import { ImportTmdbMovieUseCase } from './application/import-tmdb-movie.use-case';
import { ImportMovieDto } from './dtos/import-movie.dto';

@Controller('movies')
export class MoviesController {
  constructor(
    private readonly getMoviesUseCase: GetMoviesUseCase,
    private readonly importTmdbMovieUseCase: ImportTmdbMovieUseCase,
    private readonly config: ConfigService,
  ) {}

  @Get('')
  async getMovies(): Promise<Movie[]> {
    return this.getMoviesUseCase.execute();
  }

  @Post('admin/import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async importMovie(@Body() dto: ImportMovieDto): Promise<Movie> {
    const apiKey = this.config.getOrThrow('TMDB_API_KEY');
    return this.importTmdbMovieUseCase.execute(dto.tmdbId, apiKey);
  }
}
