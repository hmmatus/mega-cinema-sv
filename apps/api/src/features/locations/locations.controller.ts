import { Body, Controller, Delete, Get, HttpCode, Ip, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { ListLocationsUseCase } from './application/list-locations.use-case';
import { GetLocationUseCase } from './application/get-location.use-case';
import { CreateLocationUseCase } from './application/create-location.use-case';
import { UpdateLocationUseCase } from './application/update-location.use-case';
import { ArchiveLocationUseCase } from './application/archive-location.use-case';
import { FindNearbyLocationsUseCase } from './application/find-nearby-locations.use-case';
import { CreateLocationDto } from './dtos/create-location.dto';
import { UpdateLocationDto } from './dtos/update-location.dto';
import { ListLocationsQueryDto } from './dtos/list-locations-query.dto';

@Controller('locations')
export class LocationsController {
  constructor(
    private readonly listLocations: ListLocationsUseCase,
    private readonly getLocation: GetLocationUseCase,
    private readonly createLocation: CreateLocationUseCase,
    private readonly updateLocation: UpdateLocationUseCase,
    private readonly archiveLocation: ArchiveLocationUseCase,
    private readonly findNearby: FindNearbyLocationsUseCase,
  ) {}

  @Get('nearby')
  getNearby(
    @Query('latitude') lat: string,
    @Query('longitude') lon: string,
    @Query('radiusKm') radius?: string,
  ) {
    return this.findNearby.execute(parseFloat(lat), parseFloat(lon), radius ? parseFloat(radius) : 15);
  }

  @Get('by-city/:city')
  getByCity(@Param('city') city: string) {
    return this.listLocations.getByCity(city);
  }

  @Get('')
  list(@Query() query: ListLocationsQueryDto) {
    return this.listLocations.execute(query, false);
  }

  @Post('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateLocationDto, @CurrentUser() user: AuthUser, @Ip() ip: string) {
    return this.createLocation.execute(dto, user.id, user.role, ip);
  }

  @Get(':id/with-details')
  getWithDetails(@Param('id') id: string) {
    return this.getLocation.execute(id, true);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Query('includeDetails') includeDetails?: string) {
    return this.getLocation.execute(id, includeDetails !== 'false');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateLocationDto, @CurrentUser() user: AuthUser, @Ip() ip: string) {
    return this.updateLocation.execute(id, dto, user.id, user.role, ip);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  archive(@Param('id') id: string, @CurrentUser() user: AuthUser, @Ip() ip: string) {
    return this.archiveLocation.execute(id, user.id, user.role, ip);
  }
}
