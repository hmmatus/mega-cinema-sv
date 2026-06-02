import { Controller, Get, Query } from '@nestjs/common';
import { ListBannersUseCase } from '../features/banners/application/list-banners.use-case';
import { ListMoviesUseCase } from '../features/movies/application/list-movies.use-case';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly listBanners: ListBannersUseCase,
    private readonly listMovies: ListMoviesUseCase,
  ) {}

  @Get('content')
  async getContent(@Query('branchId') _branchId?: string) {
    const [banners, featuredMovies, upcomingReleases, currentShowings] = await Promise.all([
      this.listBanners.getActive(),
      this.listMovies.getFeatured(10),
      this.listMovies.getUpcomingReleases(6),
      this.listMovies.getCurrentShowings(10),
    ]);

    return { banners, featuredMovies, upcomingReleases, currentShowings };
  }
}
