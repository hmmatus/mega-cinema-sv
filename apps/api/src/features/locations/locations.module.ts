import { Module } from '@nestjs/common';
import { PrismaLocationRepository } from './infrastructure/adapters/prisma-location.repository';
import { LOCATION_REPOSITORY } from './domain/ports/location.repository';
import { ListLocationsUseCase } from './application/list-locations.use-case';
import { GetLocationUseCase } from './application/get-location.use-case';
import { CreateLocationUseCase } from './application/create-location.use-case';
import { UpdateLocationUseCase } from './application/update-location.use-case';
import { ArchiveLocationUseCase } from './application/archive-location.use-case';
import { FindNearbyLocationsUseCase } from './application/find-nearby-locations.use-case';
import { LocationsController } from './locations.controller';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuditModule, AuthModule],
  controllers: [LocationsController],
  providers: [
    { provide: LOCATION_REPOSITORY, useClass: PrismaLocationRepository },
    ListLocationsUseCase,
    GetLocationUseCase,
    CreateLocationUseCase,
    UpdateLocationUseCase,
    ArchiveLocationUseCase,
    FindNearbyLocationsUseCase,
  ],
  exports: [ListLocationsUseCase],
})
export class LocationsModule {}
