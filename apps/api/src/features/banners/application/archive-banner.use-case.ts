import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { BANNER_REPOSITORY, type BannerRepository } from '../domain/ports/banner.repository';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';

@Injectable()
export class ArchiveBannerUseCase {
  constructor(
    @Inject(BANNER_REPOSITORY) private readonly bannerRepo: BannerRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async execute(id: string, userId: string, roleId: string, sourceIp?: string): Promise<void> {
    const existing = await this.bannerRepo.findById(id);
    if (!existing) {
      throw new HttpProblemException({ type: '/problems/banner-not-found', title: 'Banner Not Found', status: 404, message: 'The requested banner does not exist.' });
    }
    await this.prisma.$transaction(async (tx) => {
      await this.bannerRepo.update(id, { status: 'INACTIVE', updatedById: userId });
      await this.audit.log(tx, { userId, roleId, entityName: 'banners', entityId: id, action: 'ARCHIVE', previousValue: existing as unknown as object, newValue: { status: 'INACTIVE' }, sourceIp });
    });
  }
}
