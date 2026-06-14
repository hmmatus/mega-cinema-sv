import { Inject, Injectable } from '@nestjs/common';
import { LOCATION_REPOSITORY, type LocationRepository, type LocationWithDetails } from '../domain/ports/location.repository';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';

@Injectable()
export class GetLocationUseCase {
  constructor(@Inject(LOCATION_REPOSITORY) private readonly locationRepo: LocationRepository) {}

  async execute(id: string, includeDetails = true): Promise<LocationWithDetails> {
    const location = includeDetails
      ? await this.locationRepo.findByIdWithDetails(id)
      : await this.locationRepo.findById(id).then((b) => b && { ...b, rooms: [], totalRooms: 0, totalSeats: 0 });

    if (!location) {
      throw new HttpProblemException({ type: '/problems/location-not-found', title: 'Location Not Found', status: 404, message: 'The requested location does not exist.' });
    }
    return location;
  }
}
