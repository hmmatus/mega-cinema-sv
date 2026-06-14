import { Inject, Injectable } from '@nestjs/common';
import type { Branch } from '@cinema/database';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { LOCATION_REPOSITORY, type LocationRepository } from '../domain/ports/location.repository';
import type { CreateLocationDto } from '../dtos/create-location.dto';

@Injectable()
export class CreateLocationUseCase {
  constructor(
    @Inject(LOCATION_REPOSITORY) private readonly locationRepo: LocationRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async execute(dto: CreateLocationDto, userId: string, roleId: string, sourceIp?: string): Promise<Branch> {
    return this.prisma.$transaction(async (tx) => {
      const branch = await this.locationRepo.create({ ...dto, createdById: userId });
      await this.audit.log(tx, { userId, roleId, entityName: 'branches', entityId: branch.id, action: 'CREATE', newValue: branch as unknown as object, sourceIp });
      return branch;
    });
  }
}
