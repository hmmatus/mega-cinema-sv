import { Inject, Injectable } from '@nestjs/common';
import type { Banner } from '@cinema/database';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { BANNER_REPOSITORY, type BannerRepository } from '../domain/ports/banner.repository';
import type { ReorderBannersDto } from '../dtos/reorder-banners.dto';

@Injectable()
export class ReorderBannersUseCase {
  constructor(
    @Inject(BANNER_REPOSITORY) private readonly bannerRepo: BannerRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async execute(dto: ReorderBannersDto, userId: string, roleId: string, sourceIp?: string): Promise<Banner[]> {
    const ids = dto.banners.map((b) => b.id);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('Duplicate banner IDs in reorder request');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await this.bannerRepo.reorder(dto.banners);
      await this.audit.log(tx, {
        userId,
        roleId,
        entityName: 'banners',
        entityId: 'multiple',
        action: 'REORDER',
        newValue: { banners: dto.banners },
        sourceIp,
      });
      return updated;
    });
  }
}
