import { Inject, Injectable } from '@nestjs/common';
import type { Branch } from '@cinema/database';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { LOCATION_REPOSITORY, type LocationRepository } from '../domain/ports/location.repository';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';
import type { UpdateLocationDto } from '../dtos/update-location.dto';

@Injectable()
export class UpdateLocationUseCase {
  constructor(
    @Inject(LOCATION_REPOSITORY) private readonly locationRepo: LocationRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async execute(id: string, dto: UpdateLocationDto, userId: string, roleId: string, sourceIp?: string): Promise<Branch> {
    const existing = await this.locationRepo.findById(id);
    if (!existing) {
      throw new HttpProblemException({ type: '/problems/location-not-found', title: 'Location Not Found', status: 404, message: 'The requested location does not exist.' });
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await this.locationRepo.update(id, { ...dto, updatedById: userId });
      await this.audit.log(tx, { userId, roleId, entityName: 'branches', entityId: id, action: 'UPDATE', previousValue: existing as unknown as object, newValue: updated as unknown as object, sourceIp });
      return updated;
    });
  }
}
