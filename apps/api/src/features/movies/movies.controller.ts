import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Movie } from '@cinema/database';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { ListMoviesUseCase } from './application/list-movies.use-case';
import { GetMovieUseCase } from './application/get-movie.use-case';
import { CreateMovieUseCase } from './application/create-movie.use-case';
import { UpdateMovieUseCase } from './application/update-movie.use-case';
import { ArchiveMovieUseCase } from './application/archive-movie.use-case';
import { ImportTmdbMovieUseCase } from './application/import-tmdb-movie.use-case';
import { CreateMovieDto } from './dtos/create-movie.dto';
import { UpdateMovieDto } from './dtos/update-movie.dto';
import { ListMoviesQueryDto } from './dtos/list-movies-query.dto';
import { ImportMovieDto } from './dtos/import-movie.dto';

@Controller('movies')
export class MoviesController {
  constructor(
    private readonly listMovies: ListMoviesUseCase,
    private readonly getMovie: GetMovieUseCase,
    private readonly createMovie: CreateMovieUseCase,
    private readonly updateMovie: UpdateMovieUseCase,
    private readonly archiveMovie: ArchiveMovieUseCase,
    private readonly importTmdbMovie: ImportTmdbMovieUseCase,
    private readonly config: ConfigService,
  ) {}

  @Get('featured')
  getFeatured(@Query('limit') limit?: string) {
    return this.listMovies.getFeatured(limit ? parseInt(limit, 10) : 10);
  }

  @Get('upcoming-releases')
  getUpcomingReleases(@Query('limit') limit?: string) {
    return this.listMovies.getUpcomingReleases(limit ? parseInt(limit, 10) : 6);
  }

  @Get('current-showings')
  getCurrentShowings(@Query('limit') limit?: string, @Query('branchId') _branchId?: string) {
    return this.listMovies.getCurrentShowings(limit ? parseInt(limit, 10) : 10);
  }

  @Get('')
  list(@Query() query: ListMoviesQueryDto) {
    return this.listMovies.execute(query, false);
  }

  @Post('admin/import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async importMovie(@Body() dto: ImportMovieDto): Promise<Movie> {
    const apiKey = this.config.getOrThrow('TMDB_API_KEY');
    return this.importTmdbMovie.execute(dto.tmdbId, apiKey);
  }

  @Post('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(
    @Body() dto: CreateMovieDto,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
  ) {
    return this.createMovie.execute(dto, user.id, user.role, ip);
  }

  @Get(':id/with-showtimes')
  getWithShowtimes(@Param('id') id: string) {
    return this.getMovie.execute(id, false, true);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Query('includeShowtimes') includeShowtimes?: string) {
    const withShowtimes = includeShowtimes !== 'false';
    return this.getMovie.execute(id, false, withShowtimes);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMovieDto,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
  ) {
    return this.updateMovie.execute(id, dto, user.id, user.role, ip);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  archive(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
  ) {
    return this.archiveMovie.execute(id, user.id, user.role, ip);
  }
}
