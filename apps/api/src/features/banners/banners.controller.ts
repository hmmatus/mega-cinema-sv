import { Body, Controller, Delete, Get, HttpCode, Ip, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { ListBannersUseCase } from './application/list-banners.use-case';
import { GetBannerUseCase } from './application/get-banner.use-case';
import { CreateBannerUseCase } from './application/create-banner.use-case';
import { UpdateBannerUseCase } from './application/update-banner.use-case';
import { ArchiveBannerUseCase } from './application/archive-banner.use-case';
import { ReorderBannersUseCase } from './application/reorder-banners.use-case';
import { CreateBannerDto } from './dtos/create-banner.dto';
import { UpdateBannerDto } from './dtos/update-banner.dto';
import { ListBannersQueryDto } from './dtos/list-banners-query.dto';
import { ReorderBannersDto } from './dtos/reorder-banners.dto';

@Controller('banners')
export class BannersController {
  constructor(
    private readonly listBanners: ListBannersUseCase,
    private readonly getBanner: GetBannerUseCase,
    private readonly createBanner: CreateBannerUseCase,
    private readonly updateBanner: UpdateBannerUseCase,
    private readonly archiveBanner: ArchiveBannerUseCase,
    private readonly reorderBanners: ReorderBannersUseCase,
  ) {}

  @Get('')
  list(@Query() query: ListBannersQueryDto) {
    return this.listBanners.execute(query, false);
  }

  @Post('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateBannerDto, @CurrentUser() user: AuthUser, @Ip() ip: string) {
    return this.createBanner.execute(dto, user.id, user.role, ip);
  }

  // IMPORTANT: /reorder MUST be registered before /:id
  @Post('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  reorder(@Body() dto: ReorderBannersDto, @CurrentUser() user: AuthUser, @Ip() ip: string) {
    return this.reorderBanners.execute(dto, user.id, user.role, ip);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.getBanner.execute(id, false);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto, @CurrentUser() user: AuthUser, @Ip() ip: string) {
    return this.updateBanner.execute(id, dto, user.id, user.role, ip);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  archive(@Param('id') id: string, @CurrentUser() user: AuthUser, @Ip() ip: string) {
    return this.archiveBanner.execute(id, user.id, user.role, ip);
  }
}
