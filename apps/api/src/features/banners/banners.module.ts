import { Module } from '@nestjs/common';
import { PrismaBannerRepository } from './infrastructure/adapters/prisma-banner.repository';
import { BANNER_REPOSITORY } from './domain/ports/banner.repository';
import { ListBannersUseCase } from './application/list-banners.use-case';
import { GetBannerUseCase } from './application/get-banner.use-case';
import { CreateBannerUseCase } from './application/create-banner.use-case';
import { UpdateBannerUseCase } from './application/update-banner.use-case';
import { ArchiveBannerUseCase } from './application/archive-banner.use-case';
import { ReorderBannersUseCase } from './application/reorder-banners.use-case';
import { BannersController } from './banners.controller';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuditModule, AuthModule],
  controllers: [BannersController],
  providers: [
    { provide: BANNER_REPOSITORY, useClass: PrismaBannerRepository },
    ListBannersUseCase,
    GetBannerUseCase,
    CreateBannerUseCase,
    UpdateBannerUseCase,
    ArchiveBannerUseCase,
    ReorderBannersUseCase,
  ],
  exports: [ListBannersUseCase, GetBannerUseCase],
})
export class BannersModule {}
