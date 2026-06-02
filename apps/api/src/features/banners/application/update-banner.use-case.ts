import { Inject, Injectable } from '@nestjs/common';
import type { Banner } from '@cinema/database';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { BANNER_REPOSITORY, type BannerRepository } from '../domain/ports/banner.repository';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';
import type { UpdateBannerDto } from '../dtos/update-banner.dto';

@Injectable()
export class UpdateBannerUseCase {
  constructor(
    @Inject(BANNER_REPOSITORY) private readonly bannerRepo: BannerRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async execute(id: string, dto: UpdateBannerDto, userId: string, roleId: string, sourceIp?: string): Promise<Banner> {
    const existing = await this.bannerRepo.findById(id);
    if (!existing) {
      throw new HttpProblemException({ type: '/problems/banner-not-found', title: 'Banner Not Found', status: 404, message: 'The requested banner does not exist.' });
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await this.bannerRepo.update(id, {
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        updatedById: userId,
      });
      await this.audit.log(tx, { userId, roleId, entityName: 'banners', entityId: id, action: 'UPDATE', previousValue: existing as unknown as object, newValue: updated as unknown as object, sourceIp });
      return updated;
    });
  }
}
