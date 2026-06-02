import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { LOCATION_REPOSITORY, type LocationRepository } from '../domain/ports/location.repository';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';

@Injectable()
export class ArchiveLocationUseCase {
  constructor(
    @Inject(LOCATION_REPOSITORY) private readonly locationRepo: LocationRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async execute(id: string, userId: string, roleId: string, sourceIp?: string): Promise<void> {
    const existing = await this.locationRepo.findById(id);
    if (!existing) {
      throw new HttpProblemException({ type: '/problems/location-not-found', title: 'Location Not Found', status: 404, message: 'The requested location does not exist.' });
    }
    await this.prisma.$transaction(async (tx) => {
      await this.locationRepo.update(id, { status: 'INACTIVE', updatedById: userId });
      await this.audit.log(tx, { userId, roleId, entityName: 'branches', entityId: id, action: 'ARCHIVE', previousValue: existing as unknown as object, newValue: { status: 'INACTIVE' }, sourceIp });
    });
  }
}
