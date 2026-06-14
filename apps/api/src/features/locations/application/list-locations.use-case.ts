import { Inject, Injectable } from '@nestjs/common';
import type { BranchStatus } from '@cinema/database';
import { LOCATION_REPOSITORY, type LocationRepository, type PaginatedLocations } from '../domain/ports/location.repository';
import type { ListLocationsQueryDto } from '../dtos/list-locations-query.dto';

@Injectable()
export class ListLocationsUseCase {
  constructor(@Inject(LOCATION_REPOSITORY) private readonly locationRepo: LocationRepository) {}

  execute(query: ListLocationsQueryDto, isAdmin: boolean): Promise<PaginatedLocations> {
    const status: BranchStatus | undefined = isAdmin ? query.status : 'ACTIVE';
    return this.locationRepo.findMany(
      { status, city: query.city, search: query.search },
      { page: query.page ?? 0, pageSize: query.pageSize ?? 20, sortBy: query.sortBy ?? 'name', sortOrder: query.sortOrder ?? 'asc' },
    );
  }

  getByCity(city: string) {
    return this.locationRepo.findByCity(city);
  }
}
