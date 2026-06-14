import { Inject, Injectable } from '@nestjs/common';
import type { Banner } from '@cinema/database';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { BANNER_REPOSITORY, type BannerRepository } from '../domain/ports/banner.repository';
import type { CreateBannerDto } from '../dtos/create-banner.dto';

@Injectable()
export class CreateBannerUseCase {
  constructor(
    @Inject(BANNER_REPOSITORY) private readonly bannerRepo: BannerRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async execute(dto: CreateBannerDto, userId: string, roleId: string, sourceIp?: string): Promise<Banner> {
    return this.prisma.$transaction(async (tx) => {
      const banner = await this.bannerRepo.create({
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        createdById: userId,
      });
      await this.audit.log(tx, { userId, roleId, entityName: 'banners', entityId: banner.id, action: 'CREATE', newValue: banner as unknown as object, sourceIp });
      return banner;
    });
  }
}
